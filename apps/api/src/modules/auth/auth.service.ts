import {
  Injectable,
  OnModuleInit,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
    await this.seedDefaultMerchant();
  }

  async seedDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@osmelhoresdacidade.com.br';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existing = await this.prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase() },
    });

    if (!existing) {
      const passwordHash = await argon2.hash(adminPassword);
      await this.prisma.user.create({
        data: {
          name: 'Administrador Master',
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: Role.ADMIN,
          isEmailVerified: true,
          isActive: true,
        },
      });
      console.log(`🛡️ Usuário Administrador Master provisionado com sucesso: ${adminEmail}`);
    }
  }

  async seedDefaultMerchant() {
    const merchantEmail = 'comerciante@osmelhoresdacidade.com.br';
    const merchantPassword = 'Comerciante@123456';

    let merchant = await this.prisma.user.findUnique({
      where: { email: merchantEmail.toLowerCase() },
      include: { merchantProfile: true },
    });

    if (!merchant) {
      const passwordHash = await argon2.hash(merchantPassword);
      merchant = await this.prisma.user.create({
        data: {
          name: 'Comerciante Parceiro',
          email: merchantEmail.toLowerCase(),
          passwordHash,
          phone: '(64) 99234-5678',
          role: Role.MERCHANT,
          isEmailVerified: true,
          isActive: true,
          merchantProfile: {
            create: {
              companyName: 'Restaurante Nonna Mia Ltda',
              cnpj: '12.345.678/0001-90',
              phone: '(64) 3453-1234',
              whatsapp: '(64) 99234-5678',
              isApproved: true,
              approvedAt: new Date(),
            },
          },
        },
        include: { merchantProfile: true },
      });
      console.log(`🏪 Usuário Comerciante Parceiro provisionado com sucesso: ${merchantEmail}`);
    }

    // Vincular um estabelecimento de exemplo ao comerciante se existir
    if (merchant.merchantProfile) {
      const listing = await this.prisma.listing.findFirst({
        where: { slug: 'restaurante-nonna-mia' },
      });

      if (listing) {
        await this.prisma.listingOwner.upsert({
          where: {
            listingId_merchantProfileId: {
              listingId: listing.id,
              merchantProfileId: merchant.merchantProfile.id,
            },
          },
          update: {},
          create: {
            listingId: listing.id,
            merchantProfileId: merchant.merchantProfile.id,
            role: 'OWNER',
          },
        });
      }
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Já existe uma conta cadastrada com este e-mail.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const chosenRole = dto.role === Role.ADMIN ? Role.USER : dto.role || Role.USER;

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        phone: dto.phone,
        role: chosenRole,
        isEmailVerified: false,
        ...(chosenRole === Role.MERCHANT
          ? {
              merchantProfile: {
                create: {
                  companyName: dto.companyName || dto.name,
                  cnpj: dto.cnpj,
                  phone: dto.phone,
                  whatsapp: dto.phone,
                  isApproved: false,
                },
              },
            }
          : {}),
      },
      include: {
        merchantProfile: true,
      },
    });

    // Gerar token de verificação de e-mail (válido por 48 horas)
    const verificationRawToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        tokenHash: this.hashToken(verificationRawToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    return {
      message: 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Em ambiente de teste/dev facilitado, retornamos o token para validação imediata
      verificationToken: verificationRawToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Sua conta está desativada. Entre em contato com o suporte.');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    const hashed = this.hashToken(refreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: {
        user: {
          include: {
            merchantProfile: true,
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada ou token de atualização inválido.');
    }

    // Rotacionar token: revogar o atual
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(tokenRecord.user);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { success: true };
    const hashed = this.hashToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashed },
      data: { isRevoked: true },
    });

    return { success: true, message: 'Logout realizado com sucesso.' };
  }

  async verifyEmail(token: string) {
    const hashed = this.hashToken(token);

    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashed },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Token de validação expirado ou inválido.');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    });

    await this.prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    return { success: true, message: 'E-mail confirmado com sucesso!' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: true, message: 'Se o e-mail estiver cadastrado, as instruções serão enviadas.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash: this.hashToken(resetToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      },
    });

    return {
      success: true,
      message: 'Instruções de redefinição de senha geradas.',
      resetToken, // Retornado para integração em dev
    };
  }

  async resetPassword(token: string, newPass: string) {
    const hashed = this.hashToken(token);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashed },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Token de redefinição expirado ou inválido.');
    }

    const passwordHash = await argon2.hash(newPass);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: record.id },
    });

    return { success: true, message: 'Senha alterada com sucesso! Você já pode entrar.' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'jwt-access-super-secret-key-change-in-prod',
      expiresIn: '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(rawRefreshToken),
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        merchantProfile: user.merchantProfile,
      },
    };
  }

  // --- GESTÃO DE PERFIL E DADOS DA CONTA DO COMERCIANTE ---

  async getMerchantProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let merchantProfile = user.merchantProfile;
    if (!merchantProfile) {
      merchantProfile = await this.prisma.merchantProfile.create({
        data: {
          userId,
          companyName: user.name || 'Empresa Parceira',
          isApproved: true,
          approvedAt: new Date(),
        },
      });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      merchantProfile,
    };
  }

  async updateMerchantProfile(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { merchantProfile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Atualiza dados do usuário
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });

    // Atualiza ou cria perfil de comerciante
    const updatedProfile = await this.prisma.merchantProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: dto.companyName || user.name,
        legalName: dto.legalName,
        cnpj: dto.cnpj,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        pixKey: dto.pixKey,
        pixKeyType: dto.pixKeyType,
        bankName: dto.bankName,
        bankAgency: dto.bankAgency,
        bankAccount: dto.bankAccount,
        address: dto.address,
        isApproved: true,
        approvedAt: new Date(),
      },
      update: {
        companyName: dto.companyName !== undefined ? dto.companyName.trim() : undefined,
        legalName: dto.legalName !== undefined ? dto.legalName.trim() : undefined,
        cnpj: dto.cnpj !== undefined ? dto.cnpj.trim() : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
        whatsapp: dto.whatsapp !== undefined ? dto.whatsapp.trim() : undefined,
        pixKey: dto.pixKey !== undefined ? dto.pixKey.trim() : undefined,
        pixKeyType: dto.pixKeyType !== undefined ? dto.pixKeyType : undefined,
        bankName: dto.bankName !== undefined ? dto.bankName.trim() : undefined,
        bankAgency: dto.bankAgency !== undefined ? dto.bankAgency.trim() : undefined,
        bankAccount: dto.bankAccount !== undefined ? dto.bankAccount.trim() : undefined,
        address: dto.address !== undefined ? dto.address.trim() : undefined,
      },
    });

    return {
      user: updatedUser,
      merchantProfile: updatedProfile,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const matches = await argon2.verify(user.passwordHash, currentPass);
    if (!matches) {
      throw new BadRequestException('A senha atual informada está incorreta.');
    }

    if (newPass.length < 6) {
      throw new BadRequestException('A nova senha deve ter no mínimo 6 caracteres.');
    }

    const newHash = await argon2.hash(newPass);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Senha atualizada com sucesso!' };
  }
}


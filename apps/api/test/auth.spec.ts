import * as argon2 from 'argon2';

describe('Argon2 Password Hashing & Security', () => {
  it('deve gerar e validar um hash seguro para senha', async () => {
    const rawPassword = 'MinhaSenhaForte@2025';
    const hash = await argon2.hash(rawPassword);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2')).toBe(true);

    const isValid = await argon2.verify(hash, rawPassword);
    expect(isValid).toBe(true);

    const isInvalid = await argon2.verify(hash, 'SenhaErrada123');
    expect(isInvalid).toBe(false);
  });
});


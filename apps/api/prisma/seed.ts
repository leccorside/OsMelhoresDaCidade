import { PrismaClient, Role, ListingStatus, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed da base de dados...');

  // 1. Estados
  const goias = await prisma.state.upsert({
    where: { uf: 'GO' },
    update: {},
    create: {
      name: 'Goiás',
      uf: 'GO',
      ibgeCode: 52,
    },
  });

  const df = await prisma.state.upsert({
    where: { uf: 'DF' },
    update: {},
    create: {
      name: 'Distrito Federal',
      uf: 'DF',
      ibgeCode: 53,
    },
  });

  const mg = await prisma.state.upsert({
    where: { uf: 'MG' },
    update: {},
    create: {
      name: 'Minas Gerais',
      uf: 'MG',
      ibgeCode: 31,
    },
  });

  // 2. Cidades
  const caldasNovas = await prisma.city.upsert({
    where: { slug: 'caldas-novas' },
    update: {},
    create: {
      name: 'Caldas Novas',
      slug: 'caldas-novas',
      stateId: goias.id,
      ibgeCode: 5204508,
      isPublished: true,
      isFeatured: true,
      heroImage: '/logo-01.png',
      coverImage: '/logo-01.png',
      introText:
        'A maior estância hidrotermal do planeta. Descubra restaurantes premiados, parques aquáticos fascinantes, hotelaria de águas quentes e os maiores festivais sertanejos do país.',
      metaTitle: 'Os Melhores de Caldas Novas (GO) | Guia Oficial da Cidade',
      metaDescription:
        'Descubra os melhores restaurantes, bares, hotéis, parques termais e eventos em Caldas Novas, Goiás. Avaliações reais e contato direto.',
      keywords: ['caldas novas', 'parques aquaticos', 'hoteis caldas novas', 'restaurantes caldas novas', 'goias'],
    },
  });

  await prisma.city.upsert({
    where: { slug: 'goiania' },
    update: {},
    create: {
      name: 'Goiânia',
      slug: 'goiania',
      stateId: goias.id,
      ibgeCode: 5208707,
      isPublished: false,
      isFeatured: false,
      introText: 'Capital da gastronomia sertaneja, grandes parques e cultura vibrante no coração do Brasil.',
    },
  });

  // 3. Bairros de Caldas Novas
  const bairrosCaldas = [
    { name: 'Centro', slug: 'centro' },
    { name: 'Privé das Caldas', slug: 'prive-das-caldas' },
    { name: 'Solar de Caldas', slug: 'solar-de-caldas' },
    { name: 'Lago Corumbá', slug: 'lago-corumba' },
    { name: 'Itanhangá', slug: 'itanhanga' },
    { name: 'Termalville', slug: 'termalville' },
    { name: 'Jardim Roma', slug: 'jardim-roma' },
    { name: 'Bandeirantes', slug: 'bandeirantes' },
  ];

  for (const b of bairrosCaldas) {
    await prisma.neighborhood.upsert({
      where: {
        cityId_slug: {
          cityId: caldasNovas.id,
          slug: b.slug,
        },
      },
      update: {},
      create: {
        cityId: caldasNovas.id,
        name: b.name,
        slug: b.slug,
      },
    });
  }

  // 4. Categorias Principais
  const categories = [
    {
      name: 'Restaurantes',
      slug: 'restaurantes',
      description: 'Pizzarias, churrascarias, culinária regional e alta gastronomia.',
      icon: 'Utensils',
      order: 1,
    },
    {
      name: 'Bares & Vida Noturna',
      slug: 'bares',
      description: 'Pubs, choperias, música ao vivo e casas noturnas.',
      icon: 'Beer',
      order: 2,
    },
    {
      name: 'Hotéis & Pousadas',
      slug: 'hospedagem',
      description: 'Resorts com águas termais, pousadas charmosas e hotéis centrais.',
      icon: 'Hotel',
      order: 3,
    },
    {
      name: 'Parques & Lazer',
      slug: 'atracoes',
      description: 'Parques aquáticos termais, passeios ecológicos e clubes.',
      icon: 'Compass',
      order: 4,
    },
    {
      name: 'Shows & Eventos',
      slug: 'eventos',
      description: 'Festivais nacionais, eventos culturais e feiras.',
      icon: 'Ticket',
      order: 5,
    },
    {
      name: 'Comércio & Serviços',
      slug: 'comercio',
      description: 'Lojas, prestadores de serviços e comércio geral.',
      icon: 'ShoppingBag',
      order: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        isActive: true,
      },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


export type PlaceCategoryType = 'attraction' | 'accommodation' | 'restaurant' | 'general';

export interface TicketTier {
  id: string;
  name: string;
  badge?: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  rules: string;
}

export interface RoomOption {
  id: string;
  name: string;
  badge?: string;
  sizeM2: number;
  capacity: string;
  bed: string;
  nightRate: number;
  image: string;
  amenities: string[];
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  badge?: string;
  price: string;
  category: string;
  description: string;
  image: string;
}

export interface PlaceDetailData {
  id: string;
  slug: string;
  name: string;
  placeType: PlaceCategoryType;
  category: string;
  categorySlug: string;
  subCategory: string;
  badge: string;
  statusBadge: string;
  awardBadge?: string;
  priceRange: string;
  priceTier: string;
  ratingAverage: number;
  ratingCount: number;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram?: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  isFeatured: boolean;
  shortDescription: string;
  fullDescription: string[];
  guideTip: string;
  gallery: Array<{
    url: string;
    title: string;
    subtitle?: string;
    isHero?: boolean;
  }>;
  fastHighlights: Array<{
    icon: string;
    title: string;
    subtitle: string;
  }>;
  amenities: string[];
  operatingHours: Array<{
    label: string;
    time: string;
    note?: string;
  }>;
  locationInfo: {
    address: string;
    neighborhood: string;
    directionsTip: string;
  };
  ratingBreakdown: {
    score: number;
    total: number;
    categories: Array<{ name: string; score: number }>;
  };
  reviews: Array<{
    author: string;
    avatar: string;
    location: string;
    date: string;
    title: string;
    text: string;
    rating: number;
    photos?: string[];
    stayDetails?: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;

  // Campos específicos de Parque / Atração
  waterTemp?: string;
  ticketTiers?: TicketTier[];
  partnerHotelNotice?: {
    title: string;
    desc: string;
    linkText: string;
    linkHref: string;
  };

  // Campos específicos de Hospedagem / Pousada / Hotel
  baseNightRate?: number;
  checkIn?: string;
  checkOut?: string;
  breakfastIncluded?: boolean;
  petFriendly?: boolean;
  rooms?: RoomOption[];
  bookingPolicies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    children: string;
    pets: string;
  };

  // Campos específicos de Restaurante / Gastronomia
  cuisine?: string;
  serviceType?: string;
  averageCost?: string;
  menuHighlights?: MenuItem[];
  wineCellar?: {
    title: string;
    desc: string;
    totalLabels: number;
    corkageRule: string;
  };
  dietaryOptions?: string[];
  paymentMethods?: string[];

  // Cardápio completo por seções e Eventos cadastrados pelo parceiro
  serviceCategories?: Array<{
    id: string;
    name: string;
    description?: string | null;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      price?: number | string | null;
      imageUrl?: string | null;
      isAvailable: boolean;
    }>;
  }>;
  upcomingEvents?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    startDate: string;
    startTime?: string | null;
    isFree: boolean;
    priceInfo?: string | null;
    ticketUrl?: string | null;
    imageUrl?: string | null;
    categoryName?: string;
  }>;
}

export const MOCK_PLACES_DETAILS: Record<string, PlaceDetailData> = {
  // 1. DIROMA ACQUA PARK (PARQUE AQUÁTICO / ATRAÇÃO)
  'diroma-acqua-park': {
    id: 'place-diroma',
    slug: 'diroma-acqua-park',
    name: 'DiRoma Acqua Park',
    placeType: 'attraction',
    category: 'Parques Aquáticos & Termas',
    categorySlug: 'atracoes',
    subCategory: 'Parque Temático Hidrotermal',
    badge: 'Destaque Ouro Verificado',
    statusBadge: 'Aberto Agora (08:00 - 18:00)',
    awardBadge: "Tripadvisor Travellers' Choice 2024",
    priceRange: '$$$ (Moderado / Alto)',
    priceTier: '$$$',
    ratingAverage: 4.9,
    ratingCount: 1820,
    address: 'Rua São Cristóvão, 805 - Solar de Caldas, Caldas Novas - GO, 75696-030',
    neighborhood: 'Solar de Caldas',
    city: 'Caldas Novas',
    uf: 'GO',
    phone: '(64) 3455-9000',
    whatsapp: '556434559000',
    website: 'https://diroma.com.br/acqua-park',
    instagram: '@diromaacqua',
    lat: -17.7302,
    lng: -48.6275,
    isOpen: true,
    isFeatured: true,
    shortDescription:
      'O complexo hidrotermal mais famoso e premiado do Centro-Oeste brasileiro, com toboáguas gigantes, piscina de ondas e águas quentes naturais a 37,5°C.',
    fullDescription: [
      'Localizado no coração turístico de Caldas Novas (GO), o DiRoma Acqua Park é a síntese perfeita de diversão revigorante e relaxamento terapêutico. Alimentado pelo maior manancial hidrotermal do mundo, o parque oferece uma experiência aquática incomparável onde todas as piscinas brotam águas quentes e cristalinas com temperaturas médias entre 36°C e 38°C.',
      'O complexo é dividido em três áreas temáticas integradas: o Slide Park, com rampas de alta velocidade, toboáguas em caracol e o lendário Kamikaze; o Acqua Splash, voltado a famílias com crianças pequenas, que abriga o navio pirata, grutas com cascatas e a réplica do vulcão; e o Jardim Japonês & SPA Termal, um refúgio de tranquilidade projetado para momentos de introspecção, hidromassagem e banhos de imersão revigorantes.',
    ],
    guideTip:
      'Chegue preferencialmente às 08:30 para garantir espreguiçadeiras próximas à piscina de ondas principal e garanta seus vouchers de armário na entrada principal logo na chegada.',
    gallery: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5BwNUWDNLBMeGUdhifZ6iANV13lup58dJmeaHiN5G0wIGEUVgihHk6TKMxuL5ArOjR5f4N9rhT7PBjEq4KnObu5FSrdHNiWU8sZsGDJdLkuFiUgFLL-pAIw1K3Xu_KcTqt8k_qNor1O1W6xiRwOpAh-5h2egpt2979eCZ83TMqRJqHjJ67ySR8jHDTisce2t2U2PzSrXvcL-QCQCU95d_MgWCrQNGwiKouPErL3z4',
        title: 'Visão Geral do Complexo',
        subtitle: 'Complexo Termal & Toboáguas Gigantes',
        isHero: true,
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC85dq3m8EMWMLvDUtBU1VGZCM5ZKqeJUy1lS1CdHuCKFMeVwlbKk-msRcXnS1P5yqvn9v_Paq7flGLGA2lJkDZXMFne7CCJa8RqqDrEFDio8LfpOYtj5wunKkGXZ4bClbio5hHKCU9K-KeXUE02iRT16A0dfPNMCi36vvuMhiDeMBldQhBvjDEIF_v1jtOMm0HylrzQGk3TYz6NuuVWYeJzU6C45-Z4P3I0KgGo1iy',
        title: 'Piscina de Ondas Termais',
        subtitle: 'Mais de 1.000m² com praia artificial',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqCzlu-M4KlJfDsjjmInofI77xq5K5cgQBbSBYC1sTVEoiismwUktoEsbVtG14eraFZCoVtpoiA6tMtR-SW-rwib8fdSsrFXPm6vXwKlSMZnXMOzck0oep9T6XbrQJgdPfd1XHBwZsODqIgSHlu-xNio-YQVGhe5iB9aliAX13wvtqcxMW8Jctp-Lj-bjowsbvEbwQMCKKIPEL_050y91rkaDs76g-8EXILCgSGVyZ',
        title: 'Espaço Kids Vulcão',
        subtitle: 'Área infantil segura e aquecida',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB69D1f14dDd1CT9vPALQ7YOl1qWy_6VyAKv9I0xlux0kwgeyV50qh29_eXjO5qiQdBUEXTWWNggqsCFGsUVlg_jAx1ccKIeebZK2DC8CDI6_WiCd-wX2h2Da2E_2vqzxZv63JXaLHtlnV6fIbY03y0zVFFImYUZjZXt4MpBh9UGzwJTkmdIuMmWS4jSMyY-tW4DVAxjmb2Ec0u6t408OMbGRUaQDFIgvw8vjpvyev',
        title: 'SPA & Ofurôs Termais',
        subtitle: 'Águas termais puras a 38°C constantes',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1eVWDAsRFsMDaRnKT3c2ud66oq2uRYc5Q356m1AZDfiUz7ELozhT7XgiFLN3GgzUqaeWIIs5__d8wBJyAgwiAWnXkvtXdGWPGFP-rb2ZFheUId1p9qUt_IbmlF2mBVls9u-e4bi4CuX_9KcmnQJxIysl1e-SRZEYVO6LMv1ZkNxD-ixcyIru8lffApKxE7apetZ2X5RQize-nj-BF6iAGCP5hQgJWk2j2JBg0BrH5',
        title: 'Bar Molhado & Gastronomia',
        subtitle: 'Drinks e petiscos dentro d’água',
      },
    ],
    fastHighlights: [
      { icon: 'hot_tub', title: 'Termas Naturais', subtitle: '37,5°C constantes' },
      { icon: 'waves', title: 'Piscina de Ondas', subtitle: 'Mais de 1.000m²' },
      { icon: 'downhill_skiing', title: 'Kamikaze Radical', subtitle: 'Adrenalina pura' },
      { icon: 'accessible_forward', title: 'Acessibilidade', subtitle: 'Rampas & suporte' },
      { icon: 'local_parking', title: 'Estacionamento', subtitle: 'Gratuito no local' },
    ],
    amenities: [
      'Wi-Fi gratuito em todo o parque',
      'Armários com chave eletrônica',
      'Vestiários amplos & chuveiros quentes',
      'Salva-vidas em 100% das atrações',
      'Restaurante buffet self-service',
      'Bares molhados térmicos',
      'Ambulatório & Posto Médico completo',
      'Lojinhas de moda praia & souvenir',
      'Espaço Baby & Fraldário completo',
    ],
    operatingHours: [
      { label: 'Terça a Domingo', time: '08:00 às 18:00', note: 'Piscinas encerram às 17:45' },
      { label: 'Segunda-feira', time: 'Fechado para Manutenção Geral', note: 'Exceto feriados e alta temporada' },
    ],
    locationInfo: {
      address: 'Rua São Cristóvão, 805 - Solar de Caldas, Caldas Novas - GO',
      neighborhood: 'Bairro Solar de Caldas',
      directionsTip: 'Apenas a 4 minutos do centro histórico de Caldas Novas, com ampla sinalização na avenida principal.',
    },
    ratingBreakdown: {
      score: 4.9,
      total: 1820,
      categories: [
        { name: 'Temperatura da Água', score: 5.0 },
        { name: 'Limpeza & Higiene', score: 4.9 },
        { name: 'Atrações & Toboáguas', score: 4.9 },
        { name: 'Atendimento & Salva-vidas', score: 4.8 },
        { name: 'Custo-Benefício', score: 4.7 },
      ],
    },
    reviews: [
      {
        author: 'Mariana Silveira',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        location: 'Ribeirão Preto, SP',
        date: 'Outubro de 2025',
        title: 'Experiência fantástica para toda a família!',
        text: 'O parque é impecável. As águas termais são quentinhas de verdade, inclusive nos toboáguas mais altos. O espaço para crianças no navio pirata é seguro e os monitores são extremamente atentos.',
        rating: 5,
        stayDetails: 'Visitou com família de 4 pessoas',
      },
      {
        author: 'Rodrigo Vasconcelos',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        location: 'Brasília, DF',
        date: 'Setembro de 2025',
        title: 'Melhor parque de Caldas Novas sem dúvidas',
        text: 'A piscina de ondas termais é uma delícia para relaxar no fim da tarde. O almoço no buffet tem preço justo pela qualidade da comida típica goiana. Vale cada centavo do ingresso antecipado.',
        rating: 5,
        stayDetails: 'Visitou em casal',
      },
    ],
    faq: [
      {
        question: 'É permitido entrar com alimentos e bebidas no parque?',
        answer: 'Por normas sanitárias e de preservação da qualidade das águas termais minerais, não é permitida a entrada de alimentos e bebidas, com exceção de alimentos especiais para bebês e dietas com prescrição médica comprovada.',
      },
      {
        question: 'Crianças até qual idade possuem entrada gratuita?',
        answer: 'Crianças de 0 até 6 anos e 11 meses têm entrada gratuita mediante apresentação de documento oficial comprobatório (RG ou Certidão de Nascimento) acompanhadas de responsável pagante.',
      },
      {
        question: 'O parque funciona em dias de chuva?',
        answer: 'Sim! Como todas as águas são termalmente aquecidas entre 36°C e 38°C, os banhos e atrações continuam muito agradáveis mesmo sob chuva leve. Apenas atrações mecânicas altas são temporariamente pausadas em caso de tempestades com raios por protocolo estrito de segurança.',
      },
      {
        question: 'Como funciona o sistema de armários e consumo?',
        answer: 'Na recepção você adquire uma pulseira de consumo por aproximação que também opera os armários eletrônicos. Você pode recarregar via Pix, Cartão ou Dinheiro e estornar o saldo remanescente na saída.',
      },
    ],
    // Específico de Parque / Atração
    waterTemp: '37,5°C constantes',
    ticketTiers: [
      {
        id: 'tier-adulto',
        name: 'Ingresso Adulto',
        badge: 'Mais Vendido',
        price: 115,
        originalPrice: 140,
        description: 'Acesso integral de 1 dia a todas as áreas termais, piscina de ondas e toboáguas radicais.',
        features: ['Acesso ao Slide Park', 'Acesso à Piscina de Ondas', 'Uso livre de espreguiçadeiras', 'Acesso aos Bares Molhados'],
        rules: 'Válido para pessoas a partir de 12 anos. Apresente voucher digital na catraca.',
      },
      {
        id: 'tier-infantil',
        name: 'Ingresso Infantil (7 a 11 anos)',
        price: 75,
        originalPrice: 90,
        description: 'Tarifa especial para crianças aproveitarem as áreas infantis e moderadas com segurança.',
        features: ['Acesso ao Navio Pirata', 'Espaço Vulcão Termal', 'Monitores salva-vidas dedicados'],
        rules: 'Necessário apresentar documento com foto. Grátis de 0 a 6 anos.',
      },
      {
        id: 'tier-senior',
        name: 'Melhor Idade (60+ anos)',
        price: 60,
        originalPrice: 80,
        description: 'Condição especial de meia-entrada para idosos relaxarem nas piscinas medicinais.',
        features: ['Acesso ao SPA & Ofurôs', 'Rampas de acessibilidade suave', 'Cadeiras acolchoadas disponíveis'],
        rules: 'Obrigatória apresentação de documento oficial com foto na bilheteria.',
      },
    ],
    partnerHotelNotice: {
      title: 'Hospedagem com Ingresso Incluso',
      desc: 'Hóspedes da rede diRoma Hotels têm acesso ilimitado gratuito a este parque aquático durante toda a estadia.',
      linkText: 'Ver hotéis parceiros diRoma',
      linkHref: '/caldas-novas/lugares?categoria=hospedagem',
    },
  },

  // 2. POUSADA TERMAL DO LAGO (HOSPEDAGEM / POUSADA / HOTEL)
  'pousada-termal-do-lago': {
    id: 'place-pousada',
    slug: 'pousada-termal-do-lago',
    name: 'Pousada Termal do Lago',
    placeType: 'accommodation',
    category: 'Resorts & Pousadas',
    categorySlug: 'hospedagem',
    subCategory: 'Pousada Boutique Ecológica',
    badge: 'Super Hospedagem Ouro',
    statusBadge: 'Melhor Tarifa Direta Garantida',
    awardBadge: 'Reserva Segura Verificada',
    priceRange: 'A partir de R$ 380 / noite',
    priceTier: '$$$',
    ratingAverage: 4.9,
    ratingCount: 1420,
    address: 'Orla da Enseada Náutica, Lago Corumbá, Caldas Novas - GO, 75690-000',
    neighborhood: 'Lago Corumbá',
    city: 'Caldas Novas',
    uf: 'GO',
    phone: '(64) 3454-5678',
    whatsapp: '5564999995678',
    website: 'https://pousadatermaldolago.com.br',
    instagram: '@pousadatermaldolago',
    lat: -17.705,
    lng: -48.582,
    isOpen: true,
    isFeatured: true,
    shortDescription:
      'Pousada boutique exclusiva à beira do deslumbrante Lago Corumbá, com 6 piscinas termais naturais a 41°C, café colonial farto e píer privativo.',
    fullDescription: [
      'Debruçada sobre o espelho d’água da Enseada Náutica do Lago Corumbá, a Pousada Termal do Lago combina a tranquilidade acolhedora da natureza do cerrado com o luxo relaxante de fontes hidrotermais privativas que brotam a 41°C.',
      'Com arquitetura rústico-chique em madeira nobre e pedras esculpidas, a hospedagem conta com chalés climatizados com varandas voltadas para o poente, banheiras de hidromassagem privativas, pier com caiaques e um consagrado café da manhã colonial goiano servido diariamente.',
    ],
    guideTip:
      'Ao planejar sua estada, solicite os chalés voltados para o poente (números 14 ao 22). O pôr do sol sobre o Lago Corumbá é um espetáculo cinematográfico. Não deixe de aproveitar as piscinas termais após as 19h com a iluminação âmbar subaquática.',
    gallery: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfyfcaxfOkMc6pWCR-9z728pGIxBXJ6-hZjtk1x82bduT2EOgr-qsoB0d3ocCATymvPz5wL6L9L8-sTeBwIZllaCGwTxmuCtljh853919Qm7dHIY_wo09MSmXuWdr5qyxtITsipp9h6223M80gIbEzGWtJps9W1rkyy_HZSExGYoaaUxp0sfE2f6-SBS0ykHO0lT-0AxOg7hKrJSrOSqp7AJTwgsP18YJQzFDGjR3h',
        title: 'Piscina Termal Borda Infinita',
        subtitle: 'Borda infinita debruçada sobre o Lago Corumbá',
        isHero: true,
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD5JfrgE7gZq13rmHhCuvKSMcRKR8LEZOcdtk1eRtcA8lFZQ-RJlI14tbNIm0MIgcZ0D2608FncZj_yW4YussWJHBqpvn7txgHmOwXZi0yvvadpPyVPX6VTGJVCHY7OxlpBWQ1jvHdgGAZriIFtPpZXReD1iYQooaFwraoee_8yUV4LkNPxuCkpSO3lTWU1pGEQqrVHfRKEFeLcmWT4rUKV1chy0h3WCNuyRodQPak',
        title: 'Suíte Master com Varanda',
        subtitle: 'Hidromassagem privativa e cama king size',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBabgYVU38fdhFXH4YvQQ7PqY49_pd2plquhFULl7IZjUCsxIh8LyhSZRUTscYbxLP4MEyzEpPQqb_AA4WYtlfqM36hDsQCVlAVYmd-neiM-J1R-rE2O6D2ZadlRvr06mZmrgaQQtN_wv32eiOa2RXYiRTyhcKCW_TDznpAWe0_urnse2JTfFfq7BgCUBfSKAFHMpRditngOMWKIiO7w9ouscUDmLJb50bBoOWOZhFj',
        title: 'Café Colonial Goiano',
        subtitle: 'Pães artesanais, queijos e broas inclusos',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUnTQIRpDgrawBEw-SAQRrBCNhfHxJT_-MKt3WCX2jwmPU-yZyyEH3USQB_Ait8X92_TffLlkcMjPKT8VsT75RlXSVz2fIu-D2BzeppPsnk-67SnhIV4Kk-eC29jeRlxK9q7pYufIKyCd5bMu7wb0z7B2xjUEFZSZY4Zw1qosGhOd2l-L4GPCkr4AR36fWYFUZH99_5Fm-e9HC3_TgYoDjEaCLtHHyCt48FGSIPt_8',
        title: 'Spa & Ofurôs Termais',
        subtitle: 'Banho de imersão quente e terapêutico',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcpOhvKXWZ_mQeHDPUqx4Q4Rzr2gwUb4kalGDUbPIzDCYaw-EMgxlnmYGAZ_0jYVZuFdyVsQu4hDLjEvQbrpRbrZmb6nA-v91ld4BkiRBftN3mTCEZD5h9c3uf1rabWvpIybPz3QxAfnGFvVwQkDJl7awzaTzUM4_U-YkErtk9RxodR8vRMoga0l0ePlvZ3ibwgSjaRDfNTHZqYP5hoQUjYgxRtKWGDPg1VY4LEsys',
        title: 'Píer Náutico no Lago',
        subtitle: 'Caiaques e stand-up paddle cortesia',
      },
    ],
    fastHighlights: [
      { icon: 'hot_tub', title: '6 Piscinas Termais', subtitle: '41°C naturais 24h' },
      { icon: 'bakery_dining', title: 'Café Colonial', subtitle: 'Incluso na diária' },
      { icon: 'kayaking', title: 'Píer Náutico', subtitle: 'Lazer no Lago Corumbá' },
      { icon: 'pets', title: 'Pet Friendly', subtitle: 'Cães de pequeno porte' },
      { icon: 'schedule', title: 'Check-in 14h', subtitle: 'Check-out 12h' },
    ],
    amenities: [
      '6 Piscinas termais naturais com água corrente a 41°C',
      'Piscina de borda infinita debruçada sobre o Lago Corumbá',
      'Café da manhã colonial com mais de 50 itens artesanais',
      'Píer privativo com caiaques e pranchas de stand-up paddle',
      'Restaurante contemporâneo à la carte no local',
      'Sauna úmida termal com vista panorâmica',
      'Wi-Fi fibra ótica de alta velocidade em chalés e áreas comuns',
      'Estacionamento privativo gratuito e coberto',
      'Espaço Pet friendly com jardim gramado privativo',
    ],
    operatingHours: [
      { label: 'Recepção & Concierge', time: 'Atendimento 24 Horas', note: 'Equipe bilíngue' },
      { label: 'Café da Manhã Colonial', time: '07:00 às 10:30', note: 'Restaurante panorâmico' },
      { label: 'Piscinas Termais', time: '24 Horas Abertas', note: 'Iluminação especial noturna' },
    ],
    locationInfo: {
      address: 'Orla da Enseada Náutica, Lago Corumbá, Caldas Novas - GO',
      neighborhood: 'Enseada Náutica do Lago',
      directionsTip: 'A 12 minutos do centro de Caldas Novas via estrada asfaltada e iluminada com acesso privativo direto ao lago.',
    },
    ratingBreakdown: {
      score: 4.9,
      total: 1420,
      categories: [
        { name: 'Conforto dos Quartos & Chalés', score: 4.9 },
        { name: 'Piscinas Termais & Spa', score: 5.0 },
        { name: 'Café da Manhã Colonial', score: 4.9 },
        { name: 'Limpeza & Cuidados', score: 4.9 },
        { name: 'Localização & Vista do Lago', score: 4.8 },
      ],
    },
    reviews: [
      {
        author: 'Juliana Costa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        location: 'Brasília, DF',
        date: 'Janeiro de 2025',
        title: 'O melhor lugar para descansar com vista do lago!',
        text: 'A banheira de imersão termal no quarto com vista para o poente do Lago Corumbá é indescritível. O café da manhã tem pão de queijo quentinho saindo a cada 10 minutos e geleias locais maravilhosas.',
        rating: 5,
        stayDetails: 'Ficou no Chalé Master Vista Lago',
      },
      {
        author: 'Fábio Meirelles',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        location: 'Goiânia, GO',
        date: 'Dezembro de 2024',
        title: 'Excelente estrutura termal e ótimo atendimento',
        text: 'Nosso golden retriever foi recebido com muito carinho. O píer privativo é perfeito para assistir ao entardecer e as piscinas à noite são incrivelmente relaxantes.',
        rating: 5,
        stayDetails: 'Ficou no Chalé Família Termal',
      },
    ],
    faq: [
      {
        question: 'Quais são os horários padrão de check-in e check-out?',
        answer: 'O check-in inicia-se a partir das 14:00 e o check-out realiza-se até as 12:00. Caso chegue antes, você já pode deixar as bagagens na recepção e desfrutar do complexo de piscinas termais.',
      },
      {
        question: 'A pousada aceita animais de estimação (Pet Friendly)?',
        answer: 'Sim! Aceitamos cães e gatos de pequeno a médio porte (até 15kg) com apresentação da carteira de vacinação em dia, mediante taxa única de higienização de R$ 90 por estada.',
      },
      {
        question: 'As piscinas termais ficam abertas durante a noite?',
        answer: 'Sim, as 6 piscinas termais naturais operam 24 horas por dia em temperatura de 41°C com água mineral corrente contínua e sistema de iluminação âmbar acolhedor.',
      },
      {
        question: 'O café da manhã está incluso em todas as diárias?',
        answer: 'Sim! Todas as tarifas reservadas pelo portal contam com o Café Colonial Goiano completo incluso, servido diariamente das 07:00 às 10:30.',
      },
    ],
    // Específico de Hospedagem / Pousada
    baseNightRate: 380,
    checkIn: '14:00',
    checkOut: '12:00',
    breakfastIncluded: true,
    petFriendly: true,
    rooms: [
      {
        id: 'room-chale-master',
        name: 'Chalé Master Varanda & Lago',
        badge: 'Mais Reservado',
        sizeM2: 42,
        capacity: 'Até 2 adultos + 1 criança',
        bed: 'Cama Super King Size + Hidromassagem',
        nightRate: 620,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr6ZITV2ho-zUfwFt-sFvk_HDo2gu7Lmrm3DqGPOJMC3NpClC-J5_6LuhegZxk-Hrv6GtOegGErTm2sT1utVRCs5W3rFb8dT3JwyCKYI7GPNq14VhHeXsHB_EFVxNjbTIVuARa1Q4uut6CdjoBRJYi128CzmpPnyoDVCLd8UK7cbtay0R3qA8h_YOcJnMfqP9e-VfGEzKaym2wTsiZCuyqyjQPMfoH_ur-qVTR8cZa',
        amenities: ['Hidromassagem Termal Privativa', 'Varanda com Rede e Vista Lago', 'Ar Split Inverter', 'Frigobar abastecido', 'Máquina Nespresso'],
        description: 'Nosso chalé mais romântico, situado no topo da colina com visão 180° para o Lago Corumbá e pôr do sol inesquecível.',
      },
      {
        id: 'room-chale-familia',
        name: 'Chalé Família Termal',
        badge: 'Ideal para Famílias',
        sizeM2: 58,
        capacity: 'Até 5 pessoas',
        bed: '1 Cama King + 3 Camas Solteiro',
        nightRate: 780,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
        amenities: ['2 Quartos integrados', 'Sala de estar espaçosa', 'Deck gramado exclusivo', 'Ducha termal dupla', 'Smart TV 55 pol'],
        description: 'Projetado para estadias familiares com total privacidade, amplo espaço e acesso rápido à piscina infantil.',
      },
      {
        id: 'room-apartamento-standard',
        name: 'Apartamento Standard Termal',
        badge: 'Melhor Custo-Benefício',
        sizeM2: 28,
        capacity: 'Até 2 pessoas',
        bed: '1 Cama Queen Size',
        nightRate: 380,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2HYQBadfnMdMSVZ7LNItkxVn8kVe5ALeMaMOlomvysNfifMTRjeAENafUla-VS7_a2syG2ko6L4A2HOtbN1FLyshbLo1IHD98ztWXTubt_1qa1PexbOQ0YtxMAu7jZlbLWpwm9_XFOXBtzmVS3VZGwqA82Eo_BTGazfjShWtncU0tja-AApoHlHJuD-rxqb7XADw8Lod1g9DkBgjxi5ophl9jJqcr2fgjCjn_qRK',
        amenities: ['Cama Queen com pillow top', 'Ducha com água quente mineral', 'Ar condicionado', 'Wi-Fi 500Mbps', 'Cofre digital'],
        description: 'Conforto e praticidade para casais em suíte moderna e arejada no bloco principal com fácil acesso aos ofurôs.',
      },
    ],
    bookingPolicies: {
      checkIn: 'A partir das 14:00 (Check-in antecipado mediante disponibilidade)',
      checkOut: 'Até às 12:00 (Late check-out sob consulta prévia)',
      cancellation: 'Cancelamento gratuito com reembolso integral até 7 dias antes do check-in.',
      children: '1 criança de até 5 anos no mesmo quarto dos pais não paga diária adicional.',
      pets: 'Aceita animais de estimação até 15kg com taxa única de higienização de R$ 90.',
    },
  },

  // 3. RESTAURANTE NONNA MIA (GASTRONOMIA / RESTAURANTE / TRATTORIA)
  'restaurante-nonna-mia': {
    id: 'place-nonnamia',
    slug: 'restaurante-nonna-mia',
    name: 'Restaurante Nonna Mia',
    placeType: 'restaurant',
    category: 'Restaurante',
    categorySlug: 'restaurantes',
    subCategory: 'Cozinha Italiana & Galeto Tradicional',
    badge: 'Certificado de Excelência Top 1%',
    statusBadge: 'Aberto Hoje no Jantar (19:00 - 23:30)',
    awardBadge: 'Top 1% Gastronomia Regional',
    priceRange: '$$ (R$ 65 - R$ 120 por pessoa)',
    priceTier: '$$',
    ratingAverage: 4.9,
    ratingCount: 2150,
    address: 'Av. Cel. Cirilo Lopes de Morais, 745 - Bairro Do Turista I, Caldas Novas - GO, 75696-016',
    neighborhood: 'Bairro Do Turista I',
    city: 'Caldas Novas',
    uf: 'GO',
    phone: '(64) 3453-1234',
    whatsapp: '556434531234',
    website: 'https://nonnamia.com.br',
    instagram: '@nonnamiacaldas',
    lat: -17.742,
    lng: -48.625,
    isOpen: true,
    isFeatured: true,
    shortDescription:
      'A mais tradicional trattoria italiana do Centro-Oeste, famosa pelo consagrado rodízio de Galeto Al Primo Canto, massas artesanais frescas e adega climatizada com mais de 120 rótulos.',
    fullDescription: [
      'Há mais de três décadas em Caldas Novas, o Restaurante Nonna Mia mantém viva a rica tradição culinária dos imigrantes italianos da Serra Gaúcha, proporcionando um banquete memorável servido em sistema de rodízio contínuo e à la carte.',
      'A experiência gastronômica se inicia com a autêntica sopa de capeletti artesanal e a polenta brustolada frita sequinha com queijo colonial. Em seguida, chega à mesa o lendário Galeto Al Primo Canto marinado em vinho branco e ervas frescas na brasa, acompanhado de seis variedades de massas recheadas preparadas diariamente.',
    ],
    guideTip:
      'Para o jantar, recomendamos chegar até às 19:45 para evitar as filas que costumam se formar após as 20:30. A casa não cobra taxa de rolha na primeira garrafa de vinho trazida pelo cliente.',
    gallery: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKm83qHNSVLcK8VugpIQUhTTnWYP4gXeCv6kFGc4HIoa97HQAlv-iL7oSDsk0BpMZZKe9fzjyRRzLsuMgGgx0P0yoctJQSBF0AQOD6xSlgTbdzihIc3o0PKoCBAr7rvFRGJ4bzfzL44Z_LdsGeRTDWrBLbIc7IKHdcBzHHcHmys8qbzL0E9p1AnynGIxHFrN9bM1R177tg829hfRojLOpAUdiCZszgvriN7TD4gg_R',
        title: 'Salão Nobre & Cantina',
        subtitle: 'Ambiente rústico climatizado com arcos de tijolos',
        isHero: true,
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy28vkVAye7skJgiPL0nXTXEIRSEblW2u54sylRC-_IPkRmj0UMUT8rsc4SMmsYtwjUULET-R0PTzB9XLOxDkBsCW6tkBHcokUbWWZuX3D4lD-0eHIKFwS8fhUuoHejWecwWltxtHdozV17J4noJNSJhAH_8qhm42gVQ2tE5D1HJGRfdtV4BPf1FVcmpL6_Hzq1bU2UTDjNLm7XGOKXdBW2H3dato_8svEwK08MbZm',
        title: 'Galeto Al Primo Canto',
        subtitle: 'Crocante por fora e suculento na brasa',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD482_ToU_Dznyd5X3A5x2oYiCCT7-kSGUK3pKW30-b3wRk-ms6VkiEbPdI_kxu0BTVpo0F8lEevMJYXfmekBP625DOHC3xe1VrOinBRU91oug0q9GbkRFqL7bTmGQdIJTDHDD_5h-CdMFcRV6AxSF2RbqCSHwfhxn17emhdqLqeDnA9ZWoetP32X5aDch0gap_-hBOUBCXjXMCSx_ap2G0go9VEoXspEmbE51G-Nl-',
        title: 'Massas Frescas Artesanais',
        subtitle: 'Fettuccine com ragù bolognese de cozimento lento',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQrXDb1_Ju7DvGirEWy5gwg_-zJ361YKIh57e5_phM8M79aZU7TJMwajzl4IFFMt_3GJ9oDi9dAZcNuDoJzXUx_KHkzQxfUGVoIfUjR3gBVvRjlDwvVlchgMcwbZ6iOgVsCi2Ohbd8dP-lh4EaSFSvKZCRBnSUSSK1qHDyBWS5JWgbsTPgQvtMbVP1Hsu-tYmlKLbICiY8J1AqgARvCPQ_HUZusmfCMxjrzad71iXH',
        title: 'Adega Climatizada',
        subtitle: 'Mais de 120 rótulos nacionais e importados',
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQjkEy-zfWyiwnQ28Jern29N1WpJCeIFkfyFKooFS2Z-ujzn6ua93mIfSQSQ07CaNH0VpJhnV3TIt9ZNt2ZfhNUwKo6TFc7EkLfGvg-LpNNEMvQkfKR7lQH292nBFEp3il5Cz9U_OsfBhrIlPRSMJo9ZUfvw6-uxGEHMW02v2A49cYEtUrMG6j2a7QHdY4-h7FN5isnCtjev7xySROO_t4HtO2WIQv13am0E7N3RvP',
        title: 'Tiramisù Tradicional da Nonna',
        subtitle: 'Sobremesa clássica com mascarpone e café',
      },
    ],
    fastHighlights: [
      { icon: 'ramen_dining', title: 'Rodízio Nobre', subtitle: 'Galeto & Massas' },
      { icon: 'wine_bar', title: 'Adega Própria', subtitle: '+120 Rótulos' },
      { icon: 'toys', title: 'Espaço Kids', subtitle: 'Com Monitora' },
      { icon: 'local_parking', title: 'Estacionamento', subtitle: 'Valet Gratuito' },
      { icon: 'accessible', title: 'Acessibilidade', subtitle: 'Acesso total' },
    ],
    amenities: [
      'Salão nobre com ar-condicionado central de última geração',
      'Adega de vidro climatizada com sommelier especializado',
      'Brinquedoteca com monitora e jogos educativos',
      'Estacionamento privativo com serviço de valet gratuito',
      'Opções vegetarianas e pratos sem lactose sob consulta',
      'Wi-Fi ultrarrápido gratuito para clientes',
      'Banheiros acessíveis e fraldário completo equipado',
      'Mesas redondas para grupos grandes e confraternizações',
    ],
    operatingHours: [
      { label: 'Almoço (Terça a Domingo)', time: '11:30 às 15:30', note: 'Buffet & Rodízio' },
      { label: 'Jantar (Terça a Domingo)', time: '19:00 às 23:30', note: 'Rodízio & À la Carte' },
      { label: 'Segunda-feira', time: 'Fechado para Manutenção', note: 'Exceto feriados' },
    ],
    locationInfo: {
      address: 'Av. Cel. Cirilo Lopes de Morais, 745 - Bairro Do Turista I, Caldas Novas - GO',
      neighborhood: 'Bairro Do Turista I',
      directionsTip: 'Principal polo gastronômico da cidade, em frente à Praça Primavera com fácil acesso e estacionamento valet gratuito.',
    },
    ratingBreakdown: {
      score: 4.9,
      total: 2150,
      categories: [
        { name: 'Qualidade dos Pratos & Sabor', score: 5.0 },
        { name: 'Atendimento & Rapidez', score: 4.9 },
        { name: 'Ambiente & Tradição', score: 4.9 },
        { name: 'Carta de Vinhos & Bebidas', score: 4.9 },
        { name: 'Custo-Benefício do Rodízio', score: 4.8 },
      ],
    },
    reviews: [
      {
        author: 'Carlos Eduardo Nogueira',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        location: 'São Paulo, SP',
        date: 'Outubro de 2025',
        title: 'O galeto mais saboroso que já comi no Brasil!',
        text: 'A sequência de massas é espetacular. A sopa de capeletti para abrir o apetite é aconchegante demais, e o galeto al primo canto tem um tempero crocante e suculento. Atendimento nota mil do garçom Giovanni.',
        rating: 5,
        stayDetails: 'Jantou em família de 5 pessoas',
      },
      {
        author: 'Patrícia Alvarenga',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        location: 'Uberlândia, MG',
        date: 'Setembro de 2025',
        title: 'Incrível experiência italiana no coração de Caldas',
        text: 'A adega climatizada é linda e possui vinhos para todos os bolsos. O tortéi de abóbora com manteiga de sálvia derrete na boca. Vale muito a pena reservar para não esperar na fila.',
        rating: 5,
        stayDetails: 'Almoço em casal',
      },
    ],
    faq: [
      {
        question: 'É necessário fazer reserva prévia para jantar?',
        answer: 'Para grupos até 4 pessoas atendemos por ordem de chegada com giro rápido de mesas. Para grupos maiores de 5 pessoas ou datas comemorativas, recomendamos reservar pelo botão do portal com 24 horas de antecedência.',
      },
      {
        question: 'O restaurante possui opções vegetarianas no rodízio?',
        answer: 'Sim! Além de saladas frescas de folhas e radicci, o cliente vegetariano conta com tortéis de queijo, massas com molho de quatro queijos e cogumelos, polenta grelhada e legumes grelhados preparados na hora.',
      },
      {
        question: 'Existe taxa de rolha para vinhos próprios?',
        answer: 'A casa tem cortesia de isenção de taxa de rolha para a 1ª garrafa de vinho trazida pelo cliente. Para as garrafas adicionais, cobramos taxa simbólica de serviço de R$ 45 por garrafa.',
      },
      {
        question: 'O estacionamento com valet é gratuito?',
        answer: 'Sim! Dispomos de manobrista próprio gratuito na porta do restaurante para todos os clientes com seguro total durante toda a permanência.',
      },
    ],
    // Específico de Restaurante / Gastronomia
    cuisine: 'Italiana Tradicional & Regional Gaúcha',
    serviceType: 'Rodízio Nobre à Mesa & À La Carte',
    averageCost: 'R$ 75 a R$ 120 por pessoa',
    menuHighlights: [
      {
        id: 'menu-galeto',
        name: 'Galeto Al Primo Canto',
        badge: 'Prato Assinatura',
        price: 'R$ 78,00',
        category: 'Carnes & Grelhados',
        description: 'Franguinho jovem marinado por 24 horas em vinho branco e ervas finas aromáticas, assado lentamente na brasa de carvão.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy28vkVAye7skJgiPL0nXTXEIRSEblW2u54sylRC-_IPkRmj0UMUT8rsc4SMmsYtwjUULET-R0PTzB9XLOxDkBsCW6tkBHcokUbWWZuX3D4lD-0eHIKFwS8fhUuoHejWecwWltxtHdozV17J4noJNSJhAH_8qhm42gVQ2tE5D1HJGRfdtV4BPf1FVcmpL6_Hzq1bU2UTDjNLm7XGOKXdBW2H3dato_8svEwK08MbZm',
      },
      {
        id: 'menu-fettuccine',
        name: 'Fettuccine Fresco Bolognese',
        badge: 'Massa Artesanal',
        price: 'R$ 64,00',
        category: 'Massas Frescas',
        description: 'Massa fresca feita diariamente com ovos caipiras e farinha grano duro, coberta com ragù de carne cozido por 6 horas.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD482_ToU_Dznyd5X3A5x2oYiCCT7-kSGUK3pKW30-b3wRk-ms6VkiEbPdI_kxu0BTVpo0F8lEevMJYXfmekBP625DOHC3xe1VrOinBRU91oug0q9GbkRFqL7bTmGQdIJTDHDD_5h-CdMFcRV6AxSF2RbqCSHwfhxn17emhdqLqeDnA9ZWoetP32X5aDch0gap_-hBOUBCXjXMCSx_ap2G0go9VEoXspEmbE51G-Nl-',
      },
      {
        id: 'menu-tortei',
        name: 'Tortéi de Abóbora Cabotiá com Sálvia',
        badge: 'Receita da Nonna',
        price: 'R$ 68,00',
        category: 'Massas Recheadas',
        description: 'Massa recheada com abóbora cabotiá assada lentamente e noz-moscada, puxada na manteiga noisette com sálvia fresca.',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'menu-tiramisu',
        name: 'Tiramisù Tradicional Autêntico',
        badge: 'Sobremesa Clássica',
        price: 'R$ 28,00',
        category: 'Sobremesas',
        description: 'Biscoitos savoiardi artesanais embebidos em café espresso forte e licor de amêndoas, entremeados por creme de mascarpone.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQjkEy-zfWyiwnQ28Jern29N1WpJCeIFkfyFKooFS2Z-ujzn6ua93mIfSQSQ07CaNH0VpJhnV3TIt9ZNt2ZfhNUwKo6TFc7EkLfGvg-LpNNEMvQkfKR7lQH292nBFEp3il5Cz9U_OsfBhrIlPRSMJo9ZUfvw6-uxGEHMW02v2A49cYEtUrMG6j2a7QHdY4-h7FN5isnCtjev7xySROO_t4HtO2WIQv13am0E7N3RvP',
      },
    ],
    wineCellar: {
      title: 'Adega Climatizada da Nonna',
      desc: 'Mais de 120 rótulos selecionados das melhores vinícolas da Serra Gaúcha, Vale dos Vinhedos, Toscana, Piemonte, Mendoza e Douro.',
      totalLabels: 120,
      corkageRule: 'Primeira garrafa com taxa de rolha isenta (cortesia da casa).',
    },
    dietaryOptions: [
      'Opções Vegetarianas inclusas no rodízio',
      'Massas sem glúten preparadas sob aviso prévio',
      'Cardápio Kids infantil sob medida',
    ],
    paymentMethods: [
      'Pix com QR Code dinâmico na mesa',
      'Cartões de Crédito e Débito (Visa, Mastercard, Elo, Amex)',
      'Vales Refeição (Alelo Refeição, Ticket Restaurante, VR, Sodexo)',
    ],
  },
};

// Função helper para obter ou sintetizar dados para qualquer slug
export function getPlaceDetailData(slug: string): PlaceDetailData | null {
  if (MOCK_PLACES_DETAILS[slug]) {
    return MOCK_PLACES_DETAILS[slug];
  }

  // Se for outro slug conhecido, mapeamos com inteligência para o modelo adequado
  if (slug === 'water-park-caldas-novas' || slug === 'clube-prive-caldas' || slug === 'hot-park-parque-das-fontes') {
    const base = MOCK_PLACES_DETAILS['diroma-acqua-park'];
    const name = slug === 'water-park-caldas-novas' 
      ? 'Water Park Caldas Novas' 
      : slug === 'clube-prive-caldas'
      ? 'Clube Privé Caldas Novas'
      : 'Hot Park & Parque das Fontes';
    return {
      ...base,
      id: `place-${slug}`,
      slug,
      name,
      ratingAverage: 4.8,
      ratingCount: 1540,
      shortDescription: `Conheça as piscinas e atrações termais de ${name} em Caldas Novas (GO).`,
      fullDescription: [
        `${name} é uma das grandes atrações turísticas de Caldas Novas, reunindo águas termais, tobogãs radicais e excelente estrutura gastronômica para toda a família.`,
      ],
    };
  }

  if (slug === 'choperia-ipe-sertanejo-bar' || slug === 'empadao-goiano-da-tania') {
    const base = MOCK_PLACES_DETAILS['restaurante-nonna-mia'];
    const name = slug === 'choperia-ipe-sertanejo-bar' ? 'Choperia Ipê & Sertanejo Bar' : 'Empadão Goiano da Tânia';
    return {
      ...base,
      id: `place-${slug}`,
      slug,
      name,
      category: slug === 'choperia-ipe-sertanejo-bar' ? 'Bares & Chopperias' : 'Restaurante Típico',
      cuisine: slug === 'choperia-ipe-sertanejo-bar' ? 'Petiscos, Chopp Artesanal & Sertanejo' : 'Culinária Tradicional Goiana',
      shortDescription: `O melhor de ${name} em Caldas Novas: gastronomia, bebidas geladas e atendimento acolhedor.`,
      fullDescription: [
        `${name} é ponto de encontro imperdível para quem valoriza a gastronomia de qualidade em Caldas Novas, combinando ingredientes frescos e hospitalidade goiana.`,
      ],
    };
  }

  return null;
}


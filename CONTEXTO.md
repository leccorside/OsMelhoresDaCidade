# CONTEXTO DO PROJETO — OS MELHORES DA CIDADE

## 1. Visão Geral
**Os Melhores da Cidade** é uma plataforma digital brasileira multicidades desenhada para funcionar como um portal e guia de referência em gastronomia, turismo, lazer, eventos, hospedagens e comércio local. A aplicação tem como ponto de partida inicial a cidade turística de **Caldas Novas (GO)**, sendo projetada arquiteturalmente para operar em milhares de municípios brasileiros sob uma única base de código, garantindo isolamento contextual e geográfico para cada cidade.

## 2. Arquitetura do Sistema
O projeto é estruturado em um monorepo modular e desacoplado:
- **`apps/web`**: Frontend moderno com React 19, Next.js 15 (App Router), Tailwind CSS, Framer Motion e Lucide React. Responsável pela renderização de alta performance, SEO dinâmico, metadados, suporte a PWA e interface para os visitantes.
- **`apps/api`**: Backend robusto em NestJS com TypeScript, Prisma ORM, PostgreSQL, autenticação JWT com refresh tokens rotativos, Argon2, validação estrita com DTOs e documentação interativa Swagger.
- **`packages/shared`**: Biblioteca compartilhada de tipos TypeScript, contratos de dados, enums e utilitários de SEO.
- **`docker/`**: Configurações de containerização para PostgreSQL 16, backend NestJS, frontend Next.js e Nginx como proxy reverso integrado.

## 3. Portas e Serviços em Execução
Para evitar conflito com outros serviços e bancos de dados locais, foram padronizadas portas exclusivas:
- **Nginx (Proxy Reverso)**: `http://localhost:4100`
- **Frontend Next.js**: `http://localhost:4101`
- **API Backend NestJS**: `http://localhost:4102` (Swagger em `/docs`)
- **PostgreSQL 16**: `localhost:4103` (database: `os_melhores_db`)

## 4. Stack Tecnológica
- **Linguagem Principal**: TypeScript 5+
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Lucide React, Framer Motion, Recharts, Leaflet / OpenStreetMap.
- **Backend**: NestJS 11, Prisma ORM 6, PostgreSQL 16, Passport JWT, Argon2, Helmet, Sharp.
- **Infraestrutura**: Docker & Docker Compose, Nginx Alpine.

## 5. Diretório de Protótipos de Referência (UX/UI Stitch)
A identidade visual e a arquitetura de telas baseiam-se nos protótipos de alta fidelidade contidos na pasta `uxui/prototipos`:
1. `p_gina_inicial_nacional_os_melhores_da_cidade`: Raiz nacional (`/`) para seleção de estados e cidades com mapa do Brasil e busca.
2. `p_gina_inicial_de_caldas_novas_os_melhores_da_cidade`: Página inicial da cidade (`/[city]`), com hero, atalhos de categorias, destaques e rodapé escuro unificado.
3. `diret_rio_geral_de_lugares_caldas_novas`: Diretório geral de busca (`/[city]/lugares`), filtros laterais, alternador de colunas/linhas e mapa interativo Leaflet com pinos temáticos sem poluição de texto.
4. **Páginas de Detalhes dos Lugares**:
   - `diroma_acqua_park_caldas_novas_os_melhores_da_cidade`: Modelo para Parques Aquáticos, Termas & Atrações Radicais.
   - `pousada_termal_do_lago_caldas_novas_os_melhores_da_cidade`: Modelo para Resorts, Hotéis & Pousadas (Hospedagem).
   - `restaurante_nonna_mia_caldas_novas_os_melhores_da_cidade`: Modelo para Restaurantes, Bares & Gastronomia Tradicional.

## 6. Funcionalidades Recentes Implementadas

### A. Páginas de Detalhes dos Lugares (`/[city]/lugar/[slug]`)
Implementado componente adaptável de altíssima fidelidade (`PlaceDetailView.tsx`) e página dinâmica SSR com ISR (`revalidate = 60`) conectada diretamente à API NestJS e PostgreSQL:
- **Integração em Tempo Real com PostgreSQL**:
  - Consumo direto da rota `GET /api/v1/listings/:citySlug/:slug` através da função assíncrona `fetchPlaceDetail()`.
  - Mapeamento e mesclagem inteligente com suporte tanto a novos cadastros vindos do banco de dados quanto a anúncios enriquecidos com dados editoriais e de protótipo.
  - Suporte completo a rede interna Docker (`INTERNAL_API_URL: http://nestjs:3333/api/v1`) para Server-Side Rendering (SSR) e `NEXT_PUBLIC_API_URL` no client-side.
  - Geração de metadados dinâmicos e dados estruturados Schema.org `LocalBusiness` com as informações reais vindas do banco de dados.
- **Barra Superior & Header**: Unificado com o padrão institucional escuro da cidade, modal de troca de cidade, menu de categorias e botão "Anuncie seu Negócio".
- **Mosaico Cinematográfico de 5 Fotos (Airbnb Style)**: Hero principal panorâmico na esquerda e grade 2x2 com fotos secundárias na direita, com modal de galeria em tela cheia (lightbox com navegação e miniaturas).
- **Faixa de Destaques Rápidos**: Ícones temáticos de acordo com o segmento (Temperatura da água, piscinas, rodízio, adega, pet-friendly, check-in/out).
- **Conteúdo Editorial & Dica do Guia**: Box exclusivo destacado com a "Dica dos Melhores da Cidade".
- **Campos Específicos por Categoria**:
  - *Parques / Atrações*: Tabela de Ingressos & Tarifas Oficiais com descontos ativos, regras de meia-entrada e aviso de hotel parceiro com ingresso incluso.
  - *Hospedagem / Pousadas*: Opções de Acomodação & Diárias com fotos, m², camas, capacidade de hóspedes, políticas de check-in/out e cancelamento.
  - *Restaurantes / Gastronomia*: Destaques do Cardápio com pratos principais ilustrados e preços, Adega Climatizada (+120 rótulos e taxa de rolha isenta), e opções vegetarianas/sem glúten.
- **Comodidades & Estrutura**: Grid completo com ícones de checagem verde.
- **Localização com Mapa & Direções**: Mini-mapa interativo com coordenadas reais e orientações de trajeto.
- **Horários Detalhados**: Turnos de almoço, jantar ou bilheteria.
- **Avaliações com Notas por Quesito**: Pontuação detalhada por quesito (Limpeza, Atendimento, Comida/Atrações, Custo-benefício) e depoimentos reais verificados.
- **FAQ Accordion**: Dúvidas frequentes do estabelecimento expansíveis.
- **Sticky Sidebar Especializada**:
  - *Parque*: Calculadora de ingressos (adultos e crianças), subtotal em tempo real, botão de compra e WhatsApp da bilheteria.
  - *Hospedagem*: Calculadora de diárias com seletor de quarto, seletor de noites, total da estada e WhatsApp da recepção.
  - *Restaurante*: Reserva de mesa online sem fila, pedido delivery via WhatsApp e visualizador do cardápio em PDF.

### B. Gestão de Estabelecimentos no Painel Administrativo & Persistência na API NestJS
- **Backend NestJS (`apps/api`)**:
  - DTOs robustos com `class-validator` e `class-transformer`: `CreateListingFullDto`, `CreateListingImageDto`, `CreateOpeningHourDto`, `CreateServiceCategoryDto`, `CreateServiceItemDto`.
  - Módulo de Listings com transação atômica (`prisma.$transaction`):
    - Criação ou vinculação automática de cidade e bairro (`Neighborhood`).
    - Gravação de fotos do mosaico (`ListingImage`), comodidades (`Amenity` e `ListingAmenity`), horários (`ListingOpeningHour`) e categorias de serviços/produtos (`ListingServiceCategory` e `ListingServiceItem`).
    - `POST /api/v1/listings`: Endpoint unificado de cadastro/atualização completa.
    - `GET /api/v1/listings/admin/all`: Listagem administrativa completa com contadores de avaliações, favoritos e relacionamentos.
    - `DELETE /api/v1/listings/:id`: Remoção de estabelecimento e seus vínculos no banco.
- **Frontend Next.js (`apps/web`)**:
  - Módulo de integração de API [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts) com `fetchAdminListings()`, `createOrUpdateListing()` e `deleteListingApi()`.
  - **Lista de Estabelecimentos (`/admin/estabelecimentos`)**:
    - Carregamento assíncrono via `useEffect` trazendo registros reais do PostgreSQL persistidos pela API, com fallback limpo para mocks caso o backend esteja em inicialização.
    - Exclusão com confirmação visual chamando a API REST.
    - Tabela com filtros por busca textual, categoria/tipo (Atrações, Hospedagem, Gastronomia, Serviços) e status (Ativos, Pendentes, Destaques Ouro).
    - Ações diretas: Visualizar ao vivo no portal, Editar formulário adaptado e Excluir anúncio.
  - **Cadastro Dinâmico Adaptável (`/admin/estabelecimentos/novo`)**:
    - Mapeamento completo dos dados preenchidos no formulário para a estrutura do DTO e envio via `POST /api/v1/listings`.
    - Feedback de salvamento com spinner, notificação de sucesso e redirecionamento para a listagem administrativa.
    - Seletor de Categoria Dinâmica que reconfigura instantaneamente os campos do formulário para o tipo de anúncio selecionado:
      - *Atrações*: Temperatura da água, tabela de ingressos (adulto, infantil, sênior) e regras.
      - *Hospedagem*: Diária base, horários de check-in/out, café da manhã, pet-friendly e construtor de chalés/suítes.
      - *Gastronomia*: Tipo de cozinha, regime de serviço (rodízio/à la carte), construtor de pratos do cardápio, adega e formas de pagamento.
      - *Comércio & Serviços*: Especialidades, modelo de atendimento e garantias.
    - Construtor do mosaico de fotos (Hero + 4 secundárias com legendas).
    - Construtor de Comodidades e FAQ.
    - Suporte à edição pré-carregada via parâmetro `?edit=[slug]`.

## 7. Diretrizes Persistidas de Memória
Conforme regra do usuário registrada em `GEMINI.md` no workspace e na configuração global:
- Todas as alterações, correções e implementações devem obrigatoriamente manter o `CONTEXTO.md` atualizado com o histórico, decisões e status da plataforma.

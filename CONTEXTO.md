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
    - `GET /api/v1/listings/admin/get/:idOrSlug`: Busca completa de dados de um anúncio (independente de status) para pré-preenchimento no formulário de edição.
    - `DELETE /api/v1/listings/:id`: Remoção de estabelecimento e seus vínculos no banco.
- **Frontend Next.js (`apps/web`)**:
  - Módulo de integração de API [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts) com `fetchAdminListings()`, `fetchAdminListingDetail()`, `createOrUpdateListing()` e `deleteListingApi()`.
  - **Lista de Estabelecimentos (`/admin/estabelecimentos`)**:
    - Carregamento assíncrono via `useEffect` trazendo registros reais do PostgreSQL persistidos pela API, com fallback limpo para mocks caso o backend esteja em inicialização.
    - Exclusão com confirmação visual chamando a API REST.
    - Tabela com filtros por busca textual, categoria/tipo (Atrações, Hospedagem, Gastronomia, Serviços) e status (Ativos, Pendentes, Destaques Ouro).
    - Ações diretas: Visualizar ao vivo no portal, Editar formulário adaptado e Excluir anúncio.
  - **Cadastro & Edição Dinâmica Adaptável (`/admin/estabelecimentos/novo`)**:
    - **Modo Edição (`?edit=[slug]`)**: Pré-preenchimento assíncrono consumindo `fetchAdminListingDetail()` direto do PostgreSQL, carregando campos gerais, localização, fotos do mosaico, comodidades, horários e itens adaptados específicos (tarifas/quartos/cardápio).
    - Mapeamento completo dos dados preenchidos no formulário para a estrutura do DTO e envio via `POST /api/v1/listings` (com suporte a criação e atualização via upsert transacional).
    - Feedback de salvamento com spinner, notificação de sucesso e redirecionamento para a listagem administrativa.
    - Seletor de Categoria Dinâmica que reconfigura instantaneamente os campos do formulário para o tipo de anúncio selecionado:
      - *Atrações*: Temperatura da água, tabela de ingressos (adulto, infantil, sênior) e regras.
      - *Hospedagem*: Diária base, horários de check-in/out, café da manhã, pet-friendly e construtor de chalés/suítes.
      - *Gastronomia*: Tipo de cozinha, regime de serviço (rodízio/à la carte), construtor de pratos do cardápio, adega e formas de pagamento.
      - *Comércio & Serviços*: Especialidades, modelo de atendimento e garantias.
    - Construtor do mosaico de fotos (Hero + 4 secundárias com legendas).
    - Construtor de Comodidades e FAQ.

### C. Conexão do Diretório Público de Lugares (`/[city]/lugares` e `/[city]/lugares/[category]`) com a API e PostgreSQL
- **Integração Híbrida SSR + Reatividade Client-Side**:
  - Implementada função `fetchPublicListings()` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts) conectada ao endpoint `GET /api/v1/listings`.
  - Páginas públicas realizam busca inicial via Server-Side Rendering (`revalidate = 60`), repassando `serverPlaces` diretamente para o componente [`DirectoryPlacesClient.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/directory/DirectoryPlacesClient.tsx).
  - O cliente unifica os registros persistidos no PostgreSQL com a base de protótipos de demonstração e atualiza dinamicamente as listagens via `useEffect` caso haja nova busca por texto ou troca de categorias.
  - **Filtros Dinâmicos de Categorias e Bairros**: As contagens dos checkboxes de filtros laterais são calculadas dinamicamente via `useMemo` com base nos estabelecimentos reais cadastrados.
  - **Mapa Interativo Leaflet**: O mapa consome diretamente os marcadores atualizados com as coordenadas reais dos estabelecimentos persistidos (`lat`, `lng`), exibindo o pin com o ícone temático da categoria correspondente e popover ao vivo com fotos, faixa de preço e avaliações.

### D. Mapa Interativo com OpenStreetMap Real & Marcadores SVG por Categoria (Airbnb/Google Style)
- **Eliminação de Marcas D'água ("API KEY REQUIRED")**:
  - Migração de provedor de tiles para o **OpenStreetMap Standard** oficial de alta performance (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) com subdomínios rotativos `['a', 'b', 'c']`.
  - Integração com camadas alternativas gratuitas sem API key: **Satélite Real** (Esri World Imagery) e **Cartográfico Limpo** (Esri World Street Map).
- **Design dos Marcadores (Identidade Visual Fiel à Referência)**:
  - Formato clássico de gota ("drop pin") desenhado em SVG vetorial de alta definição com filtro de sombra (`drop-shadow`).
  - Remoção completa do rótulo de texto do nome do estabelecimento de dentro do marcador para eliminar poluição visual sobre as vias.
  - Círculo interno branco com ícone temático da categoria do estabelecimento (restaurante, piscina/parque aquático, hotel/pousada, bar/chopp, atrações, comércio, etc.).
  - Cores: Verde esmeralda/turquesa (`#008779` / `#0D9488`) por padrão; vermelho vibrante (`#FF3B4F`) com anel ao ser selecionado na lista ou no clique.
  - **Badge de Agrupamento / Proximidade (Cluster)**: Quando dois ou mais estabelecimentos estão localizados na mesma coordenada ou a menos de ~350m de proximidade, é exibido um badge circular verde-limão translúcido com o número de estabelecimentos agrupados (ex: `2`, `5`), exatamente como na referência visual.

### E. Módulo de Upload de Imagens com Sharp e Armazenamento Local no NestJS
- **Backend NestJS (`apps/api/src/modules/upload`)**:
  - `UploadModule`, `UploadController` e `UploadService` integrados ao NestJS.
  - `POST /api/v1/upload/image`: Recebe um arquivo (`file`) e pasta de destino (`places`, `events`, `blog`).
  - `POST /api/v1/upload/images`: Recebe até 10 arquivos (`files`) em lote com processamento concorrente assíncrono via `Promise.all`.
  - Otimização com **Sharp**: Redimensionamento inteligente proporcional com limite máx de 1920x1440 sem distorção (`fit: 'inside', withoutEnlargement: true`) e conversão automática para formato moderno **WebP** com 85% de qualidade.
  - Armazenamento em disco estruturado em subpastas (`uploads/{folder}/{uuid}.webp`), persistido no volume Docker `uploads_data`.
  - Servido estaticamente pelo Express/NestJS em `/uploads` e com rota de proxy reverso no Nginx (`http://localhost:4100/uploads/` e `http://localhost:4102/uploads/`).
- **Frontend Next.js (`apps/web`)**:
  - Utilitários `uploadImage()`, `uploadMultipleImages()` e `resolveImageUrl()` em `lib/api.ts`.
  - **Formulário de Cadastro/Edição de Estabelecimentos (`/admin/estabelecimentos/novo`)**:
    - Botão de upload em lote: "Upload em Lote (Até 5 Fotos)" que distribui os arquivos diretamente entre a Hero Principal e as 4 Fotos Secundárias.
    - Botão de upload individual por slot de foto com miniaturas de pré-visualização (thumbnails).
    - Preservação da possibilidade de preencher URLs externas manualmente.

### F. Geocodificação Automática, Consulta de CEP e Mini-Mapa Interativo com Pino Arrastável
- **Backend NestJS (`apps/api/src/modules/geography`)**:
  - `GET /api/v1/geography/cep/:cep`: Integração com o ViaCEP com sanitização de dígitos (8 caracteres), tratamento de erros e preenchimento de logradouro, bairro, localidade e UF.
  - `GET /api/v1/geography/geocode`: Integração com o OpenStreetMap Nominatim com cabeçalho oficial de `User-Agent: OsMelhoresDaCidade/1.0`, busca em cascata inteligente (endereço completo com número, bairro/cidade e cidade/estado) e fallback para o centro do município. Retorna latitude e longitude numéricas com precisão decimal.
- **Frontend Next.js (`apps/web`)**:
  - Funções de integração `lookupCepApi()` e `geocodeAddressApi()` em `apps/web/src/lib/api.ts`.
  - Componente de Mapa de Seleção [`AdminLocationPickerMap.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/admin/AdminLocationPickerMap.tsx) carregado via dynamic import (`ssr: false`):
    - Marcador em gota SVG estilizado com pino vermelho vibrante.
    - Suporte a arrastar e soltar (`draggable: true`), atualizando instantaneamente os campos de Latitude e Longitude via evento `dragend`.
    - Suporte a clique em qualquer ponto do mapa para reposicionamento rápido do pino.
  - **Formulário de Cadastro/Edição (`/admin/estabelecimentos/novo`)**:
    - Campo de CEP com máscara automática (`00000-000`) e busca ao completar os 8 dígitos ou clicar na lupa.
    - Preenchimento em cadeia: o retorno do CEP preenche Logradouro, Bairro e Cidade, e engatilha automaticamente a geocodificação no mapa para obter a posição GPS.
    - Botão "Localizar no Mapa" para forçar busca a qualquer momento após editar o número ou endereço.
    - Botão "Usar Meu GPS" com integração à Geolocation API do navegador do administrador.
    - Alertas contextuais com feedback de sucesso, status e aviso de coordenadas obtidas.

### G. Cluster Interativo com Dispersão em Leque (Spiderfy) e Painel Flutuante no Mapa Público
- **Comportamento Interativo de Agrupamentos (`DirectoryPlacesMap.tsx`)**:
  - Quando múltiplos estabelecimentos compartilham a mesma coordenada ou estão próximos (< 350m com badge de contagem `2`, `5`, etc.):
    - **Aproximação Suave com Voo (`map.flyTo`)**: Ao clicar no marcador com agrupamento, o mapa realiza um voo suave aproximando a câmera até o zoom ideal (16 a 18).
    - **Dispersão em Leque / Teia (Spiderfy Geométrico)**: Os pinos individuais dos estabelecimentos são projetados radialmente em círculo ao redor do ponto central em posições calculadas na tela (`map.latLngToLayerPoint` e `map.layerPointToLatLng`).
    - **Linhas Conectoras Estilizadas**: Cada pino disperso é ligado à coordenada central por uma linha pontilhada teal suave (`L.polyline` com opacidade 0.85 e dash `4, 5`).
    - **Marcador com Ícone Individual de Categoria**: Cada pino disperso exibe seu ícone temático próprio (piscina, restaurante, hotel, etc.) e pode ser clicado diretamente no mapa.
    - **Painel Flutuante de Agrupamento**: Exibe um card limpo com a lista completa dos estabelecimentos daquele ponto com fotos, nomes, categorias, notas e preços para seleção imediata.
    - **Fechamento Automático (Unspiderfy)**: Ao clicar no mapa livre, ao dar zoom out ou ao selecionar um local, a teia é desfeita e os marcadores retornam à posição consolidada.

### H. Autenticação Real com JWT, Controle de Acesso por Papéis (RBAC) e Proteção de Rotas Administrativas
- **Backend NestJS (`apps/api`)**:
  - **Seed Automático de Administrador Master**: Integrado via ciclo de vida `OnModuleInit` em `AuthService`. Na inicialização do serviço, o sistema verifica a existência do usuário `admin@osmelhoresdacidade.com.br` e, se ausente, cria automaticamente o registro com hash de senha seguro Argon2, perfil `ADMIN`, verificado e ativo.
  - **Módulo de Autenticação Global (`AuthModule`)**: Declarado como `@Global()` e exportando `JwtAuthGuard`, `RolesGuard`, `JwtModule` e `PassportModule`, viabilizando o uso imediato dos guards em qualquer módulo do ecossistema NestJS sem dependências circulares.
  - **Proteção Estrita com Guards e Roles**:
    - `ListingsController`: Endpoints de mutação e consultas restritas (`POST /listings`, `GET /listings/admin/all`, `GET /listings/admin/get/:idOrSlug`, `DELETE /listings/:id`) protegidos com `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles(Role.ADMIN)`. Chamadas sem token JWT válido ou com perfil inadequado recebem automaticamente `401 Unauthorized` ou `403 Forbidden`.
    - `UploadController`: Endpoints de upload de imagens individual e múltiplo protegidos com `@Roles(Role.ADMIN, Role.MERCHANT)`.
- **Frontend Next.js (`apps/web`)**:
  - **Middleware Edge de Proteção de Rotas ([`middleware.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/middleware.ts))**:
    - Intercepta todas as rotas sob `/admin/:path*` e `/comerciante/:path*` diretamente na camada do servidor.
    - Valida a presença dos cookies de autenticação `auth_token` e `user_role`.
    - Redireciona usuários desautenticados com status `307 Temporary Redirect` para `/login?redirect=[caminho_solicitado]`.
    - Bloqueia usuários comuns (`USER`) de acessarem áreas restritas de `/admin` ou `/comerciante`.
  - **Store e Serviços de Autenticação ([`authStore.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/stores/authStore.ts) & [`auth.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/services/auth.ts))**:
    - Gravação atômica sincronizada no `localStorage` e cookies HTTP (`auth_token`, `user_role` com `SameSite=Lax` e expiração de 7 dias).
    - Limpeza completa em logout (`clearAuthCookies()`).
    - Obtenção do token de autenticação via `getStoredAuthToken()` tanto de cookies quanto de local storage.
  - **Cliente de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Injeção automática do cabeçalho `Authorization: Bearer ${token}` em todas as chamadas administrativas (`createOrUpdateListing`, `deleteListingApi`, `fetchAdminListings`, `fetchAdminListingDetail`, `uploadImage`, `uploadMultipleImages`).
  - **Tela de Login Unificada ([`apps/web/src/app/login/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/login/page.tsx))**:
    - Suporte a redirecionamento dinâmico após login via parâmetro `redirect` da URL (ou roteamento automático por papel: `/admin` para Administradores, `/comerciante` para Comerciantes e `/app` para Usuários finais).
    - Atalho visual para autopreenchimento com credenciais do Administrador Master para desenvolvimento e homologação ágil.
  - **Layout Administrativo ([`apps/web/src/app/admin/layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/layout.tsx))**:
    - Dupla checagem reativa no client-side para reforço de segurança com tela de carregamento suave durante a validação da sessão e logout direto no menu lateral.

### I. Painel do Comerciante Integrado com API, Métricas Reais e Fluxo de Moderação Editorial
- **Backend NestJS (`apps/api`)**:
  - **Seed Automático de Comerciante Parceiro**: Provisionamento no `onModuleInit()` de `AuthService` para o usuário `comerciante@osmelhoresdacidade.com.br` com senha `Comerciante@123456`, perfil `MERCHANT`, aprovado e com perfil empresarial `Restaurante Nonna Mia Ltda` criado.
  - **Isolamento de Estabelecimentos por Comerciante (`GET /listings/merchant/mine`)**: Retorna estritamente os estabelecimentos associados ao `merchantProfileId` do usuário logado via relação `ListingOwner`, incluindo imagens e contadores de avaliações e favoritos.
  - **Métricas e Estatísticas Consolidadas (`GET /listings/merchant/stats`)**: Agrega e calcula em tempo real o total de estabelecimentos, visualizações somadas, cliques de WhatsApp, cliques em rotas de direções, cliques de telefone, nota média ponderada e contagem de anúncios publicados vs. em análise.
  - **Fluxo de Moderação Editorial (`POST /listings`)**: Comerciantes que submetem ou atualizam cadastros têm seus estabelecimentos automaticamente gravados com status `ListingStatus.PENDING` e vínculo como proprietário em `ListingOwner`.
  - **Permissão de Acesso Seguro para Administradores**: Método `ensureAdminMerchantProfile` permite que Administradores Master visualizem e naveguem no painel do comerciante criando um perfil empresarial administrativo transparente sem erros de permissão.
- **Frontend Next.js (`apps/web`)**:
  - **Funções de Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**: Implementadas `fetchMerchantStats()`, `fetchMerchantListings()` e `createMerchantListing()`, com cabeçalho JWT Bearer injetado automaticamente.
  - **Dashboard do Comerciante ([`apps/web/src/app/comerciante/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/page.tsx))**:
    - Consumo assíncrono das métricas reais do PostgreSQL via `useEffect` com tratamento de loading e empty-states.
    - Cards dinâmicos de Alcance (Visualizações), Cliques no WhatsApp, Rotas no Google Maps e Avaliação Geral.
    - Tabela de estabelecimentos próprios com badges de status (`PUBLICADO`, `EM MODERAÇÃO`), contadores de acessos e ações rápidas ("Ver no Guia" e "Editar").
  - **Página de Meus Estabelecimentos ([`apps/web/src/app/comerciante/estabelecimentos/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/estabelecimentos/page.tsx))**:
    - Gestão completa com filtros de status (`Todos`, `Publicados`, `Em Moderação`), barra de busca textual reativa e estatísticas detalhadas de cada estabelecimento.
  - **Formulário de Cadastro/Edição do Comerciante ([`apps/web/src/app/comerciante/estabelecimentos/novo/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/estabelecimentos/novo/page.tsx))**:
    - Pré-carregamento assíncrono para edição via query param `?edit=[slug]`.
    - Integração com busca de CEP (ViaCEP) e geocodificação Nominatim.
    - Upload de fotos (Hero e mosaico de até 4 fotos complementares) integrado com a API `/upload/image` e `/upload/images`.
    - Envio do formulário via `createOrUpdateListing` com aviso claro de submissão para moderação editorial.
  - **Atalho Rápido na Tela de Login ([`apps/web/src/app/login/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/login/page.tsx))**:
    - Adicionado botão de preenchimento com 1 clique para a conta do "Comerciante Parceiro" (`comerciante@osmelhoresdacidade.com.br`) ao lado do "Administrador Master".

### J. Central de Moderação Editorial de Anúncios no Painel Administrativo
- **Backend NestJS (`apps/api`)**:
  - **Fila de Moderação Enriquecida (`GET /admin/listings/pending`)**: Retorna os estabelecimentos pendentes com carregamento de relacionamentos completos: categoria, cidade, bairro, imagens ordenadas (`ListingImage`), comodidades e dados de contato do comerciante solicitante (`owners.merchantProfile.user`).
  - **Estatísticas da Fila (`GET /admin/moderation/stats`)**: Indicadores em tempo real de estabelecimentos aguardando moderação (`PENDING`), ativos/publicados (`PUBLISHED`) e reprovados (`REJECTED`).
  - **Aprovação e Reprovação Transacional (`PATCH /admin/listings/:id/status`)**: Permite aprovar para publicação imediata no portal (`PUBLISHED`) ou reprovar (`REJECTED`) com registro de observações e validação estrita via `class-validator` (`UpdateStatusDto` com `@IsEnum(ListingStatus)` e `@IsOptional() @IsString() notes`).
- **Frontend Next.js (`apps/web`)**:
  - **Funções de Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**: Implementadas `fetchAdminPendingListings()`, `fetchAdminModerationStats()`, `fetchAdminDashboardStats()` e `updateAdminListingStatus()`, com cabeçalho JWT Bearer injetado automaticamente.
  - **Central de Moderação Editorial ([`apps/web/src/app/admin/moderacao/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/moderacao/page.tsx))**:
    - Interface escura de alta fidelidade visual com cards temáticos de métricas da moderação.
    - Filtros por busca textual e categorias de negócio.
    - Cards de moderação exibindo capa, galeria de fotos enviadas, dados de localização, canais de atendimento e perfil do lojista solicitante.
    - **Ações Imediatas**:
      - *Aprovar & Publicar*: Atualiza o status via API, publica no guia da cidade e remove da fila com feedback toast.
      - *Rejeitar*: Abre modal com campo para inserir a justificativa de reprovação.
      - *Editar*: Atalho para o formulário de edição com os dados pré-preenchidos para ajustes finos pelo administrador.
      - *Pré-visualizar*: Modal com visualização integral de fotos e textos antes da tomada de decisão.
  - **Integração no Dashboard Master ([`apps/web/src/app/admin/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/page.tsx))**:
    - Conexão das métricas globais e fila rápida aos dados reais da API, com ações de aprovação/rejeição direta e atalho destacado para a Central de Moderação.
  - **Navegação do Menu Lateral ([`apps/web/src/app/admin/layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/layout.tsx))**:
    - Inclusão do item "Moderação de Anúncios" com ícone dedicado e rota direta `/admin/moderacao`.

### K. Gerenciamento de Cardápio & Catálogo de Serviços do Comerciante
- **Backend NestJS (`apps/api`)**:
  - **DTOs com Validação Estrita ([`apps/api/src/modules/listings/dto/service-menu.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/dto/service-menu.dto.ts))**:
    - `CreateServiceCategoryDto` e `UpdateServiceCategoryDto` com `class-validator` e `class-transformer` para nome, descrição opcional e ordenação.
    - `CreateServiceItemDto` e `UpdateServiceItemDto` para itens de cardápio/serviço com nome, descrição, preço numérico (mínimo 0), URL de foto, disponibilidade booleana e ordem de exibição.
  - **Serviço de Negócio ([`apps/api/src/modules/listings/listings.service.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.service.ts))**:
    - `verifyMerchantOwnership`: Validação de autorização que garante que apenas o proprietário cadastrado em `ListingOwner` ou o Administrador Master (`ADMIN`) possa visualizar ou gerenciar os serviços do estabelecimento.
    - `getMerchantServices`: Retorna as seções ordenadas e seus respectivos itens de cardápio com suporte a identificação por ID ou slug.
    - `createServiceCategory` / `updateServiceCategory` / `deleteServiceCategory`: CRUD completo de categorias com exclusão em cascata.
    - `createServiceItem` / `updateServiceItem` / `deleteServiceItem`: CRUD completo de itens associados à categoria.
    - `toggleServiceItemAvailability`: Endpoint dedicado para alternar o status de disponibilidade do prato/serviço com 1 único clique (ativo/pausado).
  - **Controlador REST ([`apps/api/src/modules/listings/listings.controller.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.controller.ts))**:
    - `GET /api/v1/listings/merchant/services/:listingIdOrSlug`
    - `POST /api/v1/listings/merchant/services/:listingIdOrSlug/category`
    - `PUT /api/v1/listings/merchant/services/category/:categoryId`
    - `DELETE /api/v1/listings/merchant/services/category/:categoryId`
    - `POST /api/v1/listings/merchant/services/category/:categoryId/item`
    - `PUT /api/v1/listings/merchant/services/item/:itemId`
    - `PATCH /api/v1/listings/merchant/services/item/:itemId/toggle`
    - `DELETE /api/v1/listings/merchant/services/item/:itemId`
- **Frontend Next.js (`apps/web`)**:
  - **Funções de Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Adicionadas interfaces tipadas `MerchantServiceItem`, `MerchantServiceCategory`, `MerchantListingServicesData`.
    - Implementadas as funções cliente: `fetchMerchantServices`, `createServiceCategoryApi`, `updateServiceCategoryApi`, `deleteServiceCategoryApi`, `createServiceItemApi`, `updateServiceItemApi`, `toggleServiceItemAvailabilityApi` e `deleteServiceItemApi`.
  - **Interface do Painel do Comerciante ([`apps/web/src/app/comerciante/servicos/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/servicos/page.tsx))**:
    - Seletor de estabelecimento ativo para parceiros com múltiplos negócios.
    - Cards de métricas rápidas: Total de Seções, Total de Itens, Itens Disponíveis e Itens Esgotados/Pausados.
    - Acordeom interativo de seções com botões de recolher/expandir, adicionar item, editar seção e excluir com confirmação.
    - Grade responsiva de itens com foto, nome, descrição, preço em Real (R$), badge de status e alternador de disponibilidade com 1 clique (Toggle rápido).
    - Modais interativos com upload de fotos via `/upload/image` e validação amigável de campos.

### L. Gestão de Eventos, Shows & Atrações do Comerciante
- **Modelagem Prisma & PostgreSQL ([`apps/api/prisma/schema.prisma`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/prisma/schema.prisma))**:
  - Adicionadas relações opcionais em `Event`: `listingId` (relação com `Listing`, cascade set null) e `merchantProfileId` (relação com `MerchantProfile`, cascade set null).
  - Relações inversas em `Listing.events` e `MerchantProfile.events`.
  - Migrações sincronizadas automaticamente via `prisma db push` no container.
- **Backend NestJS (`apps/api`)**:
  - **DTOs com Validação Estrita ([`apps/api/src/modules/events/dto/event.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/events/dto/event.dto.ts))**:
    - `CreateMerchantEventDto` e `UpdateMerchantEventDto` com tipagens e validações para nome, descrição, programação detalhada, categoria, vínculo a estabelecimento, endereço, datas de início/fim, horários, flag de gratuidade (`isFree`), preço/couvert (`priceInfo`), URL de ingresso/reservas e foto de cartaz.
  - **Serviço de Eventos ([`apps/api/src/modules/events/events.service.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/events/events.service.ts))**:
    - `getCategories`: listagem de categorias com auto-seed inteligente das 7 categorias principais da cidade (Música & Shows, Gastronomia & Festivais, Happy Hour & Vida Noturna, Stand-up & Comédia, Infantil & Família, Esportes & Lazer, Inauguração & Promoção).
    - `findMerchantEvents`: busca isolada de eventos pertencentes aos estabelecimentos do comerciante logado com ordenação por data.
    - `createMerchantEvent`: validação de posse do estabelecimento, herança automática da cidade e endereço, geração de slug sem acentos único por cidade e inserção da imagem de cartaz na tabela `EventImage`.
    - `updateMerchantEvent` e `deleteMerchantEvent`: atualização e exclusão com validação rigorosa de permissão do comerciante (`verifyEventOwnership`) ou Administrador Master.
  - **Controlador REST ([`apps/api/src/modules/events/events.controller.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/events/events.controller.ts))**:
    - Endpoints sob `/api/v1/events` e `/api/v1/events/merchant` protegidos com `JwtAuthGuard` e `RolesGuard` (`MERCHANT` e `ADMIN`).
- **Frontend Next.js (`apps/web`)**:
  - **Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Adicionadas interfaces `EventCategoryItem`, `MerchantEventItem` e `CreateMerchantEventPayload`.
    - Funções: `fetchEventCategories`, `fetchMerchantEvents`, `createMerchantEventApi`, `updateMerchantEventApi` e `deleteMerchantEventApi`.
  - **Interface do Painel do Comerciante ([`apps/web/src/app/comerciante/eventos/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/eventos/page.tsx))**:
    - Painel com 4 métricas em tempo real: Total de Eventos, Próximos / Ativos, Entrada Gratuita e Com Ingresso / Couvert.
    - Barra de filtros com busca textual reativa por nome/descrição/local, seletor de estabelecimentos e abas de período (Todos, Próximos, Passados).
    - Cards visuais com foto de cartaz, badges de preço/gratuito, badges de status, formatação de datas em português, contador de visualizações e link externo para ingressos.
    - Modal interativo completo com upload de banner/cartaz (`uploadImage`), alternador de evento gratuito vs. valor de couvert, seleção de estabelecimento anfitrião e validação.
    - Modal de confirmação de exclusão com segurança.

### M. Exibição Pública de Cardápio/Serviços e Shows/Eventos na Página do Local
- **Backend NestJS (`apps/api`)**:
  - Em `ListingsService.findBySlug`:
    - Inclusão da relação `events` filtrada por status `PUBLISHED` e data futura/atual (`startDate >= hoje`), ordenada cronologicamente com imagens e categoria.
    - Ordenação aprimorada de `serviceCategories.items` trazendo itens disponíveis primeiro (`isAvailable: 'desc'`) e por ordem numérica (`order: 'asc'`).
- **Frontend Next.js (`apps/web`)**:
  - **Mapeamento em `fetchPlaceDetail` ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Extração e formatação estruturada de `serviceCategories` e `upcomingEvents`.
  - **Interface Pública ([`apps/web/src/components/place/PlaceDetailView.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/place/PlaceDetailView.tsx))**:
    - **Cardápio & Catálogo de Serviços**: Seletor horizontal de abas por seções ("Todos os Itens", "Pizzas Especiais", etc.), cards de itens com fotos, descrições, preços formatados em R$, badge sutil de itens esgotados e botão de atalho para pedir diretamente via WhatsApp com mensagem personalizada contendo o nome do item.
    - **Shows & Programação Especial**: Seção temática exibindo os eventos e shows confirmados do estabelecimento, cartaz de divulgação, badges de entrada franca ou valor do couvert, data/horário formatados em português e botões de atalho para "Garantir Ingresso" ou "Reservar Mesa via WhatsApp".

### N. Gestão da Galeria de Fotos do Comerciante
- **Backend NestJS (`apps/api`)**:
  - **DTOs com Validação ([`apps/api/src/modules/listings/dto/gallery.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/dto/gallery.dto.ts))**:
    - `AddGalleryImagesDto`, `ReorderGalleryImagesDto` e `UpdateGalleryImageDto` com decorators `class-validator` e `class-transformer`.
  - **Serviço de Estabelecimentos ([`apps/api/src/modules/listings/listings.service.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.service.ts))**:
    - `getMerchantGallery`: listagem isolada das fotos do estabelecimento com ordenação por capa, ordem e data.
    - `addMerchantGalleryImages`: inserção em lote com cálculo de ordenação incremental e auto-definição da primeira imagem como capa caso não haja capa existente.
    - `setMerchantGalleryCover`: definição atômica de foto de capa (Hero), desmarcando capas anteriores, fixando ordem #1 e sincronizando automaticamente a coluna `Listing.coverUrl`.
    - `reorderMerchantGalleryImages`: atualização de ordem das fotos em lote via transação/promessas paralelas.
    - `deleteMerchantGalleryImage`: exclusão com validação de posse e promoção automática da próxima foto como capa caso a foto deletada fosse a capa ativa.
  - **Controlador REST ([`apps/api/src/modules/listings/listings.controller.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.controller.ts))**:
    - Endpoints sob `/api/v1/listings/merchant/gallery` protegidos com `JwtAuthGuard` e `RolesGuard` (`MERCHANT` e `ADMIN`).
- **Frontend Next.js (`apps/web`)**:
  - **Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Adicionadas interfaces `MerchantGalleryImage` e `MerchantGalleryData`.
    - Funções: `fetchMerchantGallery`, `addMerchantGalleryImagesApi`, `setMerchantGalleryCoverApi`, `reorderMerchantGalleryImagesApi` e `deleteMerchantGalleryImageApi`.
  - **Interface do Painel do Comerciante ([`apps/web/src/app/comerciante/galeria/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/galeria/page.tsx))**:
    - Painel com 4 métricas: Total de Fotos, Foto de Capa (Hero) Ativa, Fotos no Mosaico do Topo (até 5) e Indicador de Qualidade Visual.
    - Banner explicativo sobre o impacto do mosaico principal (as 5 primeiras fotos formam a vitrine de topo da página pública).
    - Zona de upload com drag-and-drop e suporte a seleção de múltiplos arquivos simultâneos integrado com `/upload/images`.
    - Grade visual de fotos com badges de Capa Oficial e posição ordinal (#1 a #N), botões para definir como capa com 1 clique, setas de reordenação instantânea para a esquerda/direita e botão de exclusão com modal de confirmação.

### O. Painel de Avaliações e Reputação do Comerciante
- **Backend NestJS (`apps/api`)**:
  - **DTOs com Validação Estrita ([`apps/api/src/modules/reviews/dto/review.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/reviews/dto/review.dto.ts))**:
    - `ReplyReviewDto` para respostas públicas do lojista (mínimo de 3 caracteres e texto obrigatório).
    - `MerchantReviewFilterDto` com filtros opcionais por `listingId`, `rating` (1 a 5 estrelas), `status` (`ALL`, `PENDING`, `REPLIED`) e termo de busca textual `search`.
  - **Serviço de Avaliações ([`apps/api/src/modules/reviews/reviews.service.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/reviews/reviews.service.ts))**:
    - `findMerchantReviews`: consulta isolada das avaliações pertencentes exclusivamente aos estabelecimentos do parceiro autenticado, com métricas consolidadas (total de avaliações, média aritmética real calculada, contagem de respondidas vs. pendentes e histograma de distribuição de 1 a 5 estrelas).
    - `replyAsMerchant`: validação estrita de posse do estabelecimento avaliado pelo lojista (ou privilégio `ADMIN`) e gravação via `upsert` na tabela `ReviewReply` do Prisma.
    - `deleteReply`: remoção de resposta com verificação de autorização e preservação da avaliação original intacta.
  - **Controlador REST ([`apps/api/src/modules/reviews/reviews.controller.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/reviews/reviews.controller.ts))**:
    - `GET /api/v1/reviews/merchant/mine`: endpoint protegido por `JwtAuthGuard` e `RolesGuard` (`MERCHANT` e `ADMIN`) retornando as métricas e a listagem de avaliações filtrada.
    - `POST /api/v1/reviews/:id/reply`: registro ou atualização da resposta oficial do lojista.
    - `DELETE /api/v1/reviews/reply/:replyId`: exclusão de resposta oficial.
- **Frontend Next.js (`apps/web`)**:
  - **Integração de API ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts))**:
    - Interfaces tipadas `MerchantReviewItem`, `MerchantReviewsMetrics` e `MerchantReviewsData`.
    - Funções: `fetchMerchantReviews`, `replyMerchantReviewApi` e `deleteMerchantReviewReplyApi`.
  - **Interface do Painel do Comerciante ([`apps/web/src/app/comerciante/avaliacoes/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/avaliacoes/page.tsx))**:
    - Painel com 4 cards de métricas em tempo real: Nota Média Geral (com estrelas visuais), Total de Avaliações, Avaliações Respondidas e Pendentes de Resposta (com badge de atenção caso haja pendências).
    - Barra de filtros com busca textual por cliente/comentário, seletor de estabelecimento para parceiros com múltiplos negócios, filtro por pontuação (1 a 5★) e abas de status (Todas, Aguardando Resposta, Respondidas).
    - Feed de avaliações com cabeçalho do avaliador, data em formato relativo ("há 2 dias", etc.), estrelas douradas, badge do estabelecimento correspondente e texto do depoimento.
    - Caixa de resposta oficial destacada em verde/esmeralda com data e identificador do comerciante, além de botão para editar ou excluir a resposta.
    - Formulário inline expansível para responder na hora, com dicas de boas práticas de atendimento e feedback imediato de sucesso.

  - **Exibição Pública da Resposta Oficial ([`apps/web/src/components/place/PlaceDetailView.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/place/PlaceDetailView.tsx))**:
    - Mapeamento completo de avaliações reais e respostas em `fetchPlaceDetail` ([`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts)).
    - Renderização da resposta oficial do comerciante diretamente no card de cada avaliação do cliente na página pública do local (`/[city]/lugar/[slug]`), com badge de verificação verde esmeralda ("Resposta Oficial"), identificação da gerência do estabelecimento e data formatada.

### P. Painel de Promoções, Cupons & Vouchers do Comerciante
- **Modelagem Prisma & PostgreSQL ([`apps/api/prisma/schema.prisma`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/prisma/schema.prisma))**:
  - Enums `DiscountType` (`PERCENTAGE`, `FIXED_AMOUNT`, `FREEBIE`, `CUSTOM`) e `CouponStatus` (`ACTIVE`, `PAUSED`, `EXPIRED`).
  - Modelos `Coupon` e `CouponClaim` com relacionamentos em cascata com `Listing`, `MerchantProfile` e `User`.
  - Migrações aplicadas no banco PostgreSQL em execução.
- **Backend NestJS (`apps/api`)**:
  - DTOs `CreateCouponDto`, `UpdateCouponDto`, `CouponFilterDto` e `ClaimCouponDto` em [`apps/api/src/modules/coupons/dto/coupon.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/coupons/dto/coupon.dto.ts).
  - Serviço [`CouponsService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/coupons/coupons.service.ts) com validação de posse, métricas de resgates, controle de concorrência e geração de códigos de resgate (`VOUCH-XXXX`).
  - Controlador REST [`CouponsController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/coupons/coupons.controller.ts) com rotas autenticadas sob `/api/v1/coupons/merchant` e públicas sob `/api/v1/coupons/public`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens e funções clientes em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Painel [`/comerciante/cupons`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/cupons/page.tsx) com 4 cards de métricas (Total, Ativas, Resgates, Economia Gerada), filtros, alternador de status com 1 clique, modais de criação/edição e visualizador de clientes que resgataram vouchers.
  - Exibição de cupons ativos com cópia de código em 1 clique na página pública do local [`PlaceDetailView.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/place/PlaceDetailView.tsx).

## 7. Diretrizes Persistidas de Memória
Conforme regra do usuário registrada em `GEMINI.md` no workspace e na configuração global:
- Todas as alterações, correções e implementações devem obrigatoriamente manter o `CONTEXTO.md` atualizado com o histórico, decisões e status da plataforma.

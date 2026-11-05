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

### Q. Módulo de Notificações em Tempo Real do Comerciante
- **Modelagem Prisma & PostgreSQL ([`apps/api/prisma/schema.prisma`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/prisma/schema.prisma))**:
  - Modelo `Notification` com enum `NotificationType` (`NEW_REVIEW`, `REVIEW_REPLIED`, `CONTACT_MESSAGE`, `COUPON_CLAIMED`, `EVENT_RSVP`, `SYSTEM_ALERT`), flags de leitura (`isRead`, `readAt`) e metadados JSON flexíveis.
  - Relação em cascata com `User.notifications` e índices compostos por usuário e status de leitura.
- **Backend NestJS (`apps/api`)**:
  - Módulo global `NotificationsModule` e serviço [`NotificationsService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/notifications/notifications.service.ts) com método de envio em lote `notifyListingOwners`.
  - Disparos automáticos integrados:
    - Ao submeter uma nova avaliação em estabelecimento (`ReviewsService`), os proprietários são alertados com nota e nome do cliente.
    - Ao resgatar voucher/cupom promocional (`CouponsService`), os parceiros são notificados com o código do resgate.
  - Endpoints sob `/api/v1/notifications`: `GET /mine`, `PATCH /:id/read`, `PATCH /read-all` e `DELETE /:id`.
- **Frontend Next.js (`apps/web`)**:
  - Componente interativo [`MerchantNotificationsBell.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/merchant/MerchantNotificationsBell.tsx) com polling automático em segundo plano a cada 30 segundos, badge animado de não lidas (`animate-ping`), popover com lista de alertas categorizados por ícones e marcação rápida como lida.
  - Integração no topo da interface mobile e barra superior do layout do comerciante ([`apps/web/src/app/comerciante/layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/layout.tsx)), além de novo link direto no menu lateral para "Promoções & Cupons".

### R. Exportação de Relatórios de Reputação em PDF e Excel (CSV)
- **Frontend Next.js (`apps/web`)**:
  - Implementada exportação com 1 clique de relatórios de satisfação e depoimentos em [`apps/web/src/app/comerciante/avaliacoes/page.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/avaliacoes/page.tsx).
  - **Exportação Excel (.csv)**: Geração client-side com codificação UTF-8 BOM (`\uFEFF`) preservando acentuação em português, estruturando colunas de ID, data, estabelecimento, nome do cliente, nota de 1 a 5★, depoimento na íntegra, status de resposta, texto da réplica oficial e data de resposta.
  - **Relatório Executivo em PDF / Impressão**: Layout customizado com regras `@media print`, incluindo cabeçalho institucional com marca oficial, data/hora de emissão, identificação do lojista credenciado, painel com as 4 métricas consolidadas (nota média, total de avaliações, taxa de resposta e pendências) e listagem formatada dos depoimentos.

### S. Configurações e Dados da Conta do Comerciante
- **Modelagem Prisma & PostgreSQL ([`apps/api/prisma/schema.prisma`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/prisma/schema.prisma))**:
  - Extensão do modelo `MerchantProfile` com campos fiscais e financeiros: `legalName`, `cnpj`, `whatsapp`, `pixKey`, `pixKeyType`, `bankName`, `bankAgency`, `bankAccount` e `address`.
- **Backend NestJS (`apps/api`)**:
  - DTOs `UpdateMerchantProfileDto` e `ChangePasswordDto` em [`apps/api/src/modules/auth/dto/merchant-profile.dto.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/auth/dto/merchant-profile.dto.ts).
  - Métodos em [`AuthService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/auth/auth.service.ts):
    - `getMerchantProfile`: consulta completa dos dados do usuário e perfil do lojista (com auto-provisionamento caso não exista).
    - `updateMerchantProfile`: sincronização atômica de dados pessoais e fiscais da empresa parceira.
    - `changePassword`: verificação criptográfica com Argon2 da senha atual e gravação segura da nova credencial.
  - Endpoints sob `/api/v1/auth`: `GET /merchant-profile`, `PUT /merchant-profile` e `POST /change-password` protegidos por `JwtAuthGuard`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens e funções clientes em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts) (`fetchMerchantProfileApi`, `updateMerchantProfileApi`, `changeMerchantPasswordApi`).
  - Interface moderna com abas em [`/comerciante/perfil`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/perfil/page.tsx) e re-export em [`/comerciante/configuracoes`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/configuracoes/page.tsx):
    - **Dados do Responsável**: foto/avatar com upload direto, nome completo, e-mail fixo e telefone.
    - **Dados da Empresa**: nome fantasia, razão social, CNPJ e WhatsApp comercial de atendimento.
    - **Dados Bancários & PIX**: seletor de chave PIX (CNPJ, CPF, Email, Telefone, Aleatória), chave e dados da agência/conta para liquidação financeira.
    - **Segurança & Senha**: formulário com alternadores de visibilidade de senha (Eye / EyeOff) e validação de tamanho mínimo.

### T. Validação de Vouchers no Balcão (Frente de Caixa / PDV)
- **Backend NestJS (`apps/api`)**:
  - DTO `ValidateVoucherDto` e métodos `validateVoucher` e `redeemVoucher` em [`CouponsService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/coupons/coupons.service.ts).
  - Verificação de posse do estabelecimento, checagem de validade, bloqueio de vouchers já utilizados e baixa atômica com gravação do timestamp `usedAt`.
  - Disparo de notificação em tempo real ao lojista informando a baixa do voucher no balcão.
  - Endpoints `POST /api/v1/coupons/merchant/validate-voucher` e `POST /api/v1/coupons/merchant/redeem-voucher`.
- **Frontend Next.js (`apps/web`)**:
  - Funções de integração `validateVoucherApi` e `redeemVoucherApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Tela de frente de balcão / PDV em [`/comerciante/validar-voucher`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/validar-voucher/page.tsx) com consulta por código, botão de colar da área de transferência, card de status visual (Válido, Já Utilizado, Expirado), botão de baixa imediata e histórico recente da sessão.
  - Adicionado atalho "Validar Vouchers" com ícone `QrCode` no menu lateral do painel ([`layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/layout.tsx)).

### U. Dashboard de Estatísticas e Desempenho do Comerciante
- **Backend NestJS (`apps/api`)**:
  - Endpoint `GET /api/v1/listings/merchant/stats` atualizado para aceitar filtro de período (`period: '7d' | '30d' | '90d'`).
  - Cálculo de métricas consolidadas (visualizações totais, leads WhatsApp, rotas/direções abertas, chamadas telefônicas e vouchers resgatados), agrupamento de série temporal diária (`timeline`) com base em `ListingDailyMetric` e listagem ranqueada por estabelecimento.
- **Frontend Next.js (`apps/web`)**:
  - Nova página de estatísticas em [`/comerciante/estatisticas`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/estatisticas/page.tsx):
    - Seletor rápido de períodos (7 dias, 30 dias e 90 dias).
    - 4 Cards Hero interativos de métricas (Visualizações, WhatsApp, Rotas no Mapa, Vouchers) com alternador direto da métrica exibida no gráfico.
    - Gráfico dinâmico SVG com barras animadas, tooltips em tempo real ao passar o cursor e visualização responsiva.
    - Tabela de desempenho ranqueado por estabelecimento com atalhos diretos para as páginas públicas correspondentes.
    - Seção editorial com 3 dicas estratégicas para maximizar conversões de visitantes em clientes.

### V. Painel de Moderação Master de Cupons e Comunicados em Massa
- **Backend NestJS (`apps/api`)**:
  - Métodos `findAllCoupons`, `updateCouponStatusAdmin` e `broadcastNotification` em [`AdminService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/admin/admin.service.ts).
  - Endpoints sob `/api/v1/admin`:
    - `GET /admin/coupons`: listagem global com métricas e filtros.
    - `PATCH /admin/coupons/:id/status`: pausa ou ativação forçada de cupons.
    - `POST /admin/notifications/broadcast`: disparo em massa de comunicados oficiais por perfil (`MERCHANT`, `USER` ou `ALL`).
- **Frontend Next.js (`apps/web`)**:
  - Tela de moderação global em [`/admin/cupons`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/cupons/page.tsx) com métricas da cidade, filtros por status e alternador rápido.
  - Tela de comunicados e avisos em massa em [`/admin/comunicados`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/comunicados/page.tsx) com seletor de público alvo, preview do alerta e histórico de envios.
  - Links adicionados na navegação lateral do painel master ([`apps/web/src/app/admin/layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/layout.tsx)).

### W. Envio de Notificações por E-mail (Nodemailer / SMTP)
- **Backend NestJS (`apps/api`)**:
  - Módulo global `MailModule` e serviço [`MailService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/common/mail/mail.service.ts) baseado em `nodemailer` com suporte a SMTP de produção e fallback para modo de desenvolvimento/simulação JSON.
  - Template HTML responsivo de alta fidelidade visual para alertas de novas avaliações:
    - Banner comemorativo verde para notas 5 estrelas ("🌟 Parabéns! Nova Avaliação 5 Estrelas!").
    - Banner de alerta vermelho para notas críticas <= 2 estrelas ("⚠️ Atenção: Novo Feedback do Cliente Requer Sua Resposta").
    - Transcrição do comentário, nome do avaliador, estrelas formatadas e botão de ação (CTA) direto para resposta rápida no painel.
  - Disparo automático integrado no momento da criação de avaliações em [`ReviewsService.create`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/reviews/reviews.service.ts).

### X. Planos de Destaque e Checkout de Pagamento do Comerciante
- **Modelagem Prisma & Banco de Dados (`apps/api/prisma/schema.prisma`)**:
  - Enums criados: `SubscriptionPlan` (`BRONZE_DESTAQUE`, `PRATA_REGIONAL`, `OURO_MASTER`), `PaymentStatus` (`PENDING`, `PAID`, `CANCELED`, `REFUNDED`), `PaymentMethod` (`PIX`, `CREDIT_CARD`, `BOLETO`).
  - Modelos relacionais adicionados e sincronizados no PostgreSQL (porta 4103):
    - `MerchantSubscription`: armazena plano, ciclo (`MONTHLY` ou `YEARLY`), preço, chave PIX Copia e Cola (`pixQrCode`), URL da fatura, datas de início e vigência (`startDate`, `endDate`), vinculado a `MerchantProfile` e ao anúncio (`Listing`).
    - `SubscriptionPayment`: histórico financeiro das parcelas/faturas com valor, método e timestamp de liquidação (`paidAt`).
- **Backend NestJS (`apps/api`)**:
  - Módulo `BillingModule` registrado em `AppModule`.
  - Serviço [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts): catálogo de planos, checkout PIX dinâmico, confirmação atômica e ativação de destaque (`Listing.isFeatured = true`).
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) sob `/api/v1/billing` (`/plans`, `/merchant/subscriptions`, `/checkout`, `/confirm/:id`).
- **Frontend Next.js (`apps/web`)**:
  - Página de checkout em [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx) com comparativo de planos, chave PIX Copia e Cola, simulação instantânea e tabela de assinaturas ativas.

### Y. Destaque Visual e Priorização de Planos no Guia Público
- **Backend NestJS (`apps/api`)**:
  - Métodos `findAll` e `findBySlug` em [`ListingsService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.service.ts) agora incluem o relacionamento `subscriptions` ativas com status `PAID` e vigência válida (`endDate >= now()`).
  - Retorno mapeado com campo virtual `featuredPlan` (`OURO_MASTER`, `PRATA_REGIONAL`, `BRONZE_DESTAQUE` ou `null`).
- **Frontend Next.js (`apps/web`)**:
  - Interfaces `MapPlaceItem` e `PlaceDetailData` atualizadas com `featuredPlan`.
  - Mapeador `mapListingToMapPlaceItem` e `fetchPlaceDetail` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts) sincronizados com o plano contratado.
  - **Diretório Público ([`DirectoryPlacesClient.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/directory/DirectoryPlacesClient.tsx))**:
    - **Algoritmo de Priorização**: estabelecimentos com plano `OURO_MASTER` (peso 3) ranqueados no topo absoluto, seguidos por `PRATA_REGIONAL` (peso 2), `BRONZE_DESTAQUE` (peso 1) e demais (peso 0).
    - **Badges Visuais Ricos**:
      - `OURO_MASTER`: badge dourado `👑 Ouro VIP` com borda e glow, além de ring âmbar no card.
      - `PRATA_REGIONAL`: badge `⭐ Prata Regional` com borda azul e ring sky no card.
      - `BRONZE_DESTAQUE`: badge `★ Destaque` verificado.
  - **Página de Detalhes ([`PlaceDetailView.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/place/PlaceDetailView.tsx))**:
    - Selo oficial destacado no cabeçalho com coroa pulsante dourada para o plano Ouro Master VIP e selo prateado para o plano Prata Regional.

### Z. Rotina Cron e Notificações de Vencimento de Assinatura
- **Modelagem Prisma (`apps/api/prisma/schema.prisma`)**:
  - Adicionado valor `EXPIRED` ao enum `PaymentStatus` e sincronizado com o banco de dados PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Serviço [`SubscriptionCronService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/subscription-cron.service.ts):
    - Ciclo de vida com `OnApplicationBootstrap` (inicia checagem inicial e timer periódico a cada 12 horas) e `OnModuleDestroy` para limpeza de timers.
    - **Varredura de Assinaturas Expiradas**:
      - Atualiza status para `EXPIRED`.
      - Verifica se o anúncio possui outra assinatura ativa; caso não possua, reverte o destaque do anúncio (`Listing.isFeatured = false`).
      - Dispara notificação in-app ao comerciante alertando sobre a expiração.
      - Dispara e-mail via `MailService.sendSubscriptionExpiredEmail` com link direto para reativação.
    - **Aviso Preventivo de Vencimento (≤ 3 dias)**:
      - Identifica planos prestes a expirar.
      - Dispara notificação in-app preventiva.
      - Dispara e-mail via `MailService.sendSubscriptionExpiringEmail` informando os dias restantes e link para renovação.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts):
    - `POST /api/v1/billing/admin/process-expirations` protegido por `JwtAuthGuard` e `Roles(Role.ADMIN)` para acionamento sob demanda ou via webhook/cron externo.

### AA. Painel Financeiro e Gestão de Receitas de Assinaturas (/admin/financeiro)
- **Backend NestJS (`apps/api`)**:
  - Método `getAdminFinancialOverview` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Agregação consolidada de receitas: faturamento total liquidado, faturamento do mês vigente, volume de faturas pendentes e total de assinaturas ativas distribuídas por categoria de plano (`OURO_MASTER`, `PRATA_REGIONAL`, `BRONZE_DESTAQUE`).
    - Série histórica de receita mensal dos últimos 6 meses.
    - Log de auditoria das últimas 50 transações contendo estabelecimento, razão social do lojista, ciclo de vigência e formas de pagamento.
  - Endpoint `GET /api/v1/billing/admin/financial-overview` protegido por `JwtAuthGuard` e `Roles(Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Funções de integração e tipagens `fetchAdminFinancialOverviewApi` e `FinancialOverviewData` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Nova tela de gestão em [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx):
    - 4 Cards de métricas financeiras (Receita Total, Faturamento Mês, Assinaturas Ativas e Pendências).
    - Gráfico interativo com barras verticais e tooltips dinâmicos da série temporal dos últimos 6 meses.
    - Tabela de transações com filtros por status (`PAID`, `PENDING`, `EXPIRED`) e busca textual em tempo real.
    - Exportador de relatórios em CSV para conciliação contábil e fiscal.
  - Atalho "Financeiro & Planos" com ícone `DollarSign` adicionado à navegação principal do painel master ([`layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/layout.tsx)).

### AB. Integração de Gateway de Pagamento Asaas (PIX & Webhook)
- **Modelagem Prisma (`apps/api/prisma/schema.prisma`)**:
  - Campo `asaasCustomerId` adicionado ao modelo `MerchantProfile` para persistência do ID de cliente no ecossistema Asaas e sincronizado via `prisma db push`.
- **Backend NestJS (`apps/api`)**:
  - Módulo e serviço [`AsaasService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/asaas.service.ts):
    - Suporte a ambientes Sandbox (`https://sandbox.asaas.com/api/v3`) e Produção (`https://api.asaas.com/api/v3`) com token de autenticação via header `access_token`.
    - Resiliência integrada: geração de cobranças PIX, fallback para PIX dinâmico com payload padrão BACEN quando em modo offline/desenvolvimento local.
    - Métodos para criar/obter cliente Asaas (`getOrCreateCustomer`) e gerar cobrança PIX com vencimento e QR Code (`createPixCharge`).
  - Atualização do [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - `createCheckout` agora aciona `asaasService.createPixCharge`, salvando `gatewayPaymentId`, `pixCopiaECola` e `pixQrCodeUrl`.
    - Novo método `confirmPaymentByGateway` para processamento seguro e idempotente de pagamentos recebidos pelo gateway.
  - Endpoint de Webhook no [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts):
    - `POST /api/v1/billing/webhook/asaas` para escutar eventos `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`.
    - Suporte à validação do header `asaas-access-token` via variável `ASAAS_WEBHOOK_SECRET`.
    - Ativação instantânea de assinatura, marcação do anúncio com `isFeatured = true` e registro de data de pagamento.

### AC. Emissão e Download de Fatura/Recibo Oficial de Prestação de Serviços em PDF (/comerciante/fatura/[id])
- **Backend NestJS (`apps/api`)**:
  - Método `getInvoiceDetails` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Estruturação completa do documento contábil e fiscal de publicidade digital: dados do prestador (`Os Melhores da Cidade Tecnologia e Publicidade Digital Ltda.`, CNPJ `48.219.832/0001-45`), dados do tomador (empresa, CPF/CNPJ, responsável, telefone e endereço do estabelecimento), identificador da fatura (`FAT-2026-...`), chave de autenticação digital (`OSM-...`), detalhamento dos serviços veiculados e períodos de vigência.
    - Validação de segurança e escopo de permissões garantindo acesso exclusivo ao comerciante titular ou administradores da plataforma.
  - Endpoint `GET /api/v1/billing/merchant/invoice/:id` em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegido por `JwtAuthGuard` e `Roles(Role.MERCHANT, Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Interfaces tipadas `InvoiceData` e cliente de requisições `fetchInvoiceDetailsApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Página dedicada de visualização e emissão em [`/comerciante/fatura/[id]`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/fatura/[id]/page.tsx):
    - Documento oficial no formato folha A4 com identidade visual timbrada, badge dinâmico de liquidação (`QUITADO / PAGO`), tabela descritiva de serviços com valores brutos e líquidos, dados de liquidação e chave de validação criptográfica.
    - Botão "Imprimir / Salvar em PDF" com regras avançadas de estilo `@media print` (ocultamento de controles e barra superior na impressão, escala A4 limpa e nítida).
  - Ação "Recibo / PDF" integrada à listagem de assinaturas do painel do comerciante em [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx) com ícone `FileText` e abertura direta do documento.

### AD. Gestão de Cupons Promocionais no Checkout de Assinaturas
- **Modelagem Prisma (`apps/api/prisma/schema.prisma`)**:
  - Novo modelo `SubscriptionCoupon` com código único, tipo de desconto (`PERCENTAGE` ou `FIXED_AMOUNT`), valor, limite de usos (`maxUses`), contador (`usedCount`), vigência e status ativo.
  - Campos `discountAmount` e `couponId` com relacionamento adicionados ao modelo `MerchantSubscription`. Sincronizado com o PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Métodos `validateCoupon`, `getSubscriptionCoupons`, `createSubscriptionCoupon` e `toggleSubscriptionCoupon` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts).
  - Inicialização automática via `OnApplicationBootstrap` de cupons padrão (`PRIMEIRO_MES` com 50% OFF e `INAUGURACAO20` com 20% OFF).
  - Integração do abatimento no checkout e gateway Asaas: cálculo do valor líquido com desconto, incremento de usos e vinculação na assinatura e fatura.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts):
    - `POST /api/v1/billing/validate-coupon`
    - `GET /api/v1/billing/admin/coupons` (Admin)
    - `POST /api/v1/billing/admin/coupons` (Admin)
    - `PATCH /api/v1/billing/admin/coupons/:id/toggle` (Admin)
- **Frontend Next.js (`apps/web`)**:
  - Cliente e tipagens `validateSubscriptionCouponApi`, `CouponValidationResult` e `SubscriptionCouponItem` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Campo interativo de cupom de desconto promocional no modal de contratação em [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx), com validação em tempo real, visualização de economia e recálculo dinâmico do valor do PIX.
  - Discriminação do cupom e abatimento no comprovante oficial de prestação de serviços (`/comerciante/fatura/[id]`).

### AE. Envio Automático de Fatura e Comprovante de Pagamento por E-mail
- **Backend NestJS (`apps/api`)**:
  - Novo método `sendSubscriptionPaidInvoiceEmail` em [`MailService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/common/mail/mail.service.ts):
    - Disparo de e-mail transacional HTML estilizado com identidade visual completa do guia (cabeçalho esmeralda, resumo tabular da contratação, dados do estabelecimento, valor liquidado, vigência, número da fatura e chave criptográfica de autenticação digital).
    - Botão CTA destacado com link direto e seguro para o recibo/fatura oficial em PDF (`/comerciante/fatura/[id]`).
  - Integração com o fluxo de liquidação no [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Acionado instantaneamente tanto na confirmação direta via PIX quanto no recebimento de webhooks do gateway Asaas (`PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`).

### AF. Migração e Upgrade de Planos com Cálculo Pró-Rata
- **Backend NestJS (`apps/api`)**:
  - Métodos `calculatePlanChange` e `createPlanChangeCheckout` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Algoritmo de Pró-Rata preciso: cálculo dos dias restantes da vigência da assinatura atual, apuração da taxa diária e crédito residual proporcional não utilizado.
    - Abatimento integral do crédito acumulado no valor da contratação do novo plano (mensal ou anual), com suporte à acumulação de cupons promocionais adicionais.
    - Geração de cobrança PIX no gateway Asaas correspondente ao valor líquido proporcional.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegidos por `JwtAuthGuard` e `Roles(Role.MERCHANT, Role.ADMIN)`:
    - `POST /api/v1/billing/change-plan/calculate`: simulação em tempo real do crédito residual e valor da diferença.
    - `POST /api/v1/billing/change-plan/checkout`: geração da cobrança e QR Code PIX com pró-rata.
- **Frontend Next.js (`apps/web`)**:
  - Funções de integração `calculatePlanChangeApi`, `createPlanChangeCheckoutApi` e interface `PlanChangeCalculation` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Ação dedicada "Upgrade" com ícone `ArrowUpCircle` na tabela de planos contratados (`/comerciante/planos`).
  - Modal interativo de Upgrade com Pró-Rata: seleção visual de novo plano (ex: Bronze -> Prata/Ouro), toggle de ciclo, card discriminando dias restantes, crédito abatido e total líquido a pagar com confirmação instantânea via PIX.

### AG. Relatório de Desempenho e Retorno sobre Investimento (ROI) dos Planos VIP
- **Backend NestJS (`apps/api`)**:
  - Método `getMerchantRoiPerformance` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Agregação analítica das métricas de engajamento dos estabelecimentos com planos pagos (`viewsCount`, `whatsappClicks`, `phoneClicks`, `directionsClicks`).
    - Comparativo de benchmark contra a média dos anúncios sem destaque da cidade (apurando multiplicador de alcance de 3.8x e multiplicador de leads diretos de 4.5x).
    - Métricas financeiras de retorno: apuração de Custo por Lead (CPL médio), estimativa de conversões qualificadas e percentual de ROI sobre o valor investido.
  - Endpoint `GET /api/v1/billing/merchant/roi-performance` em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegido por `JwtAuthGuard` e `Roles(Role.MERCHANT, Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Interfaces tipadas `MerchantRoiPerformanceData` e cliente `fetchMerchantRoiPerformanceApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Painel com cards de impacto e ROI integrado na tela [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx) com visual premium em gradiente escuro/dourado, exibindo alcance no guia, multiplicadores comparativos, CPL médio e estimativa de novas vendas geradas.

### AH. Configuração de Chave PIX e Splits de Pagamento para Franquias/Cidades
- **Modelagem Prisma (`apps/api/prisma/schema.prisma`)**:
  - Modelo `City` expandido com campos de Franquia Regional: `franchiseName`, `franchiseCnpj`, `franchisePixKey`, `franchisePixType`, `franchiseWalletId` (Asaas), `platformFeePercent` (default 20%), `franchiseFeePercent` (default 80%) e `splitEnabled`.
  - Sincronizado no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Suporte à configuração de `split` no [`AsaasService.createPixCharge`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/asaas.service.ts), repassando os parâmetros de carteira do Asaas (`walletId`) e percentuais de split na cobrança PIX.
  - Métodos `getAdminCitySplits` e `updateCitySplit` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts) para gerenciamento completo dos parceiros regionais por cidade.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegidos por `JwtAuthGuard` e `Roles(Role.ADMIN)`:
    - `GET /api/v1/billing/admin/city-splits`: listagem de todas as cidades com regras de split e dados de franquia.
    - `PATCH /api/v1/billing/admin/city-splits/:cityId`: atualização cadastral e financeira da franquia local.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `CitySplitItem` e clientes `fetchAdminCitySplitsApi`, `updateAdminCitySplitApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Nova seção no painel financeiro master [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx):
    - Tabela de cidades com badges de status do split, identificação do parceiro regional, chave PIX e relação de divisão (ex: 80% Local / 20% Matriz).
    - Modal interativo para configuração de franqueado, chave PIX, carteira Asaas e percentuais customizados de repasse.

### AI. Notificações de Renovação e Vencimento de Assinatura via WhatsApp e E-mail
- **Backend NestJS (`apps/api`)**:
  - Métodos `getExpiringSubscriptions` e `processSubscriptionRenewals` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Consulta em tempo real das assinaturas prestes a expirar (janela de 7 dias ou recém-vencidas).
    - Montagem de mensagem humanizada com link direto de renovação pré-formatada para WhatsApp API (`wa.me/55...`).
    - Disparo automático de e-mail de alerta de expiração via `MailService.sendSubscriptionExpiringEmail` e `sendSubscriptionExpiredEmail`.
    - Registro de notificações internas no sistema (`Notification`) para o comerciante.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegidos por `JwtAuthGuard` e `Roles(Role.ADMIN)`:
    - `GET /api/v1/billing/admin/expiring-subscriptions`: listagem de assinaturas a vencer com links do WhatsApp.
    - `POST /api/v1/billing/admin/process-renewals`: rotina em lote de disparo de notificações por e-mail e painel.
- **Frontend Next.js (`apps/web`)**:
  - Tipagem `ExpiringSubscriptionItem`, `ProcessRenewalsResult` e clientes `fetchExpiringSubscriptionsApi`, `processSubscriptionRenewalsApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Banner dinâmico de atenção no painel [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx) alertando sobre vencimento próximo (<= 7 dias) com botão de renovação em 1 clique.
  - Seção "Lembretes de Renovação & Vencimentos (WhatsApp & E-mail)" no painel [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx) com botão de envio em lote e acionamento direto via WhatsApp Web com mensagem pré-formatada.

### AJ. Painel Restrito do Franqueado Regional da Cidade
- **Modelagem Prisma & Shared**:
  - Adicionada role `FRANCHISEE` no enum `Role` e `UserRole` (`@os-melhores-da-cidade/shared`).
  - Campo `franchiseCityId` e relação `City.franchisees` no modelo `User` sincronizados no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Novo módulo dedicado `FranchiseModule` com [`FranchiseService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.service.ts) e [`FranchiseController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.controller.ts) protegidos por `JwtAuthGuard` e `Roles(Role.FRANCHISEE, Role.ADMIN)`:
    - `GET /api/v1/franchise/overview`: consolidação dos estabelecimentos da cidade, assinaturas VIP ativas, faturamento bruto da praça e comissão líquida do franqueado.
    - `GET /api/v1/franchise/merchants`: busca e filtragem dos comerciantes locais com dados de contato, status do plano e links diretos para WhatsApp.
    - `GET /api/v1/franchise/subscriptions`: extrato detalhado de pagamentos da cidade com cálculo transparente do split (80% Local / 20% Matriz).
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `FranchiseOverviewData`, `FranchiseMerchantItem`, `FranchiseSubscriptionItem` e funções clientes em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Página dedicada [`/franqueado`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/franqueado/page.tsx) com 4 cards de KPIs da praça, abas interativas de "Comércios da Sua Praça" e "Extrato de Splits", busca de lojistas e botões de contato direto via WhatsApp.
  - Atalho no menu do painel administrativo [`/admin/layout.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/layout.tsx).

### AK. Extrato de Repasses e Liquidação de Splits Asaas
- **Backend NestJS (`apps/api`)**:
  - Método `getAdminSplitSettlements` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Apuração consolidada de todos os pagamentos quitados de planos de destaque.
    - Rateio exato por cidade de acordo com os percentuais de split e identificação das carteiras Asaas / chaves PIX de destino.
    - Totalizadores acumulados: Valor Bruto Arrecadado, Total Repassado aos Franqueados e Retenção Líquida da Matriz.
  - Endpoint `GET /api/v1/billing/admin/split-settlements` em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegido por `JwtAuthGuard` e `Roles(Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `SplitSettlementItem`, `SplitSettlementsResponse` e cliente `fetchAdminSplitSettlementsApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Seção analítica no painel [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx) com 3 cards de conciliação bancária de splits e tabela detalhada por transação.
  - Botão de **Exportação CSV** com codificação UTF-8 BOM (`\uFEFF`) para conciliação contábil e auditoria financeira das comissões repassadas.

### AL. Notificações Push no Navegador (Web Push / Service Worker)
- **Modelagem Prisma (`apps/api/prisma/schema.prisma`)**:
  - Novo modelo `WebPushSubscription` armazenando endpoints de navegadores, chaves `p256dh` e `auth` criptográficas, user-agent e vinculação com `User`. Sincronizado no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Biblioteca `web-push` configurada com par de chaves VAPID oficiais.
  - Serviço [`WebPushService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/notifications/web-push.service.ts) gerenciando inscrições, limpeza de endpoints expirados (410/404) e envio em segundo plano.
  - Integração no [`NotificationsService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/notifications/notifications.service.ts): ao receber avaliações, mensagens de contato ou resgates de cupons, o push é disparado para os dispositivos do lojista.
  - Endpoints em [`NotificationsController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/notifications/notifications.controller.ts):
    - `GET /api/v1/notifications/push/vapid-key`: chave pública para registro no Service Worker.
    - `POST /api/v1/notifications/push/subscribe`: gravação da assinatura do navegador.
    - `POST /api/v1/notifications/push/unsubscribe`: cancelamento da assinatura.
    - `POST /api/v1/notifications/push/test`: disparo de teste para verificação do alerta sonoro e visual.
- **Frontend Next.js (`apps/web`)**:
  - Service Worker dedicado [`/public/sw-push.js`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/public/sw-push.js) escutando eventos de push em segundo plano e direcionando o foco do navegador com 1 clique.
  - Componente [`WebPushNotificationToggle.tsx`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/components/merchant/WebPushNotificationToggle.tsx) integrado em [`/comerciante/perfil`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/perfil/page.tsx) com detecção de compatibilidade, solicitação de permissão nativa, conversão de chave VAPID e botão para teste de alerta.

### AM. Testes Automatizados do Funil de Assinaturas e Splits
- **Suíte de Testes Jest (`apps/api/test/billing-funnel.spec.ts`)**:
  - Cobertura de 12 cenários automatizados cobrindo os pilares do ecossistema de billing:
    - **Cupons Promocionais**: aplicação de cupons percentuais e de valor fixo em reais, além da rejeição estrita de cupons expirados e com limite de utilização atingido.
    - **Split de Franquias**: validação do rateio de 80% franqueado local e 20% matriz para cidades com split ativo, e retenção de 100% da matriz em cidades sem franquia.
    - **Pró-Rata & Upgrade**: cálculo exato de taxa diária residual acumulada e abatimento no checkout de novos planos, impedindo cobranças negativas.
    - **Fatura e Recibo Oficial**: validação dos padrões de identificador fiscal `FAT-YYYY-XXXXXXXX` e código de verificação digital `OSM-XXXXXXXXXXXXXXXX`.
    - **Notificações de Vencimento**: verificação de urgência (<= 3 dias) e cálculo dos dias restantes para disparo de lembretes automáticos.

### AN. Integração de Checkout Transparente com Cartão de Crédito (Asaas Gateway)
- **Backend NestJS (`apps/api`)**:
  - `AsaasService` expandido com `createCreditCardCharge` suportando payload de cartão de crédito (`holderName`, `number`, `expiryMonth`, `expiryYear`, `ccv`), dados do portador (`creditCardHolderInfo`), configuração de split de comissões por cidade e fallback dinâmico para ambiente local.
  - `CreateCheckoutDto` atualizado com enum `PaymentMethod.CREDIT_CARD`, `creditCard` e `creditCardHolderInfo` validados com `class-validator`.
  - `BillingService.createCheckout`:
    - Processamento imediato de cobranças via cartão.
    - Aprovação instantânea ativando o plano (`status: PAID`), calculando `endDate` (30 dias para mensal ou 365 dias para anual) e aplicando o selo `isFeatured: true` no anúncio selecionado.
    - Contabilização automática do uso de cupons de desconto aplicados.
    - Disparo automático de e-mail com fatura e recibo detalhado para o lojista via `MailService`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `CreditCardPayload` e `CreditCardHolderPayload` integradas em `apps/web/src/lib/api.ts`.
  - Interface do modal de assinatura em `apps/web/src/app/comerciante/planos/page.tsx`:
    - Seletor de abas estilizado entre **PIX Instantâneo** e **Cartão de Crédito**.
    - Formulário seguro com campos formatados: Nome impresso, Número do cartão, Mês/Ano de validade, Código de segurança (CVV) e CPF/CNPJ do titular.
    - Feedback visual em tempo real e ativação imediata do destaque ao concluir a transação sem necessidade de aguardar compensação bancária.

### AO. Geração de Contrato de Publicidade e Adesão em PDF com Assinatura Digital
- **Backend NestJS (`apps/api`)**:
  - Método `getSubscriptionContract` implementado em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Apuração dos dados cadastrais da Contratada (Plataforma) e da Contratante (Comerciante/Estabelecimento).
    - Definição formal das 6 cláusulas jurídicas fundamentais: Objeto, Obrigações da Contratada, Obrigações da Contratante, Preço e Condições de Pagamento, Vigência e Rescisão, e Foro de Eleição com validade jurídica digital.
    - Geração de hash criptográfico de assinatura digital SHA-256 combinando contrato, identificador único, data de criação e secret digital.
  - Endpoint `GET /api/v1/billing/merchant/contract/:id` em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegido por `JwtAuthGuard` e verificação de titularidade do comerciante ou permissão de administrador.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `SubscriptionContractData`, `ContractClause` e função `fetchSubscriptionContractApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Página timbrada executiva [`/comerciante/contrato/[id]`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/contrato/[id]/page.tsx) com visual corporativo, qualificação jurídica das partes, exibição das cláusulas contratuais, carimbo de assinatura eletrônica conforme MP 2.200-2/2001 e botão de impressão/PDF.
  - Botão de acesso direto "Contrato" adicionado na listagem de planos do comerciante em [`/comerciante/planos`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/planos/page.tsx).

### AP. Funil de Prospecção Ativa e CRM Local para Franqueados
- **Modelagem Prisma & PostgreSQL (`apps/api/prisma/schema.prisma`)**:
  - Campos de CRM adicionados à tabela `Listing`: `leadStage` (default `"NOVO"`), `leadNotes` (texto de histórico e tratativas) e `leadLastContactAt` (data do último contato).
  - Migração de esquema aplicada com sucesso no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - DTO `UpdateLeadPipelineDto` em `apps/api/src/modules/franchise/dto/franchise.dto.ts` com validação estrita dos 6 estágios do funil: `NOVO`, `CONTATADO`, `NEGOCIACAO`, `PROPOSTA_ENVIADA`, `CONVERTIDO_VIP` e `PERDIDO`.
  - Método `updateLeadPipeline` em [`FranchiseService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.service.ts) com validação de praça do franqueado e atualização de data de contato.
  - Script persuasivo e personalizado de pitch de prospecção para WhatsApp integrado automaticamente em `getFranchiseMerchants`.
  - Endpoint `PATCH /api/v1/franchise/merchants/:listingId/pipeline` em [`FranchiseController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.controller.ts) protegido por `JwtAuthGuard` e `Roles(Role.FRANCHISEE, Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagem `FranchiseMerchantItem` e cliente `updateFranchiseLeadPipelineApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Aba interativa **"Funil de Prospecção (CRM Local)"** em [`/franqueado`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/franqueado/page.tsx):
    - 6 cards de contadores e filtros ágeis por estágio do funil.
    - Seletor de mudança de estágio em tempo real por estabelecimento com atualização imediata de estado.
    - Bloco de anotações com persistência rápida ("Salvar Nota").
    - Botão direto para WhatsApp com disparo do pitch comercial estruturado para conversão de planos VIP.

### AQ. Webhooks para Sistemas Externos e Automações (Zapier / CRM / Make)
- **Modelagem Prisma & PostgreSQL (`apps/api/prisma/schema.prisma`)**:
  - Novo modelo `WebhookEndpoint` com campos: `id`, `url`, `secret` (chave secreta para HMAC-SHA256), `description`, `events` (array de strings), `isActive`, `createdAt` e `updatedAt`. Sincronizado no banco PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Módulo e serviço [`WebhooksService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/webhooks/webhooks.service.ts):
    - Assinatura criptográfica `X-Signature: sha256={hmac}` e header de evento `X-Event`.
    - Método `dispatch(event, payload)` assíncrono em lote com timeout e tratamento de falhas resiliente.
    - Conectado ao funil de faturamento em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts) despachando o evento `SUBSCRIPTION_PAID` automaticamente quando pagamentos são quitados (Cartão de Crédito ou PIX).
  - Controller [`WebhooksController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/webhooks/webhooks.controller.ts) com rotas protegidas sob `/api/v1/admin/webhooks` (`GET /`, `POST /`, `DELETE /:id`, `POST /:id/test`).
- **Frontend Next.js (`apps/web`)**:
  - Tipagens e clientes `fetchAdminWebhooksApi`, `createAdminWebhookApi`, `deleteAdminWebhookApi` e `testAdminWebhookApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Seção dedicada em [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx):
    - Formulário para cadastro de novos webhooks com seleção de eventos (`SUBSCRIPTION_PAID`, `SPLIT_SETTLED`).
    - Tabela de endpoints ativos com visualização de secret mascarado.
    - Botão de **Testar Ping** simulando evento de conectividade em tempo real com indicador visual de status HTTP.

### AR. Relatório Consolidado de Faturamento para Fechamento Mensal em PDF
- **Backend NestJS (`apps/api`)**:
  - Método `getMonthlyClosingReport(year, month)` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Apuração cronológica de todos os lançamentos quitados no período selecionado (mês e ano de competência).
    - Totalização de Faturamento Bruto Arrecadado, Comissões Totais destinadas às Franquias Locais, Receita Líquida Retida pela Matriz, Ticket Médio e contadores de transações.
    - Rateio segregado por meio de pagamento (PIX Instantâneo vs Cartão de Crédito Gateway).
    - Demonstrativo contábil consolidado por praça/cidade com métricas de volume e repasses.
    - Geração de número oficial de fechamento (`FECH-YYYY-MM-XXXXXX`) e hash criptográfico SHA-256 de integridade contábil e auditoria.
  - Endpoint `GET /api/v1/billing/admin/monthly-closing` em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts) protegido por `JwtAuthGuard` e `Roles(Role.ADMIN)`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `MonthlyClosingReportData`, `MonthlyClosingSummary`, `CityClosingItem`, `MonthlyClosingTransaction` e cliente `fetchAdminMonthlyClosingReportApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Página timbrada executiva [`/admin/financeiro/fechamento`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/fechamento/page.tsx) com seletor de competência mensal, 4 cartões de consolidação financeira, balancete analítico com livro caixa detalhado, carimbo de autenticidade contábil e botão de impressão/salvar em PDF com regras `@media print`.
  - Botão de atalho rápido "Fechamento Mensal (PDF)" adicionado no painel administrativo principal em [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx).

### AS. Simulador Interativo de Faturamento para Novos Franqueados
- **Modelagem Prisma & PostgreSQL (`apps/api/prisma/schema.prisma`)**:
  - Novo modelo `FranchiseLead`: `id`, `name`, `email`, `phone`, `city`, `state`, `capitalAvailable`, `experience`, `notes`, `status` (default `"NOVO"`), `createdAt` e `updatedAt`. Sincronizado no banco PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - DTO `CreateFranchiseLeadDto` com validações para expansão da rede.
  - Métodos `createFranchiseLead` e `getFranchiseLeads` em [`FranchiseService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.service.ts).
  - Endpoint público `POST /api/v1/franchise/lead` e endpoint administrativo `GET /api/v1/franchise/leads` em [`FranchiseController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.controller.ts).
- **Frontend Next.js (`apps/web`)**:
  - Tipagem `CreateFranchiseLeadPayload` e cliente `createFranchiseLeadApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Landing Page completa em [`/seja-um-franqueado`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/seja-um-franqueado/page.tsx):
    - Hero institucional com proposta de valor da franquia digital e exclusividade por município.
    - **Calculadora Interativa de Lucro**: sliders para população da cidade (15k a 500k hab), quantidade de comércios VIPs (10 a 150 lojas) e ticket médio dos planos (Bronze R$ 79, Prata R$ 149, Ouro R$ 249).
    - Projeção em tempo real de Lucro Líquido Mensal (80% de split), Faturamento Anual da praça e tempo estimado de payback (ROI).
    - Seção com diferenciais tecnológicos (PWA sem app store, split automático Asaas e CRM de vendas nativo).
    - Formulário de candidatura e interesse integrado com feedback visual de confirmação.

### AT. Repasse Automatizado de Comissões via Transferência PIX Asaas
- **Modelagem Prisma & PostgreSQL (`apps/api/prisma/schema.prisma`)**:
  - Novo modelo `FranchisePayout`: `id`, `cityId`, `amount`, `pixKey`, `pixKeyType`, `franchiseName`, `status` (`"COMPLETED"`), `transactionId`, `receiptUrl`, `notes`, `transferredAt` e `createdAt`. Sincronizado no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - `AsaasService` com método `transferPix(params)` enviando `POST /transfers` no gateway bancário com mapeamento de chaves PIX (`CPF`, `CNPJ`, `EMAIL`, `PHONE`, `EVP`) e fallback amigável em ambiente de desenvolvimento.
  - Métodos `processCityFranchisePayout(cityId, requestedAmount)` e `getFranchisePayoutsHistory(cityId)` em [`BillingService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.service.ts):
    - Apura o montante de comissões acumuladas na cidade, deduz repasses já quitados e valida saldo disponível.
    - Efetua a transferência PIX bancária instantânea para a chave cadastrada da franquia.
    - Despacha o evento webhook `SPLIT_SETTLED` automaticamente para sistemas externos e conciliação contábil.
  - Endpoints em [`BillingController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/billing/billing.controller.ts): `POST /api/v1/billing/admin/payout/:cityId` e `GET /api/v1/billing/admin/payouts`.
- **Frontend Next.js (`apps/web`)**:
  - Tipagem `FranchisePayoutItem` e clientes `processCityFranchisePayoutApi` e `fetchFranchisePayoutsApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Gestão de Repasses integrada em [`/admin/financeiro`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/admin/financeiro/page.tsx):
    - Botão "Transferir PIX" na tabela de cidades com split ativo.
    - Modal interativo de confirmação com valor personalizável ou total apurado.
    - Tabela de "Histórico de Repasses PIX Realizados" com ID da transferência Asaas, comprovante bancário e data.

### AU. Central de Atendimento e Tickets de Suporte do Lojista
- **Modelagem Prisma & PostgreSQL (`apps/api/prisma/schema.prisma`)**:
  - Modelos `SupportTicket` e `SupportTicketMessage` vinculados ao `MerchantProfile`:
    - `SupportTicket`: `ticketNumber` (`TK-YYYY-XXXXXX`), `subject`, `category` (`FINANCEIRO`, `PLANO_VIP`, `ANUNCIO`, `DUVIDAS`, `TECNICO`), `priority` (`BAIXA`, `NORMAL`, `ALTA`, `URGENTE`), `status` (`ABERTO`, `EM_ANDAMENTO`, `RESPONDIDO`, `RESOLVIDO`), `assignedRole` e timestamps.
    - `SupportTicketMessage`: `senderId`, `senderName`, `senderRole` (`MERCHANT`, `FRANCHISEE`, `ADMIN`), texto da mensagem e data.
  - Sincronização executada com sucesso no PostgreSQL (porta 4103).
- **Backend NestJS (`apps/api`)**:
  - Módulo [`SupportModule`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/support/support.module.ts) com serviço [`SupportService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/support/support.service.ts) e controller [`SupportController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/support/support.controller.ts):
    - Abertura de chamados com identificação automática da cidade para direcionamento prioritário ao franqueado local ou matriz.
    - Endpoints de listagem, detalhes de conversas em timeline, respostas bidirecionais e encerramento de chamado.
- **Frontend Next.js (`apps/web`)**:
  - Tipagens `SupportTicketItem`, `SupportTicketMessageItem` e clientes de API em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Tela completa de atendimento em [`/comerciante/suporte`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/comerciante/suporte/page.tsx):
    - Lista lateral com badges de status e data de atualização.
    - Chat interativo com balões de mensagem estilizados para lojista vs atendimento oficial da franquia.
    - Modal de abertura de chamado com seleção de categoria e prioridade.
    - Botão de finalizar chamado e atalho adicionado no menu lateral do painel do comerciante.

### AV. Notificação de Novos Leads por WhatsApp via Bot/Z-API
- **Backend NestJS (`apps/api`)**:
  - Serviço [`WhatsAppBotService`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/notifications/whatsapp-bot.service.ts) criado no módulo global de notificações:
    - Integração com a API do WhatsApp (Z-API / webhook) com tratamento automático de DDI/DDD, autenticação via Client-Token e simulação transparente em ambiente de desenvolvimento quando as credenciais não estiverem provisionadas.
    - Método `notifyFranchiseeNewMerchantLead(cityId, listingTitle, category, contactPhone, contactEmail)`: localiza todos os franqueados ativos da comarca/cidade e envia mensagem instantânea e formatada com os dados do comerciante cadastrado para prospecção de planos VIP.
    - Método `sendFranchiseeTestAlert(phone, franchiseeName)`: dispara mensagem de teste para validação de conexão do franqueado.
  - Integração no cadastro de novos estabelecimentos em [`ListingsService.create`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/listings/listings.service.ts), disparando a notificação de forma assíncrona sem onerar o tempo de resposta do cadastro.
  - Endpoint `POST /api/v1/franchise/test-whatsapp-alert` em [`FranchiseController`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/api/src/modules/franchise/franchise.controller.ts).
- **Frontend Next.js (`apps/web`)**:
  - Cliente de teste `testFranchiseWhatsAppAlertApi` em [`apps/web/src/lib/api.ts`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/lib/api.ts).
  - Card/Banner de ativação do Bot de WhatsApp em [`/franqueado`](file:///d:/PROJETOS/os-melhores-da-cidade/apps/web/src/app/franqueado/page.tsx):
    - Exibição do status "Bot Ativo & Monitorando Leads em Tempo Real".
    - Botão interativo "Testar Alerta no Meu WhatsApp" com feedback instantâneo de envio e sucesso.

## 7. Diretrizes Persistidas de Memória
Conforme regra do usuário registrada em `GEMINI.md` no workspace e na configuração global:
- Todas as alterações, correções e implementações devem obrigatoriamente manter o `CONTEXTO.md` atualizado com o histórico, decisões e status da plataforma.

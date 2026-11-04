# PROMPT COMPLETO — OS MELHORES DA CIDADE
## Plataforma Multicidades + PWA + SEO Avançado + Painéis Administrativos

# 1. VISÃO GERAL

Desenvolva uma plataforma web completa chamada **OS MELHORES DA CIDADE**, utilizando os protótipos criados no Google Stitch e a identidade visual fornecida como referências obrigatórias.

A plataforma funcionará como um guia digital de cidades brasileiras, permitindo que moradores e turistas descubram:

- Restaurantes, pizzarias, hamburguerias e cafeterias.
- Bares, pubs, cervejarias e casas noturnas.
- Clubes, boates e entretenimento.
- Shows, festas, festivais e eventos.
- Hotéis, pousadas e hospedagens.
- Parques aquáticos e atrações turísticas.
- Comércios, lojas e centros comerciais.
- Prestadores de serviços.
- Clínicas, saúde e bem-estar.
- Academias e centros esportivos.
- Salões de beleza e barbearias.
- Espaços culturais e de lazer.

O sistema deverá suportar centenas ou milhares de municípios brasileiros utilizando uma única aplicação, com informações, estabelecimentos e eventos específicos para cada cidade.

O produto deverá ser funcional, responsivo, instalável como aplicativo PWA e preparado para crescimento.

**SEO é um requisito obrigatório desde a arquitetura inicial, e não uma funcionalidade a ser adicionada ao final do desenvolvimento.**

---

# 2. STACK TECNOLÓGICA OBRIGATÓRIA

## Frontend — React com Next.js

Utilizar obrigatoriamente:

- Next.js com App Router.
- React.
- TypeScript.
- Tailwind CSS.
- TanStack Query.
- Zustand.
- React Hook Form.
- Zod.
- Lucide React.
- Motion ou Framer Motion.
- next-intl para internacionalização.
- Recharts.
- Leaflet e OpenStreetMap.
- Implementação PWA compatível com Next.js.
- Componentes reutilizáveis.
- Server Components onde apropriado.
- Client Components somente quando necessários.

**Não utilizar Vite como framework principal do frontend.**

O Next.js será responsável pela renderização pública, roteamento, metadados, otimização de imagens e recursos de SEO.

## Backend

- Node.js LTS.
- NestJS.
- TypeScript.
- API REST.
- Prisma ORM.
- PostgreSQL.
- JWT com access e refresh tokens.
- Argon2.
- RBAC.
- Swagger/OpenAPI.
- Validação com DTOs.
- Upload de imagens.
- SMTP.
- Rate limiting.
- Helmet.
- CORS.

O NestJS será o backend principal de negócio.

Não duplicar regras de negócio entre Next.js e NestJS.

O Next.js poderá utilizar recursos server-side para consumir a API, renderizar páginas e gerenciar metadados, mantendo autenticação, persistência e regras comerciais centralizadas no NestJS.

## Infraestrutura

- Docker.
- Docker Compose.
- Nginx.
- PostgreSQL persistente.
- Volumes para imagens.
- Migrations.
- Seeds.
- Health checks.
- Variáveis de ambiente.

Todo o sistema deverá funcionar localmente em Docker.

**Não implementar Redis, RabbitMQ, Kafka, BullMQ, filas, workers, microsserviços ou módulos de logs e auditoria.**

---

# 3. ARQUITETURA DO PROJETO

Utilizar monorepo:

```text
os-melhores-da-cidade/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── layouts/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── i18n/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   ├── common/
│       │   ├── config/
│       │   └── main.ts
│       └── prisma/
├── packages/
│   └── shared/
├── docker/
├── docker-compose.yml
├── .env.example
├── CONTEXTO.md
├── DOCUMENTACAO.md
├── PASSOS.md
└── README.md
```

Separar corretamente responsabilidades, serviços, componentes e regras de negócio.

---

# 4. SEO — REQUISITO ARQUITETURAL PRIORITÁRIO

A plataforma deverá ser desenvolvida desde o início para obter indexação eficiente nos principais mecanismos de busca, especialmente Google e Bing.

O objetivo é permitir que páginas de cidades, categorias, estabelecimentos, eventos e artigos apareçam organicamente em pesquisas relevantes.

Exemplos de buscas que a arquitetura deve atender:

- Melhores restaurantes em Caldas Novas.
- Bares com música ao vivo em Goiânia.
- O que fazer em Caldas Novas.
- Eventos em Caldas Novas neste fim de semana.
- Melhores pizzarias em Uberlândia.
- Onde comer em Brasília.
- Hotéis em Caldas Novas.
- Pontos turísticos em Goiás.

A implementação técnica deverá favorecer a descoberta, rastreamento e indexação dessas páginas, sem prometer posicionamento específico no Google.

## 4.1 Renderização com Next.js

Utilizar a estratégia mais adequada para cada tipo de página:

**SSR — Server-Side Rendering**

Para páginas públicas que necessitam de conteúdo atualizado por requisição.

**SSG — Static Site Generation**

Para páginas estáveis, como informações institucionais e categorias globais.

**ISR — Incremental Static Regeneration**

Para páginas de cidades, estabelecimentos, categorias e artigos cujo conteúdo pode ser atualizado periodicamente.

**CSR — Client-Side Rendering**

Principalmente para interfaces autenticadas, dashboards, mapas interativos, filtros instantâneos e funcionalidades que não dependam de indexação.

Não utilizar CSR como única estratégia para páginas públicas importantes.

A renderização inicial deverá disponibilizar títulos, descrições e conteúdo principal no HTML retornado pelo servidor.

## 4.2 Metadados dinâmicos

Implementar Metadata API do Next.js.

Cada página pública deverá ter:

- Title.
- Meta description.
- Canonical.
- Open Graph.
- Twitter Cards.
- Robots.
- Metadados de idioma.
- Imagem de compartilhamento.

Exemplo de página:

`/caldas-novas`

Título sugerido:

Os Melhores de Caldas Novas | Restaurantes, Eventos e Lugares

Descrição:

Descubra restaurantes, bares, eventos, comércios, passeios e atrações em Caldas Novas, Goiás.

Exemplo de categoria:

`/caldas-novas/lugares/restaurantes`

Título:

Melhores Restaurantes em Caldas Novas | Os Melhores da Cidade

Exemplo de estabelecimento:

`/caldas-novas/lugar/restaurante-exemplo`

Título:

Restaurante Exemplo em Caldas Novas | Avaliações e Informações

Os metadados deverão ser produzidos a partir de informações reais cadastradas no sistema.

Não gerar descrições enganosas ou avaliações inexistentes.

## 4.3 URLs amigáveis

Exemplos:

```text
/
/caldas-novas
/caldas-novas/lugares
/caldas-novas/lugares/restaurantes
/caldas-novas/lugares/bares
/caldas-novas/lugar/nome-do-local
/caldas-novas/eventos
/caldas-novas/eventos/nome-do-evento
/caldas-novas/blog
/caldas-novas/blog/nome-do-artigo
```

Utilizar slugs normalizados.

Resolver municípios homônimos com identificação inequívoca, utilizando UF quando necessário.

Criar redirecionamentos permanentes adequados caso o slug seja alterado.

## 4.4 Sitemap XML dinâmico

Implementar sitemaps gerados automaticamente pelo Next.js a partir de dados do backend.

Incluir:

- Cidades publicadas.
- Categorias com conteúdo relevante.
- Estabelecimentos publicados.
- Eventos públicos elegíveis.
- Artigos publicados.
- Páginas institucionais.

Excluir:

- Painéis privados.
- Páginas de login.
- Cadastros.
- Rascunhos.
- Estabelecimentos suspensos.
- Conteúdo não publicado.
- Páginas sem conteúdo relevante.

Utilizar a data real de modificação quando disponível.

Se a quantidade de URLs aumentar, implementar divisão de sitemaps e índice de sitemaps.

## 4.5 Dados estruturados Schema.org

Implementar JSON-LD conforme o tipo de página.

Tipos aplicáveis:

- WebSite.
- Organization.
- BreadcrumbList.
- LocalBusiness.
- Restaurant.
- BarOrPub.
- Hotel.
- Event.
- Article.
- BlogPosting.

Para estabelecimentos, utilizar propriedades pertinentes:

- name.
- description.
- image.
- address.
- geo.
- telephone.
- openingHoursSpecification.
- url.

Para eventos:

- name.
- startDate.
- endDate.
- location.
- organizer.
- image.
- offers, quando houver informações reais de ingressos.

Não inventar notas, avaliações, disponibilidade ou preços em dados estruturados.

## 4.6 SEO por cidade

Cada município deverá possuir:

- Título SEO.
- Descrição SEO.
- Imagem de compartilhamento.
- Nome.
- Estado.
- Slug.
- Conteúdo introdutório.
- Categorias populares.
- Estabelecimentos publicados.
- Eventos ativos.
- Artigos relacionados.

O administrador poderá editar os campos de SEO de cada cidade.

A aplicação deverá gerar metadados padrão quando não houver personalização.

Cidades sem conteúdo relevante não devem produzir páginas vazias indexáveis.

## 4.7 Internacionalização e SEO

Idiomas:

- Português do Brasil.
- Inglês.
- Espanhol.

Utilizar next-intl.

Implementar rotas localizadas de maneira consistente, por exemplo:

```text
/caldas-novas
/en/caldas-novas
/es/caldas-novas
```

O português será o idioma padrão, sem prefixo.

Implementar hreflang e canonical corretamente.

Cada idioma deverá apontar para sua versão correspondente.

Conteúdo editorial que não tiver tradução efetiva deverá permanecer no idioma original, sem gerar páginas alternativas vazias ou falsamente traduzidas.

## 4.8 Performance e Core Web Vitals

O site deverá ser otimizado para dispositivos móveis.

Priorizar:

- Largest Contentful Paint.
- Interaction to Next Paint.
- Cumulative Layout Shift.
- Carregamento de imagens.
- Code splitting.
- Lazy loading.
- Fontes locais ou otimizadas.
- Cache apropriado.
- Compressão.
- Dimensionamento de imagens.
- Minimização de JavaScript no cliente.

Utilizar `next/image` quando aplicável.

Evitar animações pesadas e bibliotecas desnecessárias.

O objetivo será atingir bons resultados em testes reais com Lighthouse e PageSpeed Insights, principalmente no mobile.

## 4.9 SEO técnico adicional

Implementar:

- robots.txt.
- Canonical.
- Redirecionamentos 301/308 apropriados.
- Página 404 personalizada.
- Status HTTP corretos.
- Breadcrumbs.
- Links internos.
- Paginação navegável.
- Prevenção de páginas duplicadas.
- Tratamento de parâmetros de filtros.
- Página de busca interna não indexável quando apropriado.
- Meta noindex nos painéis privados.
- URLs consistentes com e sem barra final.

Permitir posteriormente conexão com Google Search Console e Bing Webmaster Tools.

---

# 5. ESTRUTURA MULTICIDADES

A página nacional será:

`osmelhoresdacidade.com.br`

Nela, o visitante escolherá:

- Estado.
- Cidade.

Após a seleção, será direcionado para o portal municipal.

Exemplo:

`osmelhoresdacidade.com.br/caldas-novas`

Outros municípios utilizarão o mesmo layout e componentes, mas conteúdos independentes.

### Regras

- Estados e municípios baseados em códigos IBGE.
- Cada cidade terá ID único e slug.
- Cidade preferida salva no navegador.
- Troca de cidade pelo cabeçalho.
- Busca limitada à cidade selecionada.
- Eventos vinculados a municípios.
- Estabelecimentos vinculados a municípios.
- Bairros vinculados a municípios.
- SEO independente por cidade.
- Administrador controla quais cidades estão habilitadas.

Todas as consultas deverão aplicar o escopo geográfico correto no backend.

---

# 6. IDENTIDADE VISUAL

Utilizar a logo fornecida de OS MELHORES DA CIDADE.

Seguir os protótipos Google Stitch.

Cores:

- Vermelho: `#FF3B4F`.
- Vermelho escuro: `#D91F35`.
- Preto: `#171717`.
- Branco: `#FFFFFF`.
- Cinza claro: `#F5F5F5`.

Implementar:

- Header.
- Footer.
- Hero.
- Cards.
- Carrosséis.
- Galerias.
- Breadcrumbs.
- Menus dropdown.
- Sidebar.
- Formulários.
- Modais.
- Tabelas.
- Dashboards.
- Elementos responsivos.

O menu público deverá ser:

**Início | Lugares (Todos, Categorias) | Blog | Contatos**

Adicionar seletor de cidade, idioma, acesso à conta e botão Anuncie seu negócio.

---

# 7. PWA — APLICATIVO INSTALÁVEL

Implementar o portal como Progressive Web App compatível com Next.js.

### Obrigatório

- Manifest.
- Service Worker.
- Ícones 192x192 e 512x512.
- Ícones maskable.
- Display standalone.
- Theme color.
- Cache de recursos estáticos.
- Página offline.
- Atualização controlada do aplicativo.
- Instruções de instalação.
- Design mobile com aparência de aplicativo.

No Android, oferecer instalação quando suportada.

No iOS, orientar a opção Adicionar à Tela de Início.

### Navegação mobile

Barra inferior com:

- Início.
- Explorar.
- Eventos.
- Favoritos.
- Perfil.

### Cache e SSR

O Service Worker não deverá comprometer o SEO, a renderização do Next.js ou a atualização de conteúdos.

Não armazenar respostas privadas em cache público.

Utilizar estratégias separadas para:

- Assets estáticos.
- Imagens.
- Páginas públicas.
- Requisições autenticadas.

Não apresentar dados desatualizados como se fossem informações em tempo real.

---

# 8. SISTEMA DE AUTENTICAÇÃO

Criar três perfis:

- USER.
- MERCHANT.
- ADMIN.

Implementar:

- Cadastro.
- Login.
- Logout.
- Confirmação obrigatória de e-mail.
- Recuperação de senha.
- Alteração de senha.
- Perfil.
- Controle de sessões.
- Permissões no backend.

Usar JWT, Argon2 e refresh tokens rotativos.

Utilizar cookies HttpOnly seguros quando apropriado.

Não permitir escalonamento de privilégios.

Um usuário poderá possuir permissões comerciais adicionais sem perder as funcionalidades comuns.

---

# 9. PAINEL DO USUÁRIO

Rota: `/app`

### Dashboard

- Resumo personalizado.
- Cidade atual.
- Lugares favoritos.
- Eventos salvos.
- Recomendações.
- Histórico das próprias avaliações.

### Meu perfil

- Nome.
- Foto.
- E-mail.
- Telefone opcional.
- Cidade preferida.
- Idioma.
- Senha.

### Favoritos

- Estabelecimentos favoritos.
- Eventos favoritos.
- Remover favoritos.
- Acessar detalhes.

### Minhas avaliações

- Listagem.
- Editar avaliação.
- Excluir avaliação.
- Consultar status.

### Eventos salvos

- Eventos de interesse.
- Data e horário.
- Localização.
- Link para detalhes.

### Configurações

- Idioma.
- Privacidade.
- Preferências.
- Gerenciamento de conta.

---

# 10. PAINEL DO COMERCIANTE

Rota: `/comerciante`

Criar layout administrativo com sidebar.

### Menu

1. Dashboard.
2. Meus estabelecimentos.
3. Eventos.
4. Galeria.
5. Cardápio e serviços.
6. Avaliações.
7. Estatísticas.
8. Perfil comercial.
9. Configurações.

## Dashboard

Exibir:

- Total de estabelecimentos.
- Visualizações.
- Cliques no WhatsApp.
- Cliques em Como chegar.
- Cliques no telefone.
- Avaliação média.
- Eventos publicados.
- Gráficos por período.

## Gerenciamento de estabelecimentos

Permitir criar, editar, arquivar e enviar estabelecimentos para aprovação.

Status:

- Rascunho.
- Pendente.
- Publicado.
- Rejeitado.
- Suspenso.

### Cadastro

**Informações básicas**

- Nome.
- Categoria.
- Subcategoria.
- Descrição curta.
- Descrição completa.
- Responsável.
- CNPJ opcional.

**Localização**

- Estado.
- Cidade.
- Bairro.
- CEP.
- Rua.
- Número.
- Complemento.
- Coordenadas.

**Contato**

- Telefone.
- WhatsApp.
- E-mail.
- Site.
- Redes sociais.

**Horários**

- Dias da semana.
- Abertura.
- Fechamento.
- Intervalos.
- Horários especiais.

**Imagens**

- Logo.
- Capa.
- Galeria.
- Ordenação.

**Características**

- Wi-Fi.
- Estacionamento.
- Acessibilidade.
- Delivery.
- Reservas.
- Pet friendly.
- Música ao vivo.
- Outras comodidades.

**SEO do estabelecimento**

Adicionar campos:

- Slug.
- Título SEO.
- Meta description.
- Imagem Open Graph.

Gerar valores automáticos quando não preenchidos.

Permitir que o comerciante personalize os campos autorizados, sujeitos à moderação.

## Cardápio e serviços

Criar categorias e itens com:

- Nome.
- Descrição.
- Imagem.
- Preço.
- Disponibilidade.
- Ordem.

## Eventos

Permitir cadastrar:

- Nome.
- Descrição.
- Imagem.
- Categoria.
- Data.
- Horário.
- Local.
- Gratuito ou pago.
- Preço informativo.
- Link externo de ingressos.
- Programação.

Submeter para aprovação.

## Avaliações

- Visualizar.
- Filtrar.
- Responder.
- Denunciar.

Não permitir exclusão direta de avaliações dos clientes.

## Estatísticas

Gráficos de acessos e interações por período.

---

# 11. PAINEL ADMINISTRADOR MASTER

Rota: `/admin`

### Menu

1. Dashboard.
2. Usuários.
3. Comerciantes.
4. Estabelecimentos.
5. Categorias.
6. Estados e cidades.
7. Eventos.
8. Avaliações.
9. Blog.
10. Banners.
11. Contatos.
12. Estatísticas.
13. SEO.
14. Configurações.

## Dashboard

Indicadores:

- Usuários.
- Comerciantes.
- Estabelecimentos.
- Eventos.
- Avaliações.
- Cidades habilitadas.
- Cadastros pendentes.
- Acessos ao portal.

## Usuários

- Listar.
- Buscar.
- Filtrar.
- Bloquear.
- Desbloquear.
- Gerenciar permissões.

## Comerciantes

- Aprovar cadastros.
- Associar estabelecimentos.
- Suspender.
- Reativar.
- Gerenciar responsáveis.

## Estabelecimentos

- Aprovar.
- Rejeitar.
- Solicitar correção.
- Editar.
- Suspender.
- Reativar.
- Destacar.
- Ordenar destaques.

Alterações importantes deverão passar por revisão quando necessário.

## Categorias

CRUD completo com:

- Nome.
- Slug.
- Descrição.
- Ícone.
- Imagem.
- Subcategorias.
- Ordem.
- Status.

## Cidades

Importar estados e municípios brasileiros a partir do IBGE.

Permitir:

- Habilitar municípios.
- Configurar slug.
- Cadastrar bairros.
- Definir capa.
- Editar textos.
- Selecionar destaques.
- Configurar metadados.
- Controlar publicação.

## Eventos

- Aprovar.
- Rejeitar.
- Editar.
- Cancelar.
- Destacar.

## Avaliações

- Moderar.
- Ocultar.
- Restaurar.
- Consultar denúncias.

## Blog

Implementar CMS com editor rico.

Campos:

- Título.
- Slug.
- Resumo.
- Conteúdo.
- Imagens.
- Autor.
- Categoria.
- Tags.
- Cidade.
- SEO.
- Status.

## Banners

Gerenciar banners nacionais, municipais e de categorias.

Permitir imagens desktop e mobile.

## Painel SEO

Criar uma área específica para gerenciar:

- SEO global.
- Títulos padrão.
- Descrições padrão.
- SEO por cidade.
- SEO por categoria.
- SEO por estabelecimento.
- SEO de eventos.
- SEO do blog.
- URLs canônicas.
- Imagens Open Graph.
- Status de indexação configurado.
- Pré-visualização de resultados de busca.
- Links para sitemap e robots.txt.

Permitir visualizar e corrigir campos SEO ausentes ou inválidos.

Não afirmar que uma página está indexada pelo Google sem consultar dados reais de ferramentas apropriadas.

## Configurações

- Logo.
- Favicon.
- Contato.
- Redes sociais.
- SMTP.
- Idioma padrão.
- Termos.
- Privacidade.
- PWA.
- Limites de upload.

---

# 12. PÁGINAS PÚBLICAS

Implementar fielmente os protótipos.

### Página nacional

Seleção de estado e cidade.

### Home municipal

- Hero.
- Busca.
- Categorias.
- Destaques.
- Eventos.
- Bairros.
- Mapa.
- Blog.
- Anúncios.

### Listagem de lugares

- Busca.
- Filtros.
- Cards.
- Paginação.
- Grade/lista.
- Mapa.

### Categorias

- Categorias.
- Subcategorias.
- Quantidade de estabelecimentos.

### Detalhes do estabelecimento

- Galeria.
- Descrição.
- Endereço.
- Horários.
- Contatos.
- Serviços.
- Cardápio.
- Mapa.
- Avaliações.
- Relacionados.

### Eventos

- Agenda.
- Filtros por data.
- Categorias.
- Detalhes.
- Localização.
- Programação.

### Blog

- Artigos.
- Busca.
- Categorias.
- Detalhes.
- Relacionados.

### Contatos

- Formulário.
- Endereço.
- Informações.
- Mapa.

### Anuncie

- Benefícios.
- Exemplos.
- Formulário de interesse.
- Chamada para cadastro.

---

# 13. BUSCA AVANÇADA

Utilizar PostgreSQL.

Implementar:

- Full-text search.
- Normalização de acentos.
- Busca por nome.
- Categoria.
- Subcategoria.
- Descrição.
- Bairro.
- Cidade.
- Palavra-chave.
- Ordenação por relevância.
- Ordenação por avaliação.
- Paginação.

Utilizar índices adequados.

Não exigir serviços externos pagos.

Sugestões instantâneas com debounce.

---

# 14. MAPAS

Utilizar Leaflet e OpenStreetMap.

Implementar:

- Marcadores.
- Clusters.
- Popups.
- Filtros.
- Centralização por cidade.
- Mapa no estabelecimento.
- Link para rotas.

A geolocalização deverá ser opcional.

Respeitar limitações de provedores públicos de mapas e permitir configuração futura de alternativas.

---

# 15. AVALIAÇÕES E FAVORITOS

Usuários autenticados poderão:

- Avaliar lugares.
- Dar notas de 1 a 5.
- Escrever comentários.
- Editar avaliações.
- Denunciar conteúdo.
- Favoritar estabelecimentos.
- Salvar eventos.

Restringir a uma avaliação ativa por usuário e estabelecimento.

Comerciantes poderão responder.

Administradores poderão moderar.

---

# 16. BANCO DE DADOS

Utilizar Prisma com PostgreSQL.

Entidades:

**Geografia**
- State.
- City.
- Neighborhood.

**Autenticação**
- User.
- UserRole.
- MerchantProfile.
- RefreshToken.
- EmailVerificationToken.
- PasswordResetToken.

**Estabelecimentos**
- Category.
- Subcategory.
- Listing.
- ListingOwner.
- ListingImage.
- ListingOpeningHour.
- ListingSpecialHour.
- Amenity.
- ListingAmenity.
- ListingSocialLink.
- ListingServiceCategory.
- ListingServiceItem.
- ListingRevision.

**Eventos**
- Event.
- EventImage.
- EventCategory.

**Interações**
- Favorite.
- EventFavorite.
- Review.
- ReviewReply.
- ReviewReport.

**Conteúdo**
- BlogPost.
- BlogCategory.
- BlogTag.
- Banner.
- ContactMessage.

**Configurações e métricas**
- AppSetting.
- CitySetting.
- ListingDailyMetric.
- EventDailyMetric.

Adicionar índices, constraints, chaves estrangeiras e campos de controle.

SEO poderá ser armazenado em campos próprios das entidades ou em estruturas específicas quando fizer sentido.

Criar migrations e seeds.

---

# 17. API REST

Implementar módulos NestJS:

- AuthModule.
- UsersModule.
- MerchantsModule.
- GeographyModule.
- ListingsModule.
- CategoriesModule.
- EventsModule.
- ReviewsModule.
- FavoritesModule.
- BlogModule.
- BannersModule.
- ContactsModule.
- AnalyticsModule.
- SeoModule.
- SettingsModule.
- UploadsModule.
- AdminModule.

Documentar endpoints com Swagger.

Implementar paginação, filtros, validação e controle de permissões.

Nenhuma consulta privada poderá confiar apenas no ID enviado pelo cliente para determinar autorização.

---

# 18. UPLOADS

Armazenar imagens inicialmente em volumes Docker.

Utilizar Sharp para otimização.

Implementar:

- JPEG.
- PNG.
- WebP.
- Miniaturas.
- Redimensionamento.
- Compressão.
- Validação.
- Nomes seguros.

Criar abstração para suporte futuro a storage S3 compatível.

Não exigir storage pago.

---

# 19. ESTATÍSTICAS

Implementar métricas no PostgreSQL:

- Visualizações de páginas comerciais.
- Cliques no WhatsApp.
- Cliques no telefone.
- Cliques no site.
- Cliques em Como chegar.
- Acessos a eventos.

Armazenar dados agregados por período.

Não criar filas, workers ou módulo de logs.

Reduzir duplicação de métricas e evitar coleta desnecessária de dados pessoais.

---

# 20. SEGURANÇA

Implementar:

- Argon2.
- JWT seguro.
- Refresh tokens rotativos.
- Controle RBAC.
- Confirmação de e-mail.
- Rate limiting.
- Validação de entrada.
- Sanitização.
- Proteção CSRF quando aplicável.
- Proteção XSS.
- Upload seguro.
- CORS restrito.
- Cookies seguros.
- Isolamento por comerciante.
- Proteção de rotas administrativas.

O controle de acesso deve ocorrer no backend.

---

# 21. DOCKER

Criar serviços:

```text
nextjs
nestjs
postgres
nginx
```

Executar com:

```bash
docker compose up -d --build
```

Configurar:

- Volumes persistentes.
- Hot reload no desenvolvimento.
- Health checks.
- Migrations.
- Seeds.
- Variáveis de ambiente.
- Proxy reverso.
- Configuração de produção.

O Next.js deverá executar em modo standalone quando apropriado para produção.

Não utilizar credenciais fixas de administrador.

Criar mecanismo seguro para provisionamento inicial.

---

# 22. TESTES

Implementar testes essenciais com Jest/Vitest e Playwright, conforme o módulo.

Cobrir:

- Login.
- Cadastro.
- Confirmação de e-mail.
- Autorização.
- Troca de cidade.
- Busca.
- Cadastro de estabelecimento.
- Aprovação.
- Eventos.
- Avaliações.
- Favoritos.
- Formulários.
- Internacionalização.

### Testes específicos de SEO

Validar:

- HTML renderizado no servidor.
- Metadados dinâmicos.
- Canonical.
- Sitemap.
- Robots.
- JSON-LD.
- Hreflang.
- Páginas 404.
- Redirecionamentos.
- Não indexação dos painéis.
- Metadados por cidade.

### Testes PWA

Validar:

- Manifest.
- Service Worker.
- Instalação em navegadores compatíveis.
- Página offline.
- Atualização.
- Navegação mobile.

---

# 23. DOCUMENTAÇÃO

Criar obrigatoriamente:

### CONTEXTO.md

- Visão geral.
- Arquitetura.
- Stack.
- Decisões técnicas.
- Banco.
- SEO.
- PWA.
- Funcionalidades.
- Pendências.

### DOCUMENTACAO.md

- Instalação.
- Docker.
- Arquitetura.
- API.
- Banco.
- Permissões.
- SEO.
- Renderização Next.js.
- PWA.
- Internacionalização.
- Deploy.
- Testes.

### PASSOS.md

Organizar as etapas de desenvolvimento, com status, critérios de aceitação e validação.

### README.md

Documentar instalação e funcionalidades principais.

Manter os documentos atualizados conforme o desenvolvimento.

---

# 24. ORDEM DE DESENVOLVIMENTO

**PASSO 1 — Arquitetura e SEO**

- Criar monorepo.
- Configurar Next.js App Router.
- Configurar NestJS.
- Configurar PostgreSQL.
- Configurar Docker.
- Planejar SSR, SSG e ISR.
- Criar arquitetura de metadados.
- Definir estratégia de URLs.
- Criar documentação.

**PASSO 2 — Design system**

- Identidade visual.
- Componentes.
- Layouts.
- Responsividade.

**PASSO 3 — Geografia**

- Estados.
- Cidades.
- Bairros.
- Seleção.
- Rotas dinâmicas.

**PASSO 4 — Autenticação**

- Usuários.
- Comerciantes.
- Admin.
- Permissões.
- Verificação de e-mail.

**PASSO 5 — Portal público**

- Página nacional.
- Home municipal.
- Categorias.
- Lugares.
- Busca.

**PASSO 6 — Estabelecimentos**

- CRUD.
- Imagens.
- Horários.
- Moderação.
- SEO individual.

**PASSO 7 — Painel comerciante**

- Dashboard.
- Estabelecimentos.
- Serviços.
- Galeria.
- Estatísticas.

**PASSO 8 — Eventos**

- CRUD.
- Agenda.
- Moderação.
- SEO de eventos.

**PASSO 9 — Avaliações e favoritos**

- Avaliações.
- Respostas.
- Favoritos.

**PASSO 10 — Painel usuário**

- Perfil.
- Favoritos.
- Avaliações.
- Eventos salvos.

**PASSO 11 — Administrador**

- Gestão global.
- Aprovações.
- Categorias.
- Cidades.
- Usuários.
- Comerciantes.

**PASSO 12 — CMS**

- Blog.
- Banners.
- Conteúdo por cidade.

**PASSO 13 — SEO avançado**

- Sitemap.
- JSON-LD.
- Hreflang.
- Otimização.
- Validação dos metadados já implementados.

Nesta etapa, complementar e validar o SEO iniciado no PASSO 1, não implementar SEO do zero.

**PASSO 14 — PWA**

- Manifest.
- Service Worker.
- Instalação.
- Offline.
- Atualizações.

**PASSO 15 — Mapas e métricas**

- Leaflet.
- OpenStreetMap.
- Estatísticas.

**PASSO 16 — Internacionalização**

- Português.
- Inglês.
- Espanhol.
- URLs localizadas.
- SEO multilíngue.

**PASSO 17 — Finalização**

- Testes.
- Segurança.
- Performance.
- Responsividade.
- Documentação.
- Ajustes finais.

---

# 25. REGRAS OBRIGATÓRIAS

1. Utilizar React com Next.js e App Router.
2. Não utilizar Vite como framework principal.
3. SEO deve fazer parte da arquitetura desde o primeiro passo.
4. Implementar renderização indexável para páginas públicas.
5. Utilizar SSR, SSG ou ISR conforme o caso.
6. Backend independente em NestJS.
7. PostgreSQL como banco principal.
8. Executar integralmente via Docker.
9. Implementar PWA instalável.
10. Seguir os protótipos Google Stitch.
11. Utilizar a identidade visual fornecida.
12. Implementar três perfis: usuário, comerciante e administrador.
13. Não implementar filas.
14. Não implementar módulo de logs.
15. Não exigir APIs pagas.
16. Não criar microsserviços.
17. Implementar autenticação segura.
18. Permitir múltiplas cidades.
19. Isolar dados por município e permissões comerciais.
20. Implementar SEO dinâmico por cidade e estabelecimento.
21. Criar sitemap XML automático.
22. Implementar dados estruturados.
23. Utilizar português brasileiro como idioma padrão.
24. Suportar inglês e espanhol.
25. Criar responsividade completa.
26. Implementar regras reais de negócio.
27. Não deixar botões sem funcionalidade.
28. Criar migrations e seeds.
29. Implementar testes essenciais.
30. Manter documentação atualizada.

---

# 26. RESULTADO ESPERADO

Entregar a plataforma **OS MELHORES DA CIDADE** com:

- Portal público multicidades.
- SEO avançado com Next.js.
- Páginas indexáveis por município.
- Busca de estabelecimentos.
- Diretório de categorias.
- Agenda de eventos.
- Mapa interativo.
- Blog.
- PWA instalável.
- Painel do usuário.
- Painel do comerciante.
- Painel administrador master.
- API NestJS.
- PostgreSQL.
- Docker.
- Suporte a português, inglês e espanhol.

O objetivo é criar uma plataforma que possa inicialmente operar em Caldas Novas, Goiás, e expandir para todo o Brasil, mantendo a mesma aplicação e permitindo crescimento orgânico por meio de páginas locais otimizadas para mecanismos de busca.

## INSTRUÇÃO FINAL PARA O AGENTE DE DESENVOLVIMENTO

Antes de iniciar a implementação, analise os protótipos e a logo disponibilizados.

Defina primeiro a arquitetura Next.js + NestJS + PostgreSQL, considerando SEO, multicidades, segurança, permissões e PWA.

Crie os arquivos `CONTEXTO.md`, `DOCUMENTACAO.md` e `PASSOS.md`.

Implemente o sistema seguindo a ordem definida, testando cada etapa antes de avançar.

**Não adie decisões arquiteturais de SEO. Desde o primeiro componente público e a primeira rota municipal, garantir que a estrutura seja compatível com renderização no servidor, metadados dinâmicos e indexação.**

O resultado deverá ser um sistema funcional, bem organizado, pronto para implantação e evolução comercial.
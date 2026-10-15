# Pure Seduction Lux

Sistema de e-commerce completo — loja virtual e painel administrativo — para a Pure Seduction Lux.
Backend em Node.js/Express (API REST), frontend em React (Vite), banco de dados relacional
(PostgreSQL em produção, SQLite em desenvolvimento).

## O que o sistema faz

**Loja:** catálogo de produtos por categoria, página de produto com cores/tamanhos/
estoque, carrinho, checkout com entrega ou retirada na loja, acompanhamento de pedido, login e
histórico de pedidos do cliente.

**Painel administrativo** (`/admin/login`, acesso restrito): cadastro e edição de produtos com
upload de fotos, gestão de categorias, acompanhamento e atualização de status dos pedidos,
configurações da loja (contato, endereço, taxa e área de entrega, textos de FAQ e política de
trocas).

**Regra de entrega por município:** o cliente só pode escolher entrega se o endereço informado
estiver no município configurado pela loja (hoje, Boa Viagem - CE) — validado no backend, não só
na tela, então não é burlável. Fora dessa área, só resta retirada. O município é configurável pelo
próprio admin, sem precisar mexer em código.

**Pagamento:** sempre presencial (PIX, dinheiro ou cartão, cobrado por quem entrega ou na
retirada) — nenhum dado de cartão passa pelo servidor. A integração com Mercado Pago (pagamento
online) existe no código mas está desativada; pode ser reativada depois sem reescrever nada, só
habilitando os métodos em `ONLINE_PAYMENT_METHODS` e configurando as credenciais.

## Arquitetura

backend/ API REST (Express) — models (Sequelize), controllers, rotas, autenticação
frontend/ Loja + painel admin (React/Vite), consome a API via REST

## Segurança

- Senhas (clientes e admin) com hash Argon2id.
- JWT com segredos independentes para sessão de cliente e de admin.
- Rate limiting nas rotas de login.
- Helmet (cabeçalhos HTTP de segurança) e CORS restrito ao domínio do frontend.
- Upload de imagem validado por conteúdo real do arquivo, não só pela extensão/tipo declarado.
- Preço e estoque sempre calculados no servidor a partir do banco.
- Página de Política de Privacidade incluída alinhado à LGPD.

## Stack

Node.js · Express · Sequelize · PostgreSQL/SQLite · JWT · Argon2id · Multer · Helmet ·
React 18 · Vite · React Router · Axios · Mercado Pago SDK (integração pronta, desativada)

## Observabilidade com Sentry

1. Crie projetos `Node.js/Express` e `React` em [sentry.io](https://sentry.io/) e copie a DSN de cada projeto.
2. Configure `SENTRY_DSN` no ambiente do backend e `VITE_SENTRY_DSN` no ambiente do frontend. Os arquivos `backend/.env.example` e `frontend/.env.example` mostram as variáveis esperadas. Não publique arquivos `.env` nem DSNs privadas de ingestão.
3. Inicie a aplicação localmente e chame `GET http://localhost:4000/api/debug-sentry`. Em desenvolvimento, o endpoint fica ativo por padrão; em produção ele fica desativado, a menos que `SENTRY_DEBUG_ENDPOINT_ENABLED=true` seja definido explicitamente. A resposta de erro esperada é HTTP 500.
4. Confira a issue e o stack trace nos projetos Sentry. O backend envia exceções HTTP 500; o React captura erros de renderização com `Sentry.ErrorBoundary`.

Sem DSN, a aplicação funciona normalmente, mas os eventos não são enviados ao Sentry.

## ChatOps: GitHub e Discord

1. No Discord, abra as configurações do canal de texto, acesse **Integrações > Webhooks**, crie um webhook e copie sua URL.
2. No GitHub, acesse **Settings > Webhooks > Add webhook**. Use a URL do Discord acrescida de `/github`, selecione `application/json` e habilite pelo menos **Pushes** e **Pull requests**.
3. Salve o webhook, faça push de um commit e confira a entrega em **Recent Deliveries** no GitHub e a mensagem no canal Discord.

O webhook é configurado nas páginas do repositório e do Discord, não no código-fonte. Não inclua a URL secreta do webhook neste repositório.

## Evidências da atividade

Anexe ao README as quatro capturas reais abaixo, em `docs/evidencias/`. As capturas precisam ser obtidas durante a execução da dupla; ainda não foram incluídas porque dependem dos projetos e das contas reais do Sentry, GitHub e Discord.

1. **Código-fonte:** `docs/evidencias/01-codigo-sentry.png`, mostrando `Sentry.init` e o endpoint `/api/debug-sentry`.
2. **Sentry Issues:** `docs/evidencias/02-sentry-issues.png`, mostrando a issue de teste e seu stack trace.
3. **GitHub Webhook:** `docs/evidencias/03-github-webhook.png`, mostrando a URL cadastrada com `/github` e os eventos selecionados. Oculte tokens ou partes sensíveis.
4. **Discord:** `docs/evidencias/04-discord-push.png`, mostrando a notificação automática correspondente ao push.
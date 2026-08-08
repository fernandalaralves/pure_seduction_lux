# Pure Seduction Lux

Sistema de e-commerce completo — loja virtual e painel administrativo — para a Pure Seduction Lux.
Backend em Node.js/Express (API REST), frontend em React (Vite), banco de dados relacional
(PostgreSQL em produção, SQLite em desenvolvimento).

## O que o sistema faz

**Loja (pública):** catálogo de produtos por categoria, página de produto com cores/tamanhos/
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
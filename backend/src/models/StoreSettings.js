const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Singleton-style settings row (there should only ever be one record).
class StoreSettings extends Model {}

StoreSettings.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    store_name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pure Seduction Lux' },
    store_phone: { type: DataTypes.STRING, allowNull: true },
    store_whatsapp: { type: DataTypes.STRING, allowNull: true },
    store_address: { type: DataTypes.STRING, allowNull: true },
    // Delivery is only allowed when the customer's address city/state matches these.
    municipality_city: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Boa Viagem' },
    municipality_state: { type: DataTypes.STRING(2), allowNull: false, defaultValue: 'CE' },
    delivery_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 3.0 },

    // The store's PIX key (CPF/CNPJ/e-mail/telefone/chave aleatória), used to
    // build the "Pix Copia e Cola" payload shown at checkout. Editable by the
    // admin in Configurações - no image upload needed, the QR code is
    // generated on the fly from this key + the order total.
    pix_key: { type: DataTypes.STRING, allowNull: true },

    // Free-text content for the storefront's "Trocas e devoluções" and
    // "Perguntas frequentes" pages, editable by the admin in Configurações.
    // Simple mini-syntax: blank line = new paragraph, "## " = heading,
    // "- " = bullet list item (see frontend ContentBlocks component).
    returns_policy_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: `Sabemos que às vezes o tamanho ou o modelo não é exatamente o que você esperava, e queremos que sua experiência de compra seja tranquila do início ao fim.

## Prazo para troca ou devolução

Você tem até 7 dias corridos após o recebimento do produto para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor (direito de arrependimento em compras feitas fora do estabelecimento comercial).

## Condições para aceitar a troca

- A peça não pode ter sido usada, lavada ou alterada.
- As etiquetas originais precisam estar afixadas ao produto.
- Por motivos de higiene, calcinhas e peças íntimas sem a etiqueta de proteção original não são aceitas para troca, exceto em caso de defeito de fabricação.
- A embalagem original deve ser preservada sempre que possível.

## Como solicitar

Entre em contato pelo WhatsApp informado no rodapé do site, com o número do seu pedido e o motivo da troca ou devolução. Vamos combinar a melhor forma de receber a peça de volta.

## Produto com defeito

Se a peça chegou com algum defeito de fabricação, entre em contato em até 30 dias após o recebimento. Nesse caso, a troca é gratuita e sem custo de envio para você.

## Reembolso

Após recebermos e conferirmos a peça devolvida, o reembolso é feito pelo mesmo meio de pagamento utilizado na compra, em até 7 dias úteis.`,
    },
    faq_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: `## Como faço para saber o meu tamanho certo?

Cada peça tem uma tabela de medidas na página do produto. Se tiver dúvidas, chame no WhatsApp que ajudamos a escolher o tamanho ideal.

## Quais formas de pagamento vocês aceitam?

Aceitamos PIX, dinheiro e cartão de crédito/débito. O pagamento é sempre feito na hora da entrega ou da retirada na loja.

## Para onde vocês entregam?

No momento entregamos apenas na região configurada pela loja. Fora dessa área, você pode escolher retirar o pedido na loja.

## Quanto tempo leva a entrega?

Combinamos o prazo de entrega diretamente com você pelo WhatsApp, assim que o pedido é confirmado.

## Posso trocar ou devolver uma peça?

Sim! Confira todos os detalhes na nossa página de Trocas e devoluções.

## A embalagem é discreta?

Sim, todos os pedidos são entregues em embalagem discreta, sem identificação do conteúdo.

## Como acompanho meu pedido?

Depois de finalizar a compra, você recebe o link do seu pedido, que pode ser salvo nos favoritos para acompanhar o status a qualquer momento.`,
    },
  },
  {
    sequelize,
    modelName: 'StoreSettings',
    tableName: 'store_settings',
  }
);

module.exports = StoreSettings;

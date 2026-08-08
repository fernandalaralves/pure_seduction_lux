import '../styles/contentPage.css';

export default function PrivacyPolicy() {
  return (
    <div className="container section-block privacy-page">
      <h1 className="page-title">Política de Privacidade</h1>
      <p className="helper-text" style={{ marginBottom: 28 }}>
        Última atualização: agosto de 2026
      </p>

      <div className="panel content-page">
        <p>
          Esta Política de Privacidade explica como a <strong>Pure Seduction Lux</strong> coleta,
          usa, armazena e protege os dados pessoais de quem visita ou compra em nosso site, em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Quais dados coletamos</h2>
        <p>Coletamos apenas os dados necessários para processar seu pedido e melhorar sua experiência:</p>
        <ul>
          <li><strong>Dados de identificação e contato:</strong> nome completo e número de WhatsApp, informados no checkout ou no cadastro de conta.</li>
          <li><strong>Dados de entrega:</strong> endereço (rua, número, bairro, cidade, estado e complemento), quando você escolhe a opção de entrega.</li>
          <li><strong>Dados de conta:</strong> e-mail e senha (armazenada de forma criptografada, nunca em texto legível), caso você opte por criar uma conta.</li>
          <li><strong>Dados do pedido:</strong> itens comprados, valores, forma de pagamento escolhida e status do pedido.</li>
          <li><strong>Dados de navegação:</strong> itens adicionados à sacola de compras, guardados apenas no seu próprio navegador (armazenamento local), não em nossos servidores, até a finalização da compra.</li>
        </ul>
        <p>
          <strong>Não coletamos nem armazenamos dados de cartão de crédito/débito.</strong> O
          pagamento é feito presencialmente, na maquininha de cartão levada por quem entrega seu
          pedido (ou na retirada na loja) — seus dados financeiros nunca passam pelos nossos
          servidores nem são digitados no site.
        </p>

        <h2>2. Para que usamos seus dados</h2>
        <ul>
          <li>Processar e entregar seus pedidos;</li>
          <li>Confirmar se seu endereço está dentro da nossa área de entrega;</li>
          <li>Entrar em contato sobre o andamento do seu pedido;</li>
          <li>Permitir que você acompanhe seu histórico de compras, se tiver uma conta;</li>
          <li>Cumprir obrigações legais e fiscais.</li>
        </ul>

        <h2>3. Base legal para o tratamento dos dados</h2>
        <p>
          Tratamos seus dados com base na <strong>execução de contrato</strong> (para processar seu
          pedido), no <strong>consentimento</strong> (quando você cria uma conta ou opta por receber
          contato via WhatsApp) e no cumprimento de <strong>obrigações legais</strong> (como emissão de
          documentos fiscais), conforme os artigos 7º e 11 da LGPD.
        </p>

        <h2>4. Com quem compartilhamos seus dados</h2>
        <p>
          Compartilhamos dados apenas com prestadores de serviço estritamente necessários para operar
          a loja:
        </p>
        <ul>
          <li><strong>Serviços de entrega:</strong> nome, endereço e telefone, apenas para pedidos com entrega.</li>
        </ul>
        <p>Não vendemos nem alugamos seus dados pessoais a terceiros para fins de marketing.</p>

        <h2>5. Por quanto tempo guardamos seus dados</h2>
        <p>
          Mantemos os dados da sua conta enquanto ela estiver ativa, e os dados de pedidos pelo prazo
          exigido pela legislação fiscal e de defesa do consumidor (geralmente 5 anos). Você pode
          solicitar a exclusão da sua conta a qualquer momento, conforme o item 6 abaixo.
        </p>

        <h2>6. Seus direitos como titular dos dados</h2>
        <p>De acordo com a LGPD, você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados;</li>
          <li>Acessar, corrigir ou atualizar seus dados;</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Solicitar a portabilidade dos seus dados;</li>
          <li>Revogar seu consentimento a qualquer momento;</li>
          <li>Solicitar informações sobre com quem compartilhamos seus dados.</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, entre em contato pelo WhatsApp ou e-mail
          informados no rodapé do site.
        </p>

        <h2>7. Segurança dos dados</h2>
        <p>
          Adotamos medidas técnicas para proteger seus dados, incluindo senhas armazenadas com
          criptografia forte (Argon2id), conexão seguindo os padrões de mercado e acesso ao painel
          administrativo restrito a pessoas autorizadas da loja.
        </p>

        <h2>8. Cookies e armazenamento local</h2>
        <p>
          Usamos o armazenamento local do seu navegador para manter sua sacola de compras e sua sessão
          de login enquanto você navega pelo site. Isso não é compartilhado com terceiros e é apagado
          se você limpar os dados do navegador.
        </p>

        <h2>9. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Recomendamos revisá-la de tempos em tempos.
          A data da última atualização está sempre indicada no topo desta página.
        </p>

        <h2>10. Contato</h2>
        <p>
          Dúvidas sobre esta política ou sobre como tratamos seus dados podem ser enviadas pelo
          WhatsApp ou e-mail de contato da loja, disponíveis no rodapé do site.
        </p>
      </div>
    </div>
  );
}

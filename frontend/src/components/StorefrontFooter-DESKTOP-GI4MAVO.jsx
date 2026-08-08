import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { api } from '../api/client';
import './StorefrontFooter.css';

export default function StorefrontFooter() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setSettings(res.data.settings))
      .catch(() => {});
  }, []);

  const whatsappLink = settings?.store_whatsapp
    ? `https://wa.me/${settings.store_whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <footer className="storefront-footer">
      <div className="container storefront-footer-inner">
        <div className="storefront-footer-brand">
          <Logo size={48} />
          <div>
            <div className="storefront-footer-title">PURE SEDUCTION LUX</div>
            <div className="storefront-footer-tagline">Sinta-se bem todos os dias</div>
          </div>
        </div>

        <div>
          <div className="storefront-footer-heading">INSTITUCIONAL</div>
          <ul>
            <li><Link to="/sobre">Sobre nós</Link></li>
            <li><Link to="/politica-de-privacidade">Política e privacidade</Link></li>
            <li><Link to="/trocas-e-devolucoes">Trocas e devoluções</Link></li>
            <li><Link to="/perguntas-frequentes">Perguntas frequentes</Link></li>
          </ul>
        </div>

        <div>
          <div className="storefront-footer-heading">CONTATO</div>
          <ul>
            {whatsappLink && (
              <li>
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  💬 WhatsApp: {settings.store_whatsapp}
                </a>
              </li>
            )}
            {settings?.store_phone && <li>📞 {settings.store_phone}</li>}
            {settings?.store_address && <li>📍 {settings.store_address}</li>}
            {!whatsappLink && !settings?.store_phone && (
              <li className="helper-text">Cadastre o contato em Configurações no painel admin.</li>
            )}
          </ul>
        </div>

        <div>
          <div className="storefront-footer-heading">SIGA-NOS</div>
          <a
            href="https://www.instagram.com/_pureseductionlux/"
            target="_blank"
            rel="noreferrer"
            className="storefront-footer-social"
          >
             @_pureseductionlux
          </a>
        </div>
      </div>
    </footer>
  );
}

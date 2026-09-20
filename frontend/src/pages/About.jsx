import './About.css';
import fotoFundadora from '../assets/fundadora.jpeg';

export default function About() {
  return (
    <div className="container section-block">
      <h1 className="page-title">Sobre nós</h1>
      <div className="about-grid">
        <p className="helper-text about-text">
          A Pure Seduction Lux nasceu para valorizar a autoestima e a essência de cada mulher.
          Selecionamos peças de lingerie com renda de alta qualidade, caimento perfeito e muito
          cuidado nos detalhes — para que você se sinta bem todos os dias.
        </p>
        <div className="about-photo-frame">
           <img src={fotoFundadora} alt="Fundadora da Pure Seduction Lux" />
        </div>
      </div>
    </div>
  );
}

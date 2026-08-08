import logoImage from '../assets/logo.jpg';
import './Logo.css';

export default function Logo({ size = 56 }) {
  return (
    <div className="psl-logo" style={{ width: size, height: size }}>
      <img src={logoImage} alt="Pure Seduction Lux" />
    </div>
  );
}

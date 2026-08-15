
import { Link } from "react-router-dom";
import nexoraMen from "../../assets/img/nexora-men.jpg";

export default function Men() {
  return (
    <Link to="/Men" className="gender-card">
      <img className="gender-image" src={nexoraMen} alt="Nexora Men" />
      <div className="gender-overlay"></div>
      <div className="gender-content">
        <h2>MEN</h2>
        <p>Classic & Modern Clothing</p>
        <span className="gender-btn">Xarid qilish</span>
      </div>
    </Link>
  );
}
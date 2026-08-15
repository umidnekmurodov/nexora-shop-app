import { Link } from "react-router-dom";
import nexoraWomen from "../../assets/img/nexora-women.jpg";

export default function Women() {
  return (
    <Link to="/Women" className="gender-card">
      <img className="gender-image" src={nexoraWomen} alt="Nexora Women" />
      <div className="gender-overlay"></div>
      <div className="gender-content">
        <h2>WOMEN</h2>
        <p>Elegance & Style Collection</p>
        <span className="gender-btn">Xarid qilish</span>
      </div>
    </Link>
  );
}
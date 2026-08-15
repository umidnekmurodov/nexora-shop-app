import "./Hero.css";
import nexoraface from "../../assets/img/nexoraface.jpg";

export default function Hero() {
  return (
    <section className="hero">
      <img className="hero-image" src={nexoraface} alt="Hero banner" />

      <div className="hero-content">
        <h1>Timeless Style</h1>

        <p>Discover the latest collection for men & women.</p>

  
      </div>
    </section>
  );
}
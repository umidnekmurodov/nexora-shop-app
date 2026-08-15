import { Link } from "react-router-dom";
import "./Footer.css";
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top */}
      <div className="footer-top">
        <div className="footer-brand">
          <h2 className="footer-logo">NEXORA</h2>
          <p className="footer-tagline">
            Timeless fashion for men and women.
          </p>

          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="#" className="footer-social-link" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="#" className="footer-social-link" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-column">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/men">Men</Link></li>
            <li><Link to="/women">Women</Link></li>
            <li><Link to="/new">New Arrivals</Link></li>
            <li><Link to="/sale">Sale</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer-column">
          <h3>Help</h3>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-column">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <h3>Subscribe to our newsletter</h3>
        <p>Get the latest drops and exclusive offers straight to your inbox.</p>
        <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="footer-newsletter-input"
          />
          <button type="submit" className="footer-newsletter-btn">
            Subscribe
          </button>
        </form>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 NEXORA. All rights reserved.</p>
        <p className="footer-bottom-sub">Made with passion for fashion.</p>
      </div>
    </footer>
  );
};

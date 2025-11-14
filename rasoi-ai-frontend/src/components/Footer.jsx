import "../styles/footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-main">

      {/* TOP SECTION */}
      <div className="footer-content">

        {/* Column 1 - Brand */}
        <div className="footer-col">
          <h2 className="footer-logo">🍱 RasoiAI</h2>
          <p className="footer-about">
            Smart AI-powered food redistribution platform ensuring that 
            every extra meal reaches someone who really needs it.
          </p>

          {/* Social Icons */}
          <div className="footer-social">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>

        {/* Column 2 - Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/add-food">Add Food</Link>
          <Link to="/profile">Profile</Link>
        </div>

        {/* Column 3 - Contact */}
        <div className="footer-col">
          <h3>Contact</h3>
          <p>📍 Delhi, India</p>
          <p>📧 support@rasoiai.com</p>
          <p>📞 +91 98765 43210</p>
        </div>

      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} RasoiAI · Built with ❤️ to stop food waste.
      </div>

    </footer>
  );
}

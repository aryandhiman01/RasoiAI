import "../styles/landing.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Landing() {

  useEffect(() => {
    const elems = document.querySelectorAll(".fade-up");
    const showElems = () => {
      elems.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
          el.classList.add("show");
        }
      });
    };
    window.addEventListener("scroll", showElems);
    showElems();
  }, []);

  return (
    <div className="landing-container">

      {/* HERO SECTION */}
      <section className="hero fade-up">
        
        <div className="hero-left">
          <h1>
            Reduce Waste.<br />
            <span>Serve Humanity.</span>
          </h1>

          <p className="subtitle">
            AI-powered freshness detection · Real-time NGO matching · Live food tracking
          </p>

          <div className="hero-btns">
            <Link to="/register"><button className="btn primary">Get Started</button></Link>
            <Link to="/login"><button className="btn outline">Login</button></Link>
          </div>
        </div>

      </section>

      {/* PREMIUM WHITE STATS SECTION */}
      <section className="stats-white fade-up">
        <div className="stat-box">
          <h2>12K+</h2>
          <p>Meals Donated</p>
        </div>
        <div className="stat-box">
          <h2>800+</h2>
          <p>NGOs Connected</p>
        </div>
        <div className="stat-box">
          <h2>98%</h2>
          <p>Accuracy in Distribution</p>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="why fade-up" id="why">
        <h2>Why <span>RasoiAI?</span></h2>

        <div className="why-grid">
          <div className="why-box">
            🤖 <h3>AI Freshness Detection</h3>
            <p>Ensures food is safe for consumption.</p>
          </div>

          <div className="why-box">
            📍 <h3>Live Location Match</h3>
            <p>Connects donors & NGOs instantly.</p>
          </div>

          <div className="why-box">
            ⚡ <h3>Instant Alerts</h3>
            <p>Real-time claim & donation notifications.</p>
          </div>

          <div className="why-box">
            🌱 <h3>Zero Waste</h3>
            <p>Every meal saved helps someone.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials fade-up" id="testimonials">
        <h2>What People Say</h2>

        <div className="slider">
          <div className="slide">
            <p>“RasoiAI helped us distribute 200+ meals daily with zero waste.”</p>
            <h4>— Helping Hands NGO</h4>
          </div>

          <div className="slide">
            <p>“Freshness detection is a game changer!”</p>
            <h4>— Food Donor</h4>
          </div>

          <div className="slide">
            <p>“Fast & smart way to help hungry people.”</p>
            <h4>— Volunteer</h4>
          </div>
        </div>
      </section>

    </div>
  );
}

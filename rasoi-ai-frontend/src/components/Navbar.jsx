import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";
import { useEffect, useState } from "react";
import API from "../api";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [menu, setMenu] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [profileImg, setProfileImg] = useState(null);
  const [foodCount, setFoodCount] = useState(0);
  const [userInitial, setUserInitial] = useState("U");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (p) => (location.pathname === p ? "active" : "");

  // Fetch profile + food count
  useEffect(() => {
    if (token) {
      API.get("profile/")
        .then((res) => {
          setProfileImg(res.data.profile_image || null);
          setUserInitial(res.data.user.username[0].toUpperCase());
        })
        .catch(() => {});

      API.get("food/list/")
        .then((res) => setFoodCount(res.data.available_foods.length))
        .catch(() => {});
    }
  }, []);

  // Fake notification count for now
  useEffect(() => {
    if (token) {
      setNotifications(Math.floor(Math.random() * 3)); // 0-2 notifications
    }
  }, []);

  return (
    <nav className="nav-super">
      {/* Logo */}
      <h2 className="nav-logo"><span className="glow">🍱 RasoiAI</span></h2>

      {/* Mobile icon */}
      <div className="hamburger" onClick={() => setMenu(!menu)}>
        {menu ? "✖" : "☰"}
      </div>

      {/* Main Links */}
      <div className={`nav-links ${menu ? "show" : ""}`}>
        <Link className={isActive("/")} to="/">Home</Link>

        {!token && (
          <>
            <Link className={isActive("/login")} to="/login">Login</Link>
            <Link className={isActive("/register")} to="/register">Register</Link>
          </>
        )}

        {token && (
          <>
            <Link className={isActive("/dashboard")} to="/dashboard">
              Dashboard
              {foodCount > 0 && (
                <span className="food-count">{foodCount}</span>
              )}
            </Link>

            <Link className={isActive("/add-food")} to="/add-food">Add Food</Link>
            <Link className={isActive("/nearby")} to="/nearby">Nearby</Link>

            {/* Notification bell */}
            <div className="notif-box">
              🔔
              {notifications > 0 && <span className="notif-count">{notifications}</span>}
            </div>

            {/* Avatar */}
            <div className="avatar-wrapper" onClick={() => setDropdown(!dropdown)}>
              <div className="avatar-ring"></div>

              {profileImg ? (
                <img className="avatar-img" src={profileImg} alt="profile" />
              ) : (
                <div className="avatar-fallback">{userInitial}</div>
              )}
            </div>

            {/* Dropdown menu */}
            <div className={`dropdown ${dropdown ? "show" : ""}`}>
              <Link to="/profile">Profile</Link>
              <Link to="/notifications">Notifications</Link>

              <hr />

              <button onClick={logout}>Logout</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

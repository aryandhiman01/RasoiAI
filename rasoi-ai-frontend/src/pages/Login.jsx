// src/pages/Login.jsx
import { useState } from "react";
import "../styles/form.css";
import API from "../api";

export default function Login() {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await API.post("login/", {
        username: data.username,
        password: data.password,
      });

      // Token Save
      localStorage.setItem("token", res.data.token);

      setMsg("✔ Login successful! Redirecting...");
      setLoading(false);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);

    } catch (error) {
      setLoading(false);

      if (error.response?.status === 401) {
        setMsg("❌ Incorrect username or password");
      } else {
        setMsg("⚠ Server error, try later");
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="glass-card">

        <h2 className="title">Welcome Back 👋</h2>
        <p className="subtitle">Login to continue</p>

        <form onSubmit={submit} className="form-area">

          {/* Username */}
          <div className="field">
            <label className={data.username ? "float-label active" : "float-label"}>
              Username
            </label>
            <input
              type="text"
              className="input-box"
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="field">
            <label className={data.password ? "float-label active" : "float-label"}>
              Password
            </label>
            <input
              type="password"
              className="input-box"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn modern-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Message */}
        {msg && <p className="alert-msg">{msg}</p>}

        <p className="small-text">
          Don't have an account?{" "}
          <a className="link" href="/register">Register Now</a>
        </p>

      </div>
    </div>
  );
}

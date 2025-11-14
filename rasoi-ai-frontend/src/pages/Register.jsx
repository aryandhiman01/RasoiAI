// src/pages/Register.jsx
import { useState } from "react";
import "../styles/form.css";
import API from "../api";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "Donor",
    location: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await API.post("register/", data);
      console.log(res.data);

      setMsg({ type: "success", text: "Account created successfully! 🎉" });
      setLoading(false);

      // Save token
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

    } catch (error) {
      console.log(error.response?.data);
      setMsg({ type: "error", text: error.response?.data?.error || "Error creating account ❌" });
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">

      <div className="glass-card">
        <h2 className="title">Create Your Account</h2>
        <p className="subtitle">Join RasoiAI and start making an impact.</p>

        <form onSubmit={submit} className="form-area">

          <div className="field">
            <label>Username</label>
            <input 
              type="text"
              value={data.username}
              onChange={(e)=>setData({...data, username:e.target.value})}
              placeholder="Enter username"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input 
              type="email"
              value={data.email}
              onChange={(e)=>setData({...data, email:e.target.value})}
              placeholder="name@email.com"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input 
              type="password"
              value={data.password}
              onChange={(e)=>setData({...data, password:e.target.value})}
              placeholder="Enter password"
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input 
              type="text"
              value={data.phone}
              onChange={(e)=>setData({...data, phone:e.target.value})}
              placeholder="Mobile number"
            />
          </div>

          <div className="field">
            <label>Role</label>
            <select 
              value={data.role}
              onChange={(e)=>setData({...data, role:e.target.value})}
            >
              <option value="Donor">Donor</option>
              <option value="NGO">NGO</option>
            </select>
          </div>

          <div className="field">
            <label>Location</label>
            <input 
              type="text"
              value={data.location}
              onChange={(e)=>setData({...data, location:e.target.value})}
              placeholder="City / Address"
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        {msg && (
          <p className={`msg ${msg.type}`}>{msg.text}</p>
        )}

      </div>
    </div>
  );
}

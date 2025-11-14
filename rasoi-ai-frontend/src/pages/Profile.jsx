import { useEffect, useState } from "react";
import API from "../api";
import "../styles/profile.css";

export default function Profile() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", location: "" });

  const getGPS = () =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () =>
          resolve({
            latitude: 28.6139,
            longitude: 77.2090,
          }),
        { enableHighAccuracy: true }
      );
    });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("profile/");
        setData(res.data);

        setEditForm({
          phone: res.data.phone,
          location: res.data.location,
        });

        const act = await API.get("activity/");
        setActivity(act.data || []);

        const gps = await getGPS();
        await API.post("update_location/", {
          phone: res.data.phone,
          location: res.data.location,
          latitude: gps.latitude,
          longitude: gps.longitude,
        });
      } catch (err) {
        console.log("Profile Load Error", err);
      }
    };

    load();
    const interval = setInterval(load, 25000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <h2 className="loading">Loading Profile...</h2>;

  const initial = data.user.username[0].toUpperCase();
  const level = Math.floor((data.donations + data.claims) / 2);
  const impact = Math.min(100, data.donations * 10 + data.claims * 5);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const gps = await getGPS();
      await API.post("update_location/", {
        phone: editForm.phone,
        location: editForm.location,
        latitude: gps.latitude,
        longitude: gps.longitude,
      });

      alert("Profile Updated!");
      setShowEdit(false);
      window.location.reload();
    } catch {
      alert("Failed to update.");
    }
  };

  return (
    <div className="profile-container">

      <div className="banner">
        <h2>Welcome, {data.user.username} 👋</h2>
        <p>You are doing incredible work for society ❤️</p>
      </div>

      <div className="layout">
        <div className="left-card">

          <div className="avatar">{initial}</div>
          <h2 className="username">{data.user.username}</h2>
          <p className="email">{data.user.email}</p>

          <div className="role-box">{data.role}</div>

          <div className="stats">
            <div className="stat-box"><h3>{data.donations}</h3><p>Donations</p></div>
            <div className="stat-box"><h3>{data.claims}</h3><p>Claims</p></div>
            <div className="stat-box"><h3>{impact}%</h3><p>Impact</p></div>
          </div>

          <p className="info"><b>Phone:</b> {data.phone}</p>
          <p className="info"><b>Location:</b> {data.location}</p>

          <div className="online-status"><span className="dot"></span> Online</div>

          <div className="qr-card">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=User:${data.user.username}|Email:${data.user.email}|Role:${data.role}`}
              alt="QR"
            />
            <p>Your RasoiAI ID</p>
          </div>

          <button className="edit-btn" onClick={() => setShowEdit(true)}>Edit Profile</button>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}>Logout</button>

        </div>

        <div className="right-card">

          <h3 className="section-title">Current Location</h3>
          <iframe
            className="map"
            src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`}
          ></iframe>

          <h3 className="section-title">Achievements</h3>
          <div className="badges">
            <div className="badge gold">🥇 Top Contributor</div>
            <div className="badge silver">🥈 Community Helper</div>
            <div className="badge bronze">🏅 Rising Star</div>
          </div>

          <h3 className="section-title">Activity</h3>
          <div className="timeline">
            {activity.map((x, i) => (
              <div className="timeline-item" key={i}>
                🔹 {x.text}
                <span>{new Date(x.time).toLocaleString()}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {showEdit && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Profile</h3>

            <form onSubmit={updateProfile}>
              <input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Phone"
              />

              <input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Location"
              />

              <button className="save-btn">Save</button>
              <button type="button" className="cancel-btn" onClick={() => setShowEdit(false)}>Cancel</button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

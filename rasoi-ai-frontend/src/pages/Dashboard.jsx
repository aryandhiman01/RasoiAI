import { useEffect, useState } from "react";
import API from "../api";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  // 🌍 GPS
  const getGPS = () =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () =>
          resolve({
            lat: 28.6139,
            lng: 77.2090,
          }),
        { enableHighAccuracy: true }
      );
    });

  // Load Food
  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await API.get("food/list/");
      setFoods(res.data.available_foods);
    } catch (e) {
      console.log("Error loading food:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFoods();
    getGPS().then((loc) => setGps(loc));

    const i = setInterval(() => {
      loadFoods();
      getGPS().then((loc) => setGps(loc));
    }, 10000);

    return () => clearInterval(i);
  }, []);

  // 📏 Distance
  const calcDistance = (lat1, lon1) => {
    if (!gps) return null;

    const R = 6371;
    const dLat = ((lat1 - gps.lat) * Math.PI) / 180;
    const dLon = ((lon1 - gps.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((gps.lat * Math.PI) / 180) *
        Math.cos((lat1 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  // Claim
  const claimFood = async (id) => {
    try {
      await API.post(`food/claim/${id}/`);
      alert("Food claimed 🎉");
      loadFoods();
    } catch {
      alert("Error claiming food ❌");
    }
  };

  // Final food list
  const finalFoods = foods
    .filter((f) => f.food_name.toLowerCase().includes(search.toLowerCase()))
    .filter((f) => {
      if (filter === "near") {
        const d = calcDistance(f.latitude, f.longitude);
        return d && d <= 3;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "near" && gps) {
        return (
          calcDistance(a.latitude, a.longitude) -
          calcDistance(b.latitude, b.longitude)
        );
      }

      if (sort === "fresh") {
        return (b.freshness_score || 0) - (a.freshness_score || 0);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="dashboard-page">
      <h2 className="title">Available Food Items 🍱</h2>

      {/* Controls */}
      <div className="controls">
        <input
          className="search"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Items</option>
          <option value="near">Near You (3 km)</option>
        </select>

        <select onChange={(e) => setSort(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="fresh">Freshness</option>
          <option value="near">Nearest</option>
        </select>

        <button onClick={loadFoods} className="refresh">
          🔄 Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="food-grid">
        {finalFoods.map((f) => {
          const dist = calcDistance(f.latitude, f.longitude);

          return (
            <div className="food-card" key={f.id}>
              {f.image ? (
                <img src={f.image} className="food-img" />
              ) : (
                <div className="no-img">No Image</div>
              )}

              <h3>{f.food_name}</h3>

              <p><b>Quantity:</b> {f.quantity}</p>
              <p><b>Address:</b> {f.location}</p>
              <p><b>Distance:</b> {dist ? dist + " km" : "Calculating..."}</p>

              <div className="ai-box">
                <p>
                  🍽 Estimated Food: <b>{f.food_quantity_estimate ?? "⏳"}</b>
                </p>
                <p>
                  🌿 Freshness: <b>{f.freshness_score ?? "⏳"}</b>
                </p>
              </div>

              <button onClick={() => claimFood(f.id)} className="claim-btn">
                Claim Food
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

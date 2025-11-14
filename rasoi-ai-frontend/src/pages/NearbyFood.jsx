import { useEffect, useRef, useState } from "react";
import API from "../api";
import "../styles/nearby.css";

export default function NearbyFood() {
  const [foods, setFoods] = useState([]);
  const [gps, setGps] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDist, setFilterDist] = useState("all");
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const mapRef = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const clusters = useRef(null);
  const heatmap = useRef(null);
  const rangeCircle = useRef(null);

  // PREMIUM MAP STYLE
  const mapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f4ece3" }] },
    { featureType: "road", stylers: [{ color: "#edc9a4" }] },
    { featureType: "water", stylers: [{ color: "#ffd9b3" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
  ];

  // -----------------------------------------------------------
  // GET LIVE GPS EVERY 2 SECONDS
  // -----------------------------------------------------------
  const getGPS = () =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 28.6139, lng: 77.2090 }),
        { enableHighAccuracy: true }
      );
    });

  // -----------------------------------------------------------
  // LOAD NEARBY FOOD (Realtime)
  // -----------------------------------------------------------
  const loadFoods = async () => {
    try {
      const res = await API.get("food/nearby/");
      setFoods(res.data.nearby_foods);
      updateMarkers(res.data.nearby_foods);
    } catch (err) {
      console.log("Nearby fetch error", err);
    }
  };

  // -----------------------------------------------------------
  // INIT MAP + REALTIME LOOPS
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      const loc = await getGPS();
      setGps(loc);

      initMap(loc);
      await loadFoods();

      setInterval(async () => {
        const gpsLive = await getGPS();
        setGps(gpsLive);
      }, 2000);

      setInterval(loadFoods, 2000);
    })();
  }, []);

  // -----------------------------------------------------------
  // INIT MAP
  // -----------------------------------------------------------
  const initMap = (loc) => {
    map.current = new google.maps.Map(mapRef.current, {
      center: loc,
      zoom: 14,
      disableDefaultUI: true,
      styles: mapStyle,
    });

    // USER MARKER
    new google.maps.Marker({
      map: map.current,
      position: loc,
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    });

    // RANGE CIRCLE (5km)
    rangeCircle.current = new google.maps.Circle({
      strokeColor: "#ffa64d",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#ffebcc",
      fillOpacity: 0.25,
      map: map.current,
      center: loc,
      radius: 3000, // 3 km ring
    });
  };

  // -----------------------------------------------------------
  // UPDATE MARKERS WITH ANIMATION
  // -----------------------------------------------------------
  const updateMarkers = (list) => {
    if (!map.current) return;

    for (const id in markers.current) {
      if (!list.find((f) => f.id === Number(id))) {
        markers.current[id].setMap(null);
        delete markers.current[id];
      }
    }

    list.forEach((f) => {
      if (!f.latitude || !f.longitude) return;

      const pos = { lat: Number(f.latitude), lng: Number(f.longitude) };

      if (!markers.current[f.id]) {
        const marker = new google.maps.Marker({
          map: map.current,
          position: pos,
          animation: google.maps.Animation.DROP,
          icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });

        const info = new google.maps.InfoWindow({
          content: `
            <div style="padding:10px;max-width:200px;">
              <h3>${f.food_name}</h3>
              <p><b>Qty:</b> ${f.quantity}</p>
              <p><b>Freshness:</b> ${f.freshness_score || "NA"}</p>
              <p><b>Distance:</b> ${f.distance_km} km</p>
              <button id="claim-${f.id}" 
                style="background:#ff7b00;color:white;border:none;padding:8px 12px;border-radius:8px;margin-top:5px;cursor:pointer;">
                Claim
              </button>
              <button id="nav-${f.id}" 
                style="background:#0084ff;color:white;border:none;padding:8px 12px;border-radius:8px;margin-left:6px;cursor:pointer;">
                Navigate
              </button>
            </div>
          `,
        });

        marker.addListener("click", () => {
          info.open(map.current, marker);

          setTimeout(() => {
            const btn1 = document.getElementById(`claim-${f.id}`);
            const btn2 = document.getElementById(`nav-${f.id}`);

            if (btn1) btn1.onclick = () => claimFood(f.id);
            if (btn2)
              btn2.onclick = () =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`,
                  "_blank"
                );
          }, 200);
        });

        markers.current[f.id] = marker;
      }
    });
  };

  // -----------------------------------------------------------
  // CLAIM FOOD
  // -----------------------------------------------------------
  const claimFood = async (id) => {
    try {
      await API.post(`food/claim/${id}/`);
      alert("Food claimed!");
      loadFoods();
    } catch {
      alert("Unable to claim food");
    }
  };

  // -----------------------------------------------------------
  // FILTERS
  // -----------------------------------------------------------
  const filtered = foods.filter((f) => {
    if (search && !f.food_name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (filterDist !== "all" && f.distance_km > Number(filterDist))
      return false;

    return true;
  });

  // -----------------------------------------------------------
  // HEATMAP
  // -----------------------------------------------------------
  const toggleHeatmap = () => {
    if (!heatmapMode) {
      const points = foods.map(
        (f) => new google.maps.LatLng(Number(f.latitude), Number(f.longitude))
      );
      heatmap.current = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map.current,
      });
      heatmap.current.set("radius", 40);
      setHeatmapMode(true);
    } else {
      heatmap.current.setMap(null);
      setHeatmapMode(false);
    }
  };

  return (
    <div className="nearby-wrapper">
      
      {/* LEFT PANEL */}
      <div className="left-panel glass">
        <h2 className="title">Nearby Food 🍱</h2>

        <input
          className="search-box"
          placeholder="Search food..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="filter" onChange={(e) => setFilterDist(e.target.value)}>
          <option value="all">All</option>
          <option value="2">Within 2 km</option>
          <option value="3">Within 3 km</option>
          <option value="5">Within 5 km</option>
        </select>

        <button className="heat-btn" onClick={toggleHeatmap}>
          {heatmapMode ? "Disable Heatmap" : "Enable Heatmap"}
        </button>

        <div className="food-list">
          {filtered.map((f) => (
            <div
              className="food-item"
              key={f.id}
              onClick={() =>
                map.current.panTo({ lat: f.latitude, lng: f.longitude })
              }
            >
              <h3>{f.food_name}</h3>
              <p>{f.quantity} servings</p>
              <b>{f.distance_km} km away</b>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div className="map-section">
        <div className="map-badge glass">
          <h4>Live Food Points: {foods.length}</h4>
          <p>
            GPS: {gps?.lat.toFixed(3)}, {gps?.lng.toFixed(3)}
          </p>
        </div>
        <div id="map" ref={mapRef}></div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import API from "../api";
import "../styles/addfood.css";

export default function AddFood() {
  const [data, setData] = useState({
    food_name: "",
    quantity: "",
    location: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "Chapati & Sabji",
    "Rice & Dal",
    "Pulao",
    "Poha",
    "Bread Snacks",
    "Mixed Veg Curry",
  ];

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---------- IMAGE HANDLER ----------
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      setMsg({ text: "Image too large — max 6MB.", type: "error" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMsg({ text: "Please upload a valid image.", type: "error" });
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMsg({ text: "Image selected ✓", type: "info" });
  };

  // ---------- VALIDATION ----------
  const validate = () => {
    if (!data.food_name.trim()) {
      setMsg({ text: "Food name is required.", type: "error" });
      return false;
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      setMsg({ text: "Enter a valid quantity.", type: "error" });
      return false;
    }
    if (!data.location.trim()) {
      setMsg({ text: "Location is required.", type: "error" });
      return false;
    }
    return true;
  };

  // ---------- SUBMIT ----------
  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setMsg({ text: "", type: "" });

      const formData = new FormData();
      formData.append("food_name", data.food_name);
      formData.append("quantity", data.quantity);
      formData.append("location", data.location);
      if (image) formData.append("image", image);

      await API.post("food/add/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg({ text: "Food added successfully 🎉", type: "success" });

      setData({ food_name: "", quantity: "", location: "" });
      setImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
    } catch (err) {
      console.log("AddFood Error:", err?.response || err);
      const server = err?.response?.data || {};
      const message = server.error || "Failed to add food. Try again.";
      setMsg({ text: message, type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ text: "", type: "" }), 6000);
    }
  };

  const estimatedCalories = () => {
    const q = Number(data.quantity) || 0;
    return q ? q * 250 : 0;
  };

  return (
    <div className="addfood-wrap">
      <div className="addfood-card premium-glass">
        <header className="card-head">
          <h1>Donate a Meal</h1>
          <p className="subtitle">Share leftover or extra food with nearby NGOs — quick and safe.</p>
        </header>

        <form className="form" onSubmit={submit}>

          {/* IMAGE UPLOAD */}
          <label className="image-uploader">
            {preview ? (
              <img src={preview} alt="preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <div className="camera-emoji">📸</div>
                <div className="hint">Upload food image (optional)</div>
                <div className="sub">Max 6MB • JPG/PNG</div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImage} />
          </label>

          {/* FOOD NAME */}
          <div className="field">
            <label>Food Name</label>
            <input
              type="text"
              placeholder="e.g. Chapati & Sabji"
              value={data.food_name}
              onChange={(e) => setData({ ...data, food_name: e.target.value })}
            />
            <div className="suggestions">
              {suggestions.map((s) => (
                <button
                  type="button"
                  className="chip"
                  key={s}
                  onClick={() => setData({ ...data, food_name: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="field two-col">
            <div>
              <label>Quantity (People)</label>
              <input
                type="number"
                value={data.quantity}
                placeholder="10"
                onChange={(e) => setData({ ...data, quantity: e.target.value })}
              />
            </div>

            <div>
              <label>Estimated Calories</label>
              <input
                type="text"
                value={
                  estimatedCalories()
                    ? `${estimatedCalories()} kcal`
                    : "-"
                }
                readOnly
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="field">
            <label>Full Address</label>
            <input
              type="text"
              placeholder="e.g., Connaught Place, Delhi"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
            />
          </div>

          {/* AI PANEL (UI Placeholder */}
          <div className="ai-panel">
            <strong>AI:</strong> Freshness & food quantity prediction will appear after upload.
          </div>

          {/* BUTTONS */}
          <div className="actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Adding..." : "Add Food Donation"}
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setData({ food_name: "", quantity: "", location: "" });
                setImage(null);
                if (preview) URL.revokeObjectURL(preview);
                setPreview("");
                setMsg({ text: "Form Cleared", type: "info" });
              }}
            >
              Clear
            </button>
          </div>

          {/* STATUS */}
          {msg.text && (
            <div className={`status ${msg.type}`}>
              {msg.type === "success"
                ? "✅ "
                : msg.type === "error"
                ? "⛔ "
                : "ℹ️ "}
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}


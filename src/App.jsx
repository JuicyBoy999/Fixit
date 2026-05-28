import { useState } from "react";
import "./App.css";

export default function App() {
  const [image, setImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Home Electronic Service</h1>
        <p>Upload your device photo for repair service</p>

        <label className="upload-box">
          <input type="file" accept="image/*" onChange={handleImage} />
          Choose Device Photo
        </label>

        {image && (
          <div className="preview">
            <img src={image} alt="Device Preview" />
          </div>
        )}

        <button className="submit-btn">Submit Request</button>
      </div>
    </div>
  );
}
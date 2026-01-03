import { useState } from "react";
import PlayH5p from "./components/PlayH5p";
import { saveH5P } from "./services/h5p-storage";
import "./styles.css";

export default function App() {
  const [h5pPath, setH5pPath] = useState("./");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const id = await saveH5P(file);
      setH5pPath(`/_h5p`);
    } catch (error) {
      console.error("Error processing H5P file:", error);
      alert("Failed to load H5P file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>LMS360 Hack Viewer - Super early beta</h1>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>Upload .h5p file</h3>
        <input type="file" accept=".h5p,.zip" onChange={handleFileChange} />
        {loading && <span> Loading...</span>}
      </div>

      <h2>H5P Content</h2>
      {!loading && <PlayH5p key={h5pPath + Date.now()} h5pJsonPath={h5pPath} />}
    </div>
  );
}

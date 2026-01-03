import { useState } from "react";
import PlayH5p from "./components/PlayH5p";
import { saveH5P } from "./services/h5p-storage";
import "./styles.css";

export default function App() {
  const [h5pPath, setH5pPath] = useState("./");
  const [loading, setLoading] = useState(false);
  const [lmsUrl, setLmsUrl] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      await saveH5P(file);
      setH5pPath(`/_h5p`);
    } catch (error) {
      console.error("Error processing H5P file:", error);
      alert("Failed to load H5P file");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!lmsUrl) return;

    // Extract ID from URL: https://lms360.vn?c=<id>
    const url = new URL(lmsUrl);
    const id = url.searchParams.get("c");

    if (!id) {
      alert("Invalid URL. Please enter a URL like https://lms360.vn?c=<id>");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/download?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch file from server");
      }
      const blob = await response.blob();
      const file = new File([blob], `h5p-${id}.h5p`, { type: "application/zip" });
      await saveH5P(file);
      setH5pPath(`/_h5p`);
    } catch (error) {
      console.error("Error fetching H5P file:", error);
      alert("Failed to fetch H5P file from LMS360. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>LMS360 Hack Viewer - Super early beta</h1>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>Options</h3>

        <div style={{ marginBottom: "15px" }}>
          <label>Fetch from LMS360 URL:</label><br />
          <input
            type="text"
            placeholder="https://lms360.vn?c=..."
            value={lmsUrl}
            onChange={(e) => setLmsUrl(e.target.value)}
            style={{ width: "300px", marginRight: "10px" }}
          />
          <button onClick={handleFetchUrl} disabled={loading}>Fetch and Load</button>
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: "10px" }}>
          <label>Or Upload .h5p file:</label><br />
          <input type="file" accept=".h5p,.zip" onChange={handleFileChange} />
        </div>

        {loading && <div style={{ marginTop: "10px", color: "blue" }}>Processing... Please wait.</div>}
      </div>

      <h2>H5P Content</h2>
      {!loading && <PlayH5p key={h5pPath + Date.now()} h5pJsonPath={h5pPath} />}
    </div>
  );
}

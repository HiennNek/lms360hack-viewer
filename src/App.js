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
      // Construct the virtual path that the SW intercepts
      // We'll point to the root of the extracted content
      // Note: h5p-standalone expects the path to CONTAIN h5p.json
      // Our saveH5P saves files with their relative paths.
      // So if h5p.json is at the root of the zip, we point to `/_h5p/` 
      // NOT `/_h5p/${id}` because we didn't prefix the storage keys with ID in this simple version
      // Wait, in h5p-storage.js I wrote: `return store.put(blob, relativePath);`
      // So the file is at simply "h5p.json". 
      // The SW intercepts /_h5p/* and looks up the star part.
      // So we should point h5p-standalone to `/_h5p`? 
      // h5p-standalone appends /h5p.json. So `/_h5p/h5p.json` -> SW looks up "h5p.json". Correct.

      // Force a remount or update by changing the key or path
      // Since we cleared the DB, previous content is gone.
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
      <h1>H5P Standalone in React</h1>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>Upload .h5p file</h3>
        <input type="file" accept=".h5p,.zip" onChange={handleFileChange} />
        {loading && <span> Loading...</span>}
      </div>

      <h2>H5P Content</h2>
      {/* Key is used to force re-mounting when path changes or just to refresh */}
      {!loading && <PlayH5p key={h5pPath + Date.now()} h5pJsonPath={h5pPath} />}
    </div>
  );
}

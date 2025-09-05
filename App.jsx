import React, { useState, useEffect } from "react";
import {
  generateMovie,
  checkStatus,
  generateCharacter,
  API_BASE,
} from "./api";

export default function App() {
  const [tab, setTab] = useState("movie");

  // === Movie State ===
  const [script, setScript] = useState("");
  const [title, setTitle] = useState("my_movie");
  const [images, setImages] = useState([]);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [jobId, setJobId] = useState(null);

  // === Character State ===
  const [charImage, setCharImage] = useState(null);
  const [charScript, setCharScript] = useState("");
  const [charVideoUrl, setCharVideoUrl] = useState(null);
  const [charLoading, setCharLoading] = useState(false);

  const handleImages = (e) => setImages(Array.from(e.target.files));
  const handleClips = (e) => setClips(Array.from(e.target.files));
  const handleCharImage = (e) => setCharImage(e.target.files[0]);

  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);
    setVideoUrl(null);

    try {
      const res = await generateMovie({ script, title, images, clips });
      if (res.job_id) {
        setJobId(res.job_id);
      }
    } catch (err) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const res = await checkStatus(jobId);
          if (res.progress) setProgress(res.progress);
          if (res.file) {
            setVideoUrl(`${API_BASE}/download/${res.file}`);
            setLoading(false);
            clearInterval(interval);
          }
        } catch {
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, loading]);

  const handleGenerateCharacter = async (e) => {
    e.preventDefault();
    if (!charImage) return alert("Upload a face image");
    setCharLoading(true);
    setCharVideoUrl(null);
    try {
      const res = await generateCharacter(charImage, charScript);
      if (res.file) {
        setCharVideoUrl(`${API_BASE}/download/${res.file}`);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setCharLoading(false);
  };

  return (
    <div className="container">
      <h1>🎬 AI Movie Creator</h1>

      <div className="tabs">
        <button
          onClick={() => setTab("movie")}
          className={tab === "movie" ? "active" : ""}
        >
          Generate Movie
        </button>
        <button
          onClick={() => setTab("character")}
          className={tab === "character" ? "active" : ""}
        >
          Character Generator
        </button>
      </div>

      {tab === "movie" && (
        <form onSubmit={handleSubmitMovie}>
          <label>Movie Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Script</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter your movie script here..."
          />

          <label>Upload Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImages} />

          <label>Upload Clips</label>
          <input type="file" accept="video/*" multiple onChange={handleClips} />

          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Movie"}
          </button>
        </form>
      )}

      {loading && (
        <div className="progress">
          <p>Rendering... {progress}%</p>
          <progress value={progress} max="100"></progress>
        </div>
      )}

      {videoUrl && (
        <div className="result">
          <h3>✅ Movie Ready</h3>
          <video controls width="100%">
            <source src={videoUrl} type="video/mp4" />
          </video>
          <a href={videoUrl} download>
            Download
          </a>
        </div>
      )}

      {tab === "character" && (
        <form onSubmit={handleGenerateCharacter}>
          <label>Upload Face Image</label>
          <input type="file" accept="image/*" onChange={handleCharImage} />

          <label>Character Speech Script</label>
          <textarea
            value={charScript}
            onChange={(e) => setCharScript(e.target.value)}
            placeholder="What should the character say?"
          />

          <button type="submit" disabled={charLoading}>
            {charLoading ? "Generating..." : "Generate Character Clip"}
          </button>
        </form>
      )}

      {charVideoUrl && (
        <div className="result">
          <h3>✅ Character Clip Ready</h3>
          <video controls width="100%">
            <source src={charVideoUrl} type="video/mp4" />
          </video>
          <a href={charVideoUrl} download>
            Download
          </a>
        </div>
      )}
    </div>
  );
}

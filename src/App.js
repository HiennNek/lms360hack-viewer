import { useState } from "react";
import PlayH5p from "./components/PlayH5p";
import { saveH5P } from "./services/h5p-storage";
import "./index.css";

// Attach polyfill to global window as early as possible
if (typeof window !== 'undefined') {
  window.H5P = window.H5P || {};
  if (!window.H5P.isEmpty) {
    window.H5P.isEmpty = function (value) {
      return value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0);
    };
  }
}

export default function App() {
  const [h5pPath, setH5pPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lmsUrl, setLmsUrl] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setH5pPath(null);
    setLoading(true);
    try {
      await saveH5P(file);
      // Give the system a moment to settle after IDB transaction
      setTimeout(() => {
        setH5pPath("/_h5p/");
        setLoading(false);
      }, 200);
    } catch (error) {
      console.error("Error processing H5P file:", error);
      alert("Tải tệp H5P thất bại");
      setLoading(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!lmsUrl) return;

    try {
      const url = new URL(lmsUrl);
      const id = url.searchParams.get("c");

      if (!id) {
        alert("URL không hợp lệ. Vui lòng nhập URL có dạng https://lms360.vn?c=<id>");
        return;
      }

      setH5pPath(null);
      setLoading(true);
      const response = await fetch(`/api/download?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch file from server");
      }
      const blob = await response.blob();
      const file = new File([blob], `h5p-${id}.h5p`, { type: "application/zip" });
      await saveH5P(file);

      setTimeout(() => {
        setH5pPath("/_h5p/");
        setLoading(false);
      }, 200);
    } catch (error) {
      console.error("Error fetching H5P file:", error);
      alert("Không thể tải tệp H5P từ LMS360.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[100px] rounded-full pointer-events-none"></div>

      <header className="mb-12 text-center fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          LMS360 Hack Viewer
        </h1>
        <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">
          Bản thử nghiệm siêu sớm (Beta)
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {/* Input Section */}
        <section className="glass-card p-8 fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center mr-3">
              🚀
            </span>
            Tùy chọn tải nội dung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* URL Input */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-600 ml-1">
                Tải từ URL LMS360:
              </label>
              <div className="flex flex-col space-y-3">
                <input
                  type="text"
                  placeholder="https://lms360.vn?c=..."
                  value={lmsUrl}
                  onChange={(e) => setLmsUrl(e.target.value)}
                  className="glass-input w-full"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Đang xử lý..." : "Tải và Phát"}
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-600 ml-1">
                Hoặc tải lên tệp .h5p:
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".h5p,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="h5p-upload"
                />
                <label
                  htmlFor="h5p-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 rounded-2xl hover:border-indigo-400 hover:bg-white/40 transition-all duration-300 cursor-pointer text-gray-400 font-medium"
                >
                  <span className="text-2xl mb-1 text-indigo-400 translate-y-2 group-hover:scale-125 transition-transform duration-300">📁</span>
                  <span className="mt-2">Nhấn để chọn tệp</span>
                </label>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-6 flex items-center justify-center text-indigo-500 font-semibold animate-pulse">
              <div className="w-5 h-5 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mr-3"></div>
              Hệ thống đang xử lý... Vui lòng đợi trong giây lát.
            </div>
          )}
        </section>

        {/* Content Section */}
        <section className="glass-card p-6 min-h-[500px] overflow-hidden fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/40">
            <h2 className="text-xl font-bold text-gray-700">Nội dung H5P</h2>
            {h5pPath !== "./" && (
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Đã tải
              </span>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden bg-white/30 min-h-[400px]">
            {!loading && h5pPath && <PlayH5p key={h5pPath + Date.now()} h5pJsonPath={h5pPath} />}
            {!h5pPath && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                <div className="text-6xl mb-4 opacity-50 animate-float">✨</div>
                <p className="font-medium">Chưa có nội dung nào được chọn</p>
                <p className="text-sm mt-2">Vui lòng nhập URL hoặc tải lên tệp để bắt đầu</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-gray-400 text-sm font-medium">
        &copy; 2026 LMS360 Hack Project
      </footer>
    </div>
  );
}

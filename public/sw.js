const DB_NAME = "h5p-storage";
const STORE_NAME = "files";

// Cache for IDB connection to avoid repeated opens
let dbPromise = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onerror = () => reject("DB Open Error");
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
        });
    }
    return dbPromise;
}

async function getFile(path) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(path);

            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject("Get Error");
        } catch (err) {
            // If transaction fails (e.g. DB closed), clear cache and try once more
            dbPromise = null;
            reject(err);
        }
    });
}

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith("/_h5p/")) {
        event.respondWith(
            (async () => {
                try {
                    const path = url.pathname.replace("/_h5p/", "");

                    const blob = await getFile(path);

                    if (blob) {
                        let contentType = "application/octet-stream";
                        if (path.endsWith(".json")) contentType = "application/json";
                        else if (path.endsWith(".js")) contentType = "text/javascript";
                        else if (path.endsWith(".css")) contentType = "text/css";
                        else if (path.endsWith(".html")) contentType = "text/html";
                        else if (path.endsWith(".png")) contentType = "image/png";
                        else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) contentType = "image/jpeg";
                        else if (path.endsWith(".mp4")) contentType = "video/mp4";
                        else if (path.endsWith(".mp3")) contentType = "audio/mpeg";

                        console.log(`[SW] Serving ${path} (Type: ${contentType})`);
                        return new Response(blob, {
                            status: 200,
                            headers: { "Content-Type": contentType },
                        });
                    } else {
                        console.warn(`[SW] File not found: ${path}`);
                        return new Response("File not found in H5P storage", { status: 404 });
                    }
                } catch (error) {
                    console.error(`[SW] Error serving ${url.pathname}:`, error);
                    return new Response("Internal Error", { status: 500 });
                }
            })()
        );
    }
});

self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

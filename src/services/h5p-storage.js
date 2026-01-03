import { openDB } from "idb";
import JSZip from "jszip";

const DB_NAME = "h5p-storage";
const STORE_NAME = "files";

async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

function findRootPath(files) {
    const h5pFile = files.find(f => f.path.endsWith("h5p.json") && (f.path.indexOf("/") === -1 || f.path.split("/").length === 2));

    const h5pEntry = files.find(f => f.path.endsWith("h5p.json"));
    if (!h5pEntry) return "";

    const path = h5pEntry.path;
    const lastSlash = path.lastIndexOf("/");
    if (lastSlash === -1) return "";
    return path.substring(0, lastSlash + 1);
}

export async function saveH5P(file) {
    const db = await getDB();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    const files = [];
    const extractionPromises = [];

    zipContent.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            extractionPromises.push(
                zipEntry.async("blob").then((blob) => {
                    files.push({ path: relativePath, blob });
                })
            );
        }
    });

    await Promise.all(extractionPromises);

    const rootPrefix = findRootPath(files);

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    await store.clear();

    const id = "content-" + Date.now();

    for (const { path, blob } of files) {
        let storagePath = path;
        if (rootPrefix && path.startsWith(rootPrefix)) {
            storagePath = path.substring(rootPrefix.length);
        }

        console.log(`[H5P Storage] Saving: ${storagePath} (Size: ${blob.size})`);
        store.put(blob, storagePath);
    }

    await tx.done;

    return id;
}

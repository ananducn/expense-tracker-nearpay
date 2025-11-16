// client/scripts/copy-index-to-200.js
import { copyFile } from "fs/promises";
import { join } from "path";

const dist = join(process.cwd(), "dist");
await copyFile(join(dist, "index.html"), join(dist, "200.html"));
console.log("Copied index.html -> 200.html");

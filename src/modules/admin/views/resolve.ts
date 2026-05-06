import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Returns the absolute path for an admin view, e.g. view('list') → .../admin/views/list.ejs */
export const view = (name: string) => path.join(__dirname, name);

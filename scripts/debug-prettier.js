import path from "path";
import { prettifyDirectory } from "~/patcher/prettier";

const modPath = path.join(".versions", process.argv[2] || "5.68.0", "mod");

await prettifyDirectory(modPath);

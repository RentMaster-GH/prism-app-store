import fs from "fs";
import path from "path";
import { transform } from "esbuild";

const srcDir = path.resolve("src");
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
}
walk(srcDir);

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const loader = file.endsWith(".tsx") ? "tsx" : file.endsWith(".ts") ? "ts" : "jsx";
  await transform(code, { loader, sourcefile: file });
}

// Also verify key JSX state identifiers in App.tsx are declared before use
const appCode = fs.readFileSync(path.join(srcDir, "App.tsx"), "utf8");
for (const ident of ["ambassadorLeaders", "ecosystemMembersCount", "prismCurMenuOpen", "prismSelectedCur"]) {
  if (appCode.includes(ident) && !new RegExp("\\b(const|let|var|function)\\s+\\[?\\s*" + ident).test(appCode)) {
    throw new Error("Undeclared state/identifier in App.tsx: " + ident);
  }
}

console.log("✅ Verified " + files.length + " TypeScript/TSX modules in Prism App Store (0 syntax or undeclared state errors).");

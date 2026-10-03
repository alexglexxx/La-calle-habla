import { existsSync, readFileSync } from "node:fs";

const required = [
  "next.config.mjs","proxy.js","app/layout.js","app/page.js","app/public-map.js",
  "app/admin/page.js","app/admin/admin-shell.js","app/globals.css",
  "src/config/territory.mjs","src/services/report-priority.mjs","src/services/public-report-view.mjs"
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`TASK 013 missing ${file}`);
}
const pkg = JSON.parse(readFileSync("package.json","utf8"));
for (const dep of ["next","react","react-dom"]) if (!pkg.dependencies?.[dep]) throw new Error(`TASK 013 missing dependency ${dep}`);
const territory = readFileSync("src/config/territory.mjs","utf8");
for (const token of ["bounds","boundary","isInsideTerritory"]) if (!territory.includes(token)) throw new Error(`Territory contract missing ${token}`);
const priority = readFileSync("src/services/report-priority.mjs","utf8");
for (const token of ["findPrimaryAttention","reasons","scoreBand"]) if (!priority.includes(token)) throw new Error(`Priority engine missing ${token}`);
console.log("TASK 013 structural check passed.");

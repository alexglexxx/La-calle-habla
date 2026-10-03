import { existsSync, readFileSync } from "node:fs";

const required = [
  "src/config/territory.mjs",
  "src/services/report-intake-service.mjs",
  "tests/task-014-territory-boundary.test.mjs"
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`TASK 014 missing ${file}`);
}

const territory = readFileSync("src/config/territory.mjs", "utf8");
for (const token of ["isInsideBoundary", "isInsideTerritory", "validateTerritoryLocation"]) {
  if (!territory.includes(token)) throw new Error(`TASK 014 territory contract missing ${token}`);
}

const intake = readFileSync("src/services/report-intake-service.mjs", "utf8");
for (const token of ["validateTerritoryLocation", "outside_territory", "locationRejected"]) {
  if (!intake.includes(token)) throw new Error(`TASK 014 intake guard missing ${token}`);
}

console.log("TASK 014 structural check passed.");

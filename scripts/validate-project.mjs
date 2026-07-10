import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "PROJECT_STATE.md",
  "AGENTS.md",
  "docs/project/vision.md",
  "docs/project/mvp-scope.md",
  "docs/project/product-principles.md",
  "docs/project/data-model-draft.md",
  "docs/project/architecture-draft.md",
  "docs/project/technical-stack.md",
  "docs/roadmap/roadmap-mvp.md",
  "src/data/seed-categories.mjs",
  "src/data/seed-statuses.mjs",
  "src/data/seed-reports.mjs",
  "src/types/domain.ts",
  "src/lib/domain-constants.mjs",
  "src/services/runtime-report-store.mjs",
  "src/services/report-service.mjs",
  "src/server/admin-page.mjs",
  "src/server/report-detail-page.mjs",
  "src/server/routes.mjs",
  "src/server/index.mjs",
  "tests/domain-contract.test.mjs"
];

const requiredScripts = ["dev", "start", "lint", "build", "test"];

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    fail(`missing ${file}`);
  }
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    fail(`missing npm script ${script}`);
  }
}

if (Object.keys(packageJson.dependencies || {}).length > 0) {
  fail("runtime dependencies should stay empty during the skeleton task");
}

if (Object.keys(packageJson.devDependencies || {}).length > 0) {
  fail("dev dependencies should stay empty during the skeleton task");
}

const domainTypes = readFileSync("src/types/domain.ts", "utf8");
for (const exportedType of ["Report", "Category", "Status", "Location", "Evidence", "LocalSeedReport"]) {
  if (!domainTypes.includes(`interface ${exportedType}`)) {
    fail(`missing domain interface ${exportedType}`);
  }
}

if (!process.exitCode) {
  console.log("Project validation passed.");
}

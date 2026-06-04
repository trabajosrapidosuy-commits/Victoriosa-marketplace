import fs from "node:fs";
import path from "node:path";

const expectedProjectName = "victoriosa-marketplace";
const projectFile = path.join(process.cwd(), ".vercel", "project.json");

if (!fs.existsSync(projectFile)) {
  console.error(
    `guard:vercel-project-link FAIL: missing ${projectFile}. Run 'vercel link' for ${expectedProjectName} before deploying.`,
  );
  process.exit(1);
}

let project;

try {
  project = JSON.parse(fs.readFileSync(projectFile, "utf8"));
} catch (error) {
  console.error(`guard:vercel-project-link FAIL: invalid JSON in ${projectFile}`);
  process.exit(1);
}

if (project.projectName !== expectedProjectName) {
  console.error(
    `guard:vercel-project-link FAIL: linked project '${project.projectName ?? "UNKNOWN"}' does not match expected '${expectedProjectName}'.`,
  );
  process.exit(1);
}

console.log(`guard:vercel-project-link PASS: linked to ${expectedProjectName}`);

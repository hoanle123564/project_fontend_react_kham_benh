const { execFileSync } = require("child_process");

const diff = execFileSync("git", ["diff", "--unified=0", "--", "src"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
const violations = diff
  .split(/\r?\n/)
  .filter((line) => /^\+[^+]/.test(line) && /font-weight\s*:\s*[89]\d{2}\b/i.test(line));

if (violations.length) {
  console.error("New or changed styles must use font-weight 700 or lower:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("font-weight check passed");

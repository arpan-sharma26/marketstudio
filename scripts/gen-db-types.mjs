/**
 * Regenerates src/types/database.ts from the local Supabase schema.
 * Avoids PowerShell redirection, which can corrupt encoding on Windows.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--linked"],
  { encoding: "utf8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const outPath = join(process.cwd(), "src", "types", "database.ts");
writeFileSync(outPath, result.stdout, { encoding: "utf8" });
console.log(`Wrote ${outPath}`);

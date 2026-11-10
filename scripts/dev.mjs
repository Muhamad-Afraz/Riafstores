import path from "node:path";
import { spawn } from "node:child_process";

// Keep dev output in its own folder. `next build` writes to `.next`, so a
// build (or a second dev server) can no longer overwrite the chunks the
// running dev server serves — which is what made pages render as unstyled
// HTML with oversized icons until the server was restarted.
const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const child = spawn(process.execPath, [nextCli, "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-dev",
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

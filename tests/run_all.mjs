import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false
  });

  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`Command failed (${res.status}): ${cmd} ${args.join(" ")}`);
  }
}

function parseArgs(argv) {
  const out = { seeds: 20, seedBase: 1000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--seeds") {
      out.seeds = Number(argv[i + 1]);
      i++;
    } else if (a === "--seed-base") {
      out.seedBase = Number(argv[i + 1]);
      i++;
    }
  }
  if (!Number.isFinite(out.seeds) || out.seeds <= 0) out.seeds = 20;
  if (!Number.isFinite(out.seedBase)) out.seedBase = 1000;
  out.seeds = Math.floor(out.seeds);
  return out;
}

function main() {
  const { seeds, seedBase } = parseArgs(process.argv.slice(2));
  run("node", ["tests/equipment.mjs"]);
  run("node", ["tests/economy_quests.mjs"]);
  run("node", ["tests/crit_focus.mjs"]);
  run("node", ["tests/purify_guard.mjs"]);
  run("node", ["tests/log_view.mjs"]);
  run("node", ["tests/logwrap_height.mjs"]);
  run("node", ["tests/upgrades.mjs"]);
  run("node", ["tests/boss_charge_break.mjs"]);
  run("node", ["tests/skill_upgrades.mjs"]);
  run("node", ["tests/evasion_focus.mjs"]);
  run("node", ["tests/class_paths.mjs"]);
  run("node", ["tests/playthrough.mjs", "--silent"]);
  run("node", ["tests/playthrough.mjs", "--silent", "--ending", "keep"]);
  run("node", ["tests/playthrough_seeds.mjs", String(seeds), String(seedBase)]);
  run("node", [
    "tests/playthrough_seeds.mjs",
    String(seeds),
    String(seedBase),
    "--ending",
    "keep"
  ]);
  run("node", [
    "tests/playthrough_seeds.mjs",
    "--seeds",
    String(seeds),
    "--seed-base",
    String(seedBase),
    "--class",
    "mage"
  ]);
  run("node", [
    "tests/playthrough_seeds.mjs",
    "--seeds",
    String(seeds),
    "--seed-base",
    String(seedBase),
    "--class",
    "mage",
    "--ending",
    "keep"
  ]);
  run("node", [
    "tests/playthrough_seeds.mjs",
    "--seeds",
    String(seeds),
    "--seed-base",
    String(seedBase),
    "--class",
    "engineer"
  ]);
  run("node", [
    "tests/playthrough_seeds.mjs",
    "--seeds",
    String(seeds),
    "--seed-base",
    String(seedBase),
    "--class",
    "engineer",
    "--ending",
    "keep"
  ]);
  console.log("PASS: all tests");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}

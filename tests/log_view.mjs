import { getVisibleLog } from "../modules/log_view.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function makeLog(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({ id: `id_${i}`, text: `line ${i}` });
  }
  return out;
}

function testMobileCapsToLimit() {
  const log = makeLog(25);
  const visible = getVisibleLog(log, { isMobile: true, max: 5 });
  assert(visible.length === 5, `移动端应保留 5 条，实际 ${visible.length}`);
  assert(visible[0].id === "id_20", "移动端应保留最新 5 条");
  assert(visible[4].id === "id_24", "移动端末尾应为最新条目");
}

function testMobileShortLogUnchanged() {
  const log = makeLog(4);
  const visible = getVisibleLog(log, { isMobile: true, max: 5 });
  assert(visible.length === 4, "短日志不应被截断");
  assert(visible[0].id === "id_0", "短日志应保留原顺序");
}

function testDesktopKeepsAll() {
  const log = makeLog(25);
  const visible = getVisibleLog(log, { isMobile: false, max: 5 });
  assert(visible.length === 25, "非移动端应保留全部日志");
}

try {
  testMobileCapsToLimit();
  testMobileShortLogUnchanged();
  testDesktopKeepsAll();
  console.log("PASS: log_view");
} catch (e) {
  console.error("FAIL: log_view", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}

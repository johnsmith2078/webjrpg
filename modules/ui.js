import { DATA } from "./data.js";
import { exportState, importState, saveState } from "./save.js";

function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element: #${id}`);
  return node;
}

export function mountApp({ game }) {
  const $gameTitle = el("gameTitle");
  const $sceneTitle = el("sceneTitle");
  const $statusDay = el("statusDay").querySelector(".chip__v");
  const $statusHP = el("statusHP").querySelector(".chip__v");
  const $statusGold = el("statusGold").querySelector(".chip__v");

  const $log = el("log");
  const $logWrap = document.querySelector(".logwrap");
  const $logTemplate = el("logItemTemplate");

  const $choices = el("choices");
  const $choiceTemplate = el("choiceTemplate");

  const $scrollLatest = el("scrollToLatest");

  const $inventoryToggle = el("inventoryToggle");
  const $inventoryCount = el("inventoryCount");
  const $inventoryDrawer = el("inventoryDrawer");
  const $inventoryClose = el("inventoryClose");
  const $inventoryList = el("inventoryList");
  const $inventoryEmpty = el("inventoryEmpty");
  const $inventoryItemTemplate = el("inventoryItemTemplate");
  const $useSelected = el("useSelected");
  const $dropSelected = el("dropSelected");

  const $settingsToggle = el("settingsToggle");
  const $settingsModal = el("settingsModal");
  const $exportSave = el("exportSave");
  const $importSave = el("importSave");
  const $resetGame = el("resetGame");
  const $highContrast = el("highContrast");

  const $backdrop = el("backdrop");

  $gameTitle.textContent = DATA.meta.title;

  let selectedInv = null;

  function logClass(type) {
    if (type === "rare") return "log__item log__item--rare";
    return "log__item";
  }

  function renderLog(state) {
    const existing = new Set([...$log.querySelectorAll(".log__item")].map((n) => n.getAttribute("data-id")));
    for (const entry of state.log) {
      if (existing.has(entry.id)) continue;

      const frag = $logTemplate.content.cloneNode(true);
      const li = frag.querySelector("li");
      const p = frag.querySelector(".log__text");
      li.className = logClass(entry.type);
      li.setAttribute("data-id", entry.id);
      p.textContent = entry.text;
      $log.appendChild(frag);
    }
    if ($logWrap) {
      $logWrap.scrollTop = $logWrap.scrollHeight;
    }
  }

  function renderHud(state) {
    const loc = DATA.locations[state.location];
    $sceneTitle.textContent = loc ? loc.name : state.location;
    const day = Math.floor(state.timeMin / 1440) + 1;
    $statusDay.textContent = String(day);
    $statusHP.textContent = `${state.player.hp}/${state.player.maxHp}`;
    $statusGold.textContent = String(state.player.gold);
  }

  function renderChoices() {
    const list = game.choices();
    $choices.innerHTML = "";
    for (const c of list) {
      const frag = $choiceTemplate.content.cloneNode(true);
      const btn = frag.querySelector("button");
      const label = frag.querySelector(".choice__label");
      const tag = frag.querySelector(".choice__tag");

      if (c.tone === "secondary") btn.classList.add("choice--secondary");
      if (c.disabled) btn.disabled = true;
      btn.setAttribute("data-choice", c.id);
      label.textContent = c.label;
      const kind = c.kind || "";
      const kindZh =
        kind === "action"
          ? "行动"
          : kind === "travel"
            ? "行走"
            : kind === "craft"
              ? "制作"
              : kind === "combat"
                ? "战斗"
                : kind;
      tag.textContent = kindZh;

      if (c.sub) {
        const sub = document.createElement("div");
        sub.className = "choice__sub";
        sub.textContent = c.sub;
        btn.appendChild(sub);
      }

      btn.addEventListener("click", () => game.handleChoice(c.id));
      $choices.appendChild(frag);
    }
  }

  function setBackdrop(on) {
    $backdrop.hidden = !on;
  }

  function openInventory() {
    setBackdrop(true);
    $inventoryDrawer.hidden = false;
    $inventoryToggle.setAttribute("aria-expanded", "true");
  }

  function closeInventory() {
    setBackdrop(false);
    $inventoryDrawer.hidden = true;
    $inventoryToggle.setAttribute("aria-expanded", "false");
    selectedInv = null;
    $useSelected.disabled = true;
    $dropSelected.disabled = true;
  }

  function renderInventory(state) {
    const items = Object.entries(state.inventory)
      .filter(([, q]) => q > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));
    $inventoryCount.textContent = String(items.reduce((acc, [, q]) => acc + q, 0));

    $inventoryList.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = $inventoryEmpty.className;
      li.textContent = $inventoryEmpty.textContent;
      $inventoryList.appendChild(li);
      return;
    }

    for (const [id, qty] of items) {
      const frag = $inventoryItemTemplate.content.cloneNode(true);
      const btn = frag.querySelector(".inv__btn");
      const name = frag.querySelector(".inv__name");
      const meta = frag.querySelector(".inv__meta");
      name.textContent = (DATA.items[id] && DATA.items[id].name) || id;
      meta.textContent = `x${qty}`;
      btn.setAttribute("data-item", id);
      btn.addEventListener("click", () => {
        selectedInv = id;
        $useSelected.disabled = false;
        $dropSelected.disabled = false;
      });
      $inventoryList.appendChild(frag);
    }
  }

  function openSettings() {
    if (typeof $settingsModal.showModal === "function") {
      $settingsModal.showModal();
    } else {
      // fallback: open in-place
      $settingsModal.setAttribute("open", "open");
    }
  }

  function closeSettings() {
    if (typeof $settingsModal.close === "function") {
      $settingsModal.close();
    } else {
      $settingsModal.removeAttribute("open");
    }
  }

  $inventoryToggle.addEventListener("click", () => openInventory());
  $inventoryClose.addEventListener("click", () => closeInventory());
  $backdrop.addEventListener("click", () => closeInventory());
  $settingsToggle.addEventListener("click", () => openSettings());

  $useSelected.addEventListener("click", () => {
    if (!selectedInv) return;
    game.useItem(selectedInv);
  });

  $dropSelected.addEventListener("click", () => {
    if (!selectedInv) return;
    game.dropItem(selectedInv);
  });

  $exportSave.addEventListener("click", async () => {
    const dump = exportState(game.getState());
    try {
      await navigator.clipboard.writeText(dump);
      alert("已复制导出内容。");
    } catch (_) {
      alert(dump);
    }
  });

  $importSave.addEventListener("click", () => {
    const raw = prompt("粘贴导出的存档 JSON：");
    if (!raw) return;
    try {
      const next = importState(raw);
      game.importState(next);
      closeSettings();
    } catch (e) {
      alert(String(e && e.message ? e.message : e));
    }
  });

  $resetGame.addEventListener("click", () => {
    const ok = confirm("确定重置本次进度？这会覆盖本地存档。");
    if (!ok) return;
    game.newGame(Date.now());
    closeSettings();
    closeInventory();
  });

  $highContrast.addEventListener("change", () => {
    const app = document.getElementById("app");
    app.dataset.contrast = $highContrast.checked ? "high" : "";
  });

  $scrollLatest.addEventListener("click", () => {
    if ($logWrap) $logWrap.scrollTop = $logWrap.scrollHeight;
  });

  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    const n = Number(e.key);
    if (!Number.isFinite(n) || n <= 0) return;
    const list = game.choices();
    const c = list[n - 1];
    if (!c || c.disabled) return;
    game.handleChoice(c.id);
  });

  function render() {
    const state = game.getState();
    renderHud(state);
    renderLog(state);
    renderChoices();
    renderInventory(state);
    saveState(state);
  }

  game.onChange(render);
  render();
}

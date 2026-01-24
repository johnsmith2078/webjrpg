# 《杉雾烛火》故事流程（实现对照）

这份文档是“唯一真相源”（single source of truth）。

- 玩法/数值/解锁/分支都应以本文为准；改动游戏逻辑时，先改本文，再改代码。
- 文中的 ID 必须与代码一致（location/recipe/enemy/event/flag/item）。

当前实现采用 A Dark Room 的节奏：
“在村里建立循环 → 解锁更远地点 → 关键事件/战斗推进 → 结局选择”。

---

## 1. 现有 ID 一览

### 1.1 地点（location_id）

- `village`：黄金村（起点/制作/休息）
- `forest_path`：杉径（采集/遭遇）
- `old_shrine`：古神社（纸符/幽火/守护者）
- `abandoned_mine`：废矿（铁矿石/分支事件）
- `mountain_pass`：山口（结局）

### 1.2 配方（recipe_id）

- `make_firepit`：石火坑
- `cook_rice`：煮饭
- `bind_charm`：缚符
- `forge_iron_blade`：锻铁刃

### 1.3 敌人（enemy_id）

- `bandit`：山贼
- `oni_wisp`：鬼面火
- `shrine_guardian`：神社守

### 1.4 道具（item_id）

- `cedar_wood`：杉木
- `rice`：米
- `onigiri`：饭团（恢复）
- `herbs`：苦草（恢复）
- `paper_charm`：纸符（材料）
- `bound_charm`：缚符（战斗道具：晕眩 1 回合）
- `iron_ore`：铁矿石
- `iron_blade`：铁刃（锻造产物；同时解锁战斗技能）
- `shrine_relic`：神社遗物（结局关键道具）

### 1.5 关键旗标（flag）

- `has_firepit`：已制作石火坑
- `heard_rumor_shrine`：听到“神社又醒了”的传闻（解锁古神社）
- `charm_bound`：已制作缚符（允许触发守护者事件）
- `has_iron_blade`：已锻造铁刃（允许触发守护者事件；解锁技能“破邪斩”）
- `shrine_cleansed`：已击败神社守（解锁山口）
- `cursed`：矿洞“不祥”状态（战斗受惩罚；可被“破邪斩”清除）
- `ending_seal`：结局分支：封印
- `ending_keep`：结局分支：保留

---

## 2. 主线（从开始到结局）

### Act 0：村落建立循环（`village`）

目标：点出“资源 → 制作 → 解锁”的核心循环。

1) 触发传闻
- 事件：`village_rumor`（once/priority）
- 结果：设置 `heard_rumor_shrine = true`

2) 建火
- 收集：`cedar_wood >= 5`
- 制作：`make_firepit`
- 结果：设置 `has_firepit = true`

3) 做恢复品（降低刷怪挫败感）
- 收集：`rice`
- 制作：`cook_rice` → `onigiri`

可选分支（一次性事件）：
- `village_trader`：游商事件（prompt）
  - 可用金币换 `herbs` 或 `paper_charm`（或离开）

### Act 1：杉径试炼（`forest_path`）

目标：第一次把战斗/采集带入“出行”。

- 解锁方式：时间门槛（`timeMin >= 30`）
- 主要事件：
  - `forest_herbs`：获得 `herbs`
  - `forest_bandits`：战斗 `bandit`（产出金币/木头）

### Act 2：古神社准备（`old_shrine`）

目标：拿到纸符并制作“缚符”（让它成为实用战斗工具）。

1) 拿纸符
- 事件：`shrine_charm` → `paper_charm`

2) 制作缚符
- 制作：`bind_charm`
- 消耗：`paper_charm x1` + `herbs x1`
- 产出：`bound_charm x1`
- 结果：设置 `charm_bound = true`

战斗用途（当前实现）：
- 在战斗中使用 `bound_charm` 会：
  - 直接造成少量伤害（符火灼伤 1-3）
  - 并让敌人晕眩 1 回合（敌人跳过一次攻击）
  - 目的：不是“白白浪费一回合”，而是制造明显的节奏优势（尤其是 boss）。

3) 幽火遭遇（可选）
- `shrine_wisp`：战斗 `oni_wisp`

### Act 3：废矿锻造（`abandoned_mine`）

目标：做出“铁刃”并让它在战斗里产生策略差异。

1) 采矿
- 事件：`mine_ore` → `iron_ore`

2) 分支选择：黑光矿脉（prompt）
- 事件：`mine_cursed_ore`
  - 选择“带走”：额外 `iron_ore x2`，设置 `cursed = true`
  - 选择“别碰”：无惩罚

3) 锻铁刃
- 制作：`forge_iron_blade`
- 消耗：`iron_ore x2` + `cedar_wood x2`
- 产出：`iron_blade x1`
- 结果：设置 `has_iron_blade = true`，并提升 `atk`
- 战斗收益：
  - 普攻对 `oni_wisp` / `shrine_guardian` 额外 +1 伤害
- 解锁战斗技能：`skill:purify`（破邪斩；对灵体/守护者伤害更高，并可清除 `cursed`）

---

## 2.6 回村特殊事件（A Dark Room 的“回家节拍”）

回到 `village`（从外面回来）会触发一次性特殊事件，用来打破单调刷素材，并把叙事塞进循环里。

触发方式：旅行抵达 `village` 时自动触发（不是靠“探索”随机刷）。

### 事件列表（event_id）

- `village_homecoming_forest`
  - 触发：从 `forest_path` 回到 `village`（once）且已有 `has_firepit`
  - 内容：村口围问“外头怎么样？”
  - 选择：换一顿热饭 / 要点草药 / 含糊其辞

- `village_homecoming_cursed`
  - 触发：带着 `cursed` 回村（once）
  - 内容：老人指出你身上“不祥”
  - 选择：花钱驱散并治疗 / 拒绝

- `village_homecoming_cleansed`
  - 触发：`shrine_cleansed` 后从 `old_shrine` 回村（once）
  - 内容：村里点灯，确认神社安静
  - 选择：收下补给 / 直接上路

---

## 2.7 新增的“路上/神社”选择事件（减少单调）

这些事件不是为了拉长流程，而是让玩家每一段路都有“决策点”。

- `forest_fork`（`forest_path`）
  - 描述：杉径岔路
  - 选择：
    - 近路：省时间，但直接触发一次战斗
    - 远路：多花时间，但稳定获得草药

- `shrine_offering`（`old_shrine`）
  - 描述：供台与灰
  - 选择：
    - 供饭团换缚符（把恢复资源转成战斗控制资源）
    - 摸灰（获得 `cursed`，后续可被“破邪斩”清除）
    - 离开

### Act 4：守护者与遗物（`old_shrine`）

目标：完成“门槛检查 + boss + 关键掉落”。

- 事件：`shrine_guardian`
- 触发条件：`charm_bound && has_iron_blade`
- 战斗：`shrine_guardian`
- 掉落：`shrine_relic`
- 结果：设置 `shrine_cleansed = true`

### Act 5：山口结局（`mountain_pass`）

目标：给出明确分支结局，避免“走到终点就是结束”的单调感。

- 解锁：`shrine_cleansed = true`
- 事件：`pass_ending`（once/priority，prompt）
- 选择：
  - `prompt:seal`：消耗 `shrine_relic`，设置 `ending_seal`，结束
  - `prompt:keep`：保留遗物，设置 `ending_keep`，结束

---

## 3. 测试要求（和代码测试对齐）

必须覆盖：
- `bind_charm` 会消耗 `paper_charm`，并产出 `bound_charm`
- `bound_charm` 在战斗中可用（至少一次成功让敌人跳过攻击）
- `forge_iron_blade` 会产出 `iron_blade` 且提升攻击，并解锁 `skill:purify`
- `shrine_guardian` 必掉 `shrine_relic`
- `pass_ending` 进入 prompt，并能选择 `seal` 完成结局

推荐执行：
- `node webjrpg/tests/playthrough.mjs`

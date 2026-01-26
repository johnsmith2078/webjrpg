# 《杉雾烛火》故事流程（实现对照）

这份文档是"唯一真相源"（single source of truth）。

- 玩法/数值/解锁/分支都应以本文为准；改动游戏逻辑时，先改本文，再改代码。
- 文中的 ID 必须与代码一致（location/recipe/enemy/event/flag/item）。

当前实现采用 A Dark Room 的节奏：
"在村里建立循环 → 解锁更远地点 → 关键事件/战斗推进 → 结局选择"。

---

## 1. 现有 ID 一览

### 1.1 地点（location_id）

- `village`：黄金村（起点/制作/休息）
- `forest_path`：杉径（采集/遭遇）
- `crystal_cave`：水晶洞窟（法师偏好/魔法资源）
- `ancient_lab`：远古实验室（工程师偏好/科技资源）
- `old_shrine`：古神社（纸符/幽火/守护者）
- `abandoned_mine`：废矿（铁矿石/分支事件）
- `mountain_pass`：山口（结局）

### 1.2 配方（recipe_id）

- `make_firepit`：石火坑
- `cook_rice`：煮饭
- `bind_charm`：缚符
- `forge_iron_blade`：锻铁刃
- `forge_heavy_blade`：重剑（战士专属）
- `craft_runic_staff`：符文法杖（法师专属）
- `assemble_scrap_pistol`：废铁手枪（工程师专属）
- `forge_master_blade`：锻神刃
- `brew_health_potion`：调配生命药水
- `craft_focus_tea`：制作凝神茶
- `assemble_explosive_trap`：组装爆炸陷阱
- `enchant_warding_talisman`：附魔护身符
- `transmute_mana_crystal`：转化法力水晶
- `repair_auto_turret`：修理自动炮塔
- `forge_plate_armor`：锻板甲
- `stitch_warding_robe`：缝制护法长袍
- `refine_iron`：提炼铁锭
- `sell_ore`：出售铁矿石

### 1.3 敌人（enemy_id）

- `bandit`：山贼
- `oni_wisp`：鬼面火
- `shrine_guardian`：神社守
- `crystal_golem`：水晶巨像（高物防，弱魔法）
- `clockwork_spider`：发条蜘蛛（高闪避，弱科技）
- `shadow_beast`：暗影兽（新敌人，高回避）
- `wolf`：野狼（高回避）
- `cursed_miner`：被诅咒的矿工（矿洞精英怪）
- `possessed_tree`：被附身的树（森林精英怪）
- `crystal_overseer`：晶域监视者（洞窟 Boss）
- `clockwork_titan`：发条巨像（实验室 Boss）
- `mine_warlord`：矿脉督战者（废矿 Boss）

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
- `iron_ingot`：铁锭（高级锻造材料）
- `mystic_herb`：神秘草药（稀有治疗材料）
- `monster_fang`：兽牙（武器升级材料）
- `spirit_stone`：灵石（稀有材料；当前无技能强化效果）
- `health_potion`：生命药水（恢复更多HP）
- `focus_tea`：凝神茶（短暂必定暴击并造成双倍伤害）
- `explosive_trap`：爆炸陷阱（战斗道具：群体伤害）
- `warding_talisman`：护身符（战斗道具：减少伤害）
- `thieves_tools`：盗贼工具（稀有工具；当前无专属交互）
- `mana_crystal`：法力水晶（法师资源）
- `scrap_metal`：废金属（工程师资源）
- `heavy_blade`：重剑（高伤武器）
- `runic_staff`：符文法杖（魔法武器）
- `scrap_pistol`：废铁手枪（远程武器）
- `master_blade`：神刃（传说武器）
- `plate_armor`：板甲（防具）
- `warding_robe`：护法长袍（防具）
- `repeating_crossbow`：连弩（武器；当前无获取途径）

### 1.5 关键旗标（flag）

- `has_firepit`：已制作石火坑
- `class_warrior`：职业：战士
- `class_mage`：职业：法师
- `class_engineer`：职业：工程师
- `heard_rumor_shrine`：听到"神社又醒了"的传闻（解锁古神社）
- `charm_bound`：已制作缚符（允许触发守护者事件）
- `has_iron_blade`：已锻造铁刃（允许触发守护者事件；解锁技能"破邪斩"）
- `shrine_cleansed`：已击败神社守（终盘链条前置之一）
- `defeated_crystal_overseer`：已击败晶域监视者（解锁山口前置之一）
- `defeated_clockwork_titan`：已击败发条巨像（解锁山口前置之一）
- `defeated_mine_warlord`：已击败矿脉督战者（解锁山口前置之一）
- `cursed`：矿洞"不祥"状态（战斗受惩罚；可被"破邪斩"清除）
- `ending_seal`：结局分支：封印
- `ending_keep`：结局分支：保留
- `met_blacksmith`：已遇见铁匠（解锁特殊锻造）
- `met_herbalist`：已遇见草药师（解锁特殊制作）
- `met_elder`：已遇见村长（解锁高级信息）
- `met_wanderer`：已遇见流浪者
- `skills_learned_purify`：已学会破邪斩
- `skills_learned_focus`：已学会凝神（必定暴击并造成双倍伤害）
- `skills_learned_power_strike`：已学会强力击
- `skills_learned_war_cry`：已学会战吼
- `skills_learned_fireball`：已学会火球术
- `skills_learned_arcane_drain`：已学会魔法盾
- `skills_learned_deploy_turret`：已学会部署炮塔
- `skills_learned_shock_swarm`：已学会电弧蜂群
- `skills_learned_heal_light`：已学会微光治愈
- `skills_learned_sweep`：已学会横扫（当前无获取途径）
- `skills_learned_stealth`：已学会隐身（当前无获取途径）
- `skills_learned_counter`：已学会反击（当前无获取途径，且战斗未实现反击触发）
- `has_heavy_blade`：已锻造重剑
- `has_runic_staff`：已制作符文法杖
- `has_scrap_pistol`：已组装废铁手枪
- `has_master_blade`：已锻神刃
- `has_plate_armor`：已锻板甲
- `has_warding_robe`：已缝制护法长袍

### 1.6 NPC（npc_id）

- `village_elder`：村长（提供背景信息和高级任务）
- `blacksmith`：铁匠（提供武器升级和战斗指导）
- `herbalist`：草药师（提供药剂制作和治疗服务）
- `wanderer`：流浪者（提供稀有物品和神秘情报）

注：`shrine_keeper` 仅为叙事称呼，当前实现未作为 `DATA.npcs` 出现。

### 1.7 技能（skill_id）

- `purify`：破邪斩（对灵体/守护者伤害更高，可清除诅咒）
- `focus`：凝神（必定暴击并造成双倍伤害）
- `sweep`：横扫（对多个敌人造成伤害）
- `counter`：反击（受到攻击时自动反击）
- `heal_light`：微光治愈（少量恢复HP）
- `stealth`：隐身（下回合回避率大幅提升）
- `power_strike`：强力击（战士：高伤害）
- `fireball`：火球术（法师：敌方防御越高伤害越高）
- `deploy_turret`：部署炮塔（工程师：持续伤害，随装备提升）
- `war_cry`：战吼（战士：压制敌人攻击）
- `arcane_drain`：魔法盾（法师：法力抵伤）
- `shock_swarm`：电弧蜂群（工程师：回合末持续伤害，随装备提升）

---

## 2. 主线（从开始到结局）

### Act 0：村落建立循环（`village`）

目标：点出"资源 → 制作 → 解锁"的核心循环，并**选择职业**。

1) 触发传闻
- 事件：`village_rumor`（once/priority）
- 结果：设置 `heard_rumor_shrine = true`

2) 建火
- 收集：`cedar_wood >= 5`
- 制作：`make_firepit`
- 结果：设置 `has_firepit = true`

3) **职业选择：起源回忆**
- 事件：`village_origins` (需 `has_firepit`)
- 选择：
- "我曾为王国而战" -> 战士（设置 `class_warrior`；学会 `power_strike` / `war_cry`；获得 `iron_ore x1`）
- "我研习奥术之道" -> 法师（设置 `class_mage`；学会 `fireball` / `arcane_drain`（魔法盾）；获得 `mana_crystal x1`）
- "我创造机械奇迹" -> 工程师（设置 `class_engineer`；学会 `deploy_turret` / `shock_swarm`；获得 `scrap_metal x1`）

说明（当前实现）：职业旗标用于解锁对应配方/资源转化；地点解锁以 `timeMin`/旗标为准。

4) 做恢复品（降低刷怪挫败感）
- 收集：`rice`
- 制作：`cook_rice` → `onigiri`

### Act 1：杉径与分支（`forest_path`）

目标：第一次把战斗/采集带入"出行"，并探索职业分支。

- 解锁方式：时间门槛（`timeMin >= 30`）
- 分支地点（当前实现：时间解锁）：
  - **水晶洞窟** (`crystal_cave`): `timeMin >= 60`。产出 `mana_crystal`。
  - **远古实验室** (`ancient_lab`): `timeMin >= 75`。产出 `scrap_metal`。
- 主要事件：  
  - `forest_herbs`：获得 `herbs`
  - `forest_bandits`：战斗 `bandit`（产出金币/木头）

### Act 2：古神社准备（`old_shrine`）

目标：拿到纸符并制作"缚符"（让它成为实用战斗工具）。

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
  - 目的：不是"白白浪费一回合"，而是制造明显的节奏优势（尤其是 boss）。

3) 幽火遭遇（可选）
- `shrine_wisp`：战斗 `oni_wisp`

### Act 3：废矿锻造（`abandoned_mine`）

目标：做出"铁刃"并让它在战斗里产生策略差异。

1) 采矿
- 事件：`mine_ore` → `iron_ore`

2) 分支选择：黑光矿脉（prompt）
- 事件：`mine_cursed_ore`
  - 选择"带走"：额外 `iron_ore x2`，设置 `cursed = true`
  - 选择"别碰"：无惩罚

3) 锻铁刃
- 制作：`forge_iron_blade`
- 消耗：`iron_ore x2` + `cedar_wood x2`
- 产出：`iron_blade x1`
- 结果：设置 `has_iron_blade = true`；获得装备 `iron_blade`（武器 atk +2），锻造后会自动装备（若可）
- 战斗收益：
  - 普攻对 `oni_wisp` / `shrine_guardian` 额外 +1 伤害
- 解锁战斗技能：`skill:purify`（破邪斩；对灵体/守护者伤害更高，并可清除 `cursed`）

---

## 2.6 回村特殊事件（A Dark Room 的"回家节拍"）

回到 `village`（从外面回来）会触发一次性特殊事件，用来打破单调刷素材，并把叙事塞进循环里。

触发方式：旅行抵达 `village` 时自动触发（不是靠"探索"随机刷）。

### 事件列表（event_id）

- `village_homecoming_forest`
  - 触发：从 `forest_path` 回到 `village`（once）且已有 `has_firepit`
  - 内容：村口围问"外头怎么样？"
  - 选择：换一顿热饭 / 要点草药 / 含糊其辞

- `village_homecoming_cursed`
  - 触发：带着 `cursed` 回村（once）
  - 内容：老人指出你身上"不祥"
  - 选择：花钱驱散并治疗 / 拒绝

- `village_homecoming_cleansed`
  - 触发：`shrine_cleansed` 后从 `old_shrine` 回村（once）
  - 内容：村里点灯，确认神社安静
  - 选择：收下补给 / 直接上路

---

## 2.7 新增的"路上/神社"选择事件（减少单调）

这些事件不是为了拉长流程，而是让玩家每一段路都有"决策点"。

- `forest_fork`（`forest_path`）
  - 描述：杉径岔路
  - 选择：
    - 近路：省时间，但直接触发一次战斗
    - 远路：多花时间，但稳定获得草药

- `shrine_offering`（`old_shrine`）
  - 描述：供台与灰
  - 选择：
    - 供饭团换缚符（把恢复资源转成战斗控制资源）
    - 摸灰（获得 `cursed`，后续可被"破邪斩"清除）
    - 离开

### Act 4：守护者与遗物（`old_shrine`）

目标：完成"门槛检查 + boss + 关键掉落"。

- 事件：`shrine_guardian`
- 触发条件：`charm_bound && has_iron_blade`
- 战斗：`shrine_guardian`
- 掉落：`shrine_relic`
- 结果：设置 `shrine_cleansed = true`

### Act 5：山口结局（`mountain_pass`）

目标：给出明确分支结局，避免"走到终点就是结束"的单调感。

- 解锁：满足以下全部条件：
  - `shrine_cleansed = true`
  - `defeated_crystal_overseer = true`
  - `defeated_clockwork_titan = true`
  - `defeated_mine_warlord = true`

补充（当前实现：山口前的 3 个 Boss 链）：
- `cave_overseer`（`crystal_cave`，once，需 `has_firepit` 且 `shrine_cleansed`）→ 战斗 `crystal_overseer`
- `lab_titan`（`ancient_lab`，once，需 `has_firepit` 且 `shrine_cleansed`）→ 战斗 `clockwork_titan`
- `mine_warlord`（`abandoned_mine`，once，需 `has_iron_blade` 且已击败前两者）→ 战斗 `mine_warlord`
- 事件：`pass_ending`（once/priority，prompt）
- 选择：
  - `prompt:seal`：消耗 `shrine_relic`，设置 `ending_seal`，结束
  - `prompt:keep`：保留遗物，设置 `ending_keep`，结束

---

## 3. 测试要求（和代码测试对齐）

必须覆盖：
- `bind_charm` 会消耗 `paper_charm`，并产出 `bound_charm`
- `bound_charm` 在战斗中可用（至少一次成功让敌人跳过攻击）
- `forge_iron_blade` 会产出 `iron_blade`（装备攻击 +2，锻造后自动装备）并解锁 `skill:purify`
- `shrine_guardian` 必掉 `shrine_relic`
- `pass_ending` 进入 prompt，并能选择 `seal` 完成结局

推荐执行：
- `node tests/playthrough.mjs`

---

## 4. NPC系统（当前实现）

### 4.1 NPC交互机制

NPC通过两种方式出现：
- **事件遇见（prompt）**：来自 `DATA.events`（如 `blacksmith_encounter` / `herbalist_encounter` / `wanderer_encounter` / `village_elder_meeting`）
- **交谈菜单（talk）**：列出 `DATA.npcs` 中 `location` 等于当前地点、且 `requirements` 满足的 NPC

当前 UI 能力：
- **greeting**：支持 `dialogues.greeting` 的多条“打招呼”文本
- **services**：支持 `npc.services` 或 `npc.dialogues.services`（可消耗道具/金币并获得道具/金币/技能）

当前未在 UI 暴露（数据可能存在）：
- `dialogues.trade`
- `dialogues` 下除 `greeting/services` 之外的分支
- “关系系统”

### 4.2 NPC详细设计

#### `village_elder`（村长）
- **位置**：`village`，需`has_firepit`触发
- **主要交互（实现）**：一次性事件 `village_elder_meeting` 会设置 `met_elder`，并开启任务 `elder_wisdom`
- **交谈菜单（实现）**：目前仅展示 greeting（不包含 trade / shrine_history / request_help 等分支）

#### `blacksmith`（铁匠）
- **位置**：`village`，需`iron_ore >= 3`触发
- **主要交互（实现）**：一次性事件 `blacksmith_encounter` 会设置 `met_blacksmith`，并开启任务 `blacksmith_mastery`
- **交谈菜单（实现）**：提供 services（`upgrade_weapon` / `refine_iron` / `sell_ore` / `teach_focus`）

#### `herbalist`（草药师）
- **位置**：`forest_path`，随机遇到
- **主要交互（实现）**：一次性事件 `herbalist_encounter` 会设置 `met_herbalist`，并开启任务 `herbalist_collection`
- **交谈菜单（实现）**：提供 services（`identify_herbs` / `sell_herbs` / `buy_mystic` / `teach_heal`）

#### `wanderer`（流浪者）
- **位置**：随机在各地遇到（通过事件 `wanderer_encounter`，once）
- **交谈菜单（实现）**：`DATA.npcs.wanderer.location = random`，当前不会出现在交谈菜单中
- **主要交互（实现）**：事件提供一次性 prompt 选择（购买灵石/购买兽牙/获得盗贼工具），并设置 `met_wanderer`，开启任务 `wanderer_mystery`

---

## 5. 技能系统（当前实现）

### 5.1 技能获取机制

技能通过设置旗标 `skills_learned_<skillId>` 获得，来源包括：
- **事件**：如 `village_origins` / `blacksmith_encounter` / `herbalist_encounter`
- **NPC services**：如 `teach_focus` / `teach_heal`
- **锻造副作用**：如锻造 `forge_iron_blade` 会额外设置 `skills_learned_purify`

注：当前实现没有“经验/等级”系统。

### 5.2 技能使用机制

- **技能点**：每个技能消耗一定的技能点（SP）
- **冷却时间**：部分技能有使用间隔
- **条件限制**：某些技能需要特定装备或状态

补充（实现细节）：
- 每场战斗开始时 `SP` 会重置为 3
- 技能冷却为“战斗内冷却”，存储在 `state.combat.skillCooldowns`

### 5.3 技能详细说明

#### `purify`（破邪斩）
- **获取**：锻造 `forge_iron_blade` 后自动学会；也可在 `blacksmith_encounter` 选择“学习锻造技巧”时学会
- **效果**：对 `oni_wisp` / `shrine_guardian` 额外伤害；若带有 `cursed` 则伤害翻倍并清除 `cursed`
- **限制**：需要装备武器允许 `purify`；每场战斗只能使用一次

#### `focus`（凝神）
- **获取**：`blacksmith_encounter` 选择“学习锻造技巧”，或后续通过铁匠服务 `teach_focus`
- **效果**：必定暴击并造成双倍伤害（持续 2 回合）
- **消耗**：消耗 1 点 SP；冷却 3 回合

注：`focus_tea` 是独立的战斗消耗品（使用后也会必定暴击并造成双倍伤害），与技能 `focus` 不互相依赖。

#### `sweep`（横扫）
- **获取**：当前实现无获取途径（技能已定义，但正常流程不可获得）
- **效果**：对所有敌人造成50%武器伤害
- **消耗**：消耗 2 点 SP；冷却 2 回合

注：当前战斗模型为 1v1，“范围伤害”在实现上等价于一次低倍率攻击。

#### `counter`（反击）
- **获取**：当前实现无获取途径
- **效果**：当前战斗未实现“自动反击”触发（仅有技能数据定义）

#### `heal_light`（微光治愈）
- **获取**：`herbalist_encounter` 学习草药知识，或草药师服务 `teach_heal`
- **效果**：恢复15点HP
- **消耗**：消耗 1 点 SP；冷却 1 回合

注：若背包中有 `mystic_herb`，当前实现会额外消耗 1 个并获得更强效果。

#### `stealth`（隐身）
- **获取**：当前实现无获取途径（技能已定义，且战斗已实现闪避效果）
- **效果**：下回合回避率+80%
- **消耗**：消耗 2 点 SP；冷却 4 回合

#### `power_strike`（强力击）
- **获取**：职业起源回忆（战士）
- **效果**：强力打击，造成高额伤害
- **消耗**：消耗2点SP

#### `war_cry`（战吼）
- **获取**：职业起源回忆（战士）
- **效果**：敌人攻击力下降，持续2回合
- **消耗**：消耗1点SP

#### `fireball`（火球术）
- **获取**：职业起源回忆（法师）
- **效果**：造成魔法伤害，敌人防御越高伤害越高（伤害 = 6 + 2×敌方def + 0~2）
- **消耗**：消耗4点MP

#### `arcane_drain`（魔法盾）
- **获取**：职业起源回忆（法师）
- **效果**：展开魔法盾，持续整场战斗；受到伤害时，将 80% 伤害转为法力消耗；法力为 0 时失效
- **消耗**：消耗3点MP

#### `deploy_turret`（部署炮塔）
- **获取**：职业起源回忆（工程师）
- **效果**：部署炮塔，持续 3 回合在回合末造成小伤害；每跳伤害 = 2 + floor(有效atk×0.4)，随装备提升；重复施放刷新持续时间并取更高每跳伤害
- **消耗**：消耗4点EN

#### `shock_swarm`（电弧蜂群）
- **获取**：职业起源回忆（工程师）
- **效果**：释放电弧蜂群，持续 4 回合在回合末造成小伤害；每跳伤害 = 1 + floor(有效atk×0.35)，随装备提升；重复施放刷新持续时间并取更高每跳伤害
- **消耗**：消耗3点EN

---

## 6. 新增物品详细说明

### 6.1 材料类物品

#### `iron_ingot`（铁锭）
- **获取**：铁匠事件/服务或 `refine_iron` 配方（消耗铁矿石 x3）；部分敌人也会掉落
- **用途**：高级锻造配方材料

#### `mystic_herb`（神秘草药）
- **获取**：草药师识别，从森林深处采集
- **用途**：高级药剂制作
- **效果**：直接使用可恢复8HP

#### `monster_fang`（兽牙）
- **获取**：击败精英怪物掉落
- **用途**：武器升级材料
- **稀有度**：稀有物品

#### `spirit_stone`（灵石）
- **获取**：部分敌人掉落 / 流浪者事件交易 / 任务奖励
- **用途**：稀有材料（配方输入、资源转化）
- **效果**：当前实现 `combat.type = skill_boost` 仅占位，无实际战斗效果

### 6.2 战斗道具

#### `explosive_trap`（爆炸陷阱）
- **制作**：铁矿石x2 + 杉木x1
- **效果**：对敌人造成8-12点范围伤害
- **使用限制**：每场战斗限用1次

#### `warding_talisman`（护身符）
- **制作**：纸符x2 + 苦草x3
- **效果**：下次受到伤害减少50%，持续2回合
- **战略价值**：对抗强力敌人的关键道具

#### `thieves_tools`（盗贼工具）
- **获取**：游商交易或特殊事件
- **用途/效果**：当前实现暂无专属交互（可作为稀有掉落/任务奖励保存）

---

## 7. 新增敌人设计

### 7.1 精英敌人

#### `shadow_beast`（暗影兽）
- **位置**：森林深处，夜晚遇到
- **特征**：高回避率，低HP
- **特征（实现）**：`traits: ["evasion"]`（战斗中有概率闪避）
- **掉落**：兽牙、盗贼工具

#### `cursed_miner`（被诅咒的矿工）
- **位置**：废矿深处
- **特征（数据）**：`traits: ["curses", "heavy_attack"]`（当前战斗未实现）
- **掉落**：铁锭、灵石

#### `possessed_tree`（被附身的树）
- **位置**：杉径深处
- **特征（数据）**：`traits: ["summon", "high_def"]`（当前战斗未实现）
- **掉落**：神秘草药、木材

### 7.2 备注

当前战斗只实现了 `evasion` trait 的闪避逻辑；其余 trait（`curses` / `heavy_attack` / `summon` / `high_def`）仅存在于数据中，后续会在“先改 story.md 再改代码”的流程下补齐。

---

## 8. 测试要求更新

### 8.1 新增测试场景

必须覆盖：
- NPC对话树的所有分支
- 技能学习和使用流程
- 新物品的制作和使用效果
- 精英敌人的战斗机制
- 组合技能的协同效果

### 8.2 平衡性测试

推荐执行：
- 测试各技能的消耗与收益平衡
- 验证新敌人的难度曲线
- 检查NPC服务的可用性和价值
- 确保新增内容不影响原有剧情

---

## 9. 装备系统设计

### 9.1 核心概念

- **装备槽位**：玩家拥有两个装备槽位（`weapon` 武器、`armor` 防具）
- **装备绑定**：装备通过 `slot` 字段标识（`weapon` 或 `armor`），从 `tags` 自动推导
- **属性来源**：装备提供 `stats` 属性（atk、def、maxHp、maxMp、maxEn）
- **装备生效**：装备必须放入对应槽位才能生效（与旧版"锻造即永久加成"区分）

### 9.2 装备数据结构

#### 状态字段
```javascript
state.equipment = {
  weapon: null,  // 当前装备的武器 itemId
  armor: null    // 当前装备的防具 itemId
}
```

#### 道具扩展字段
```javascript
DATA.items = {
  itemId: {
    name: "物品名",
    tags: ["weapon"],           // 原有字段，用于标识类型
    slot: "weapon",             // 新增：装备槽位（"weapon" 或 "armor"）
    stats: {                    // 新增：装备提供的属性加成
      atk: 2,
      def: 0,
      maxHp: 0,
      maxMp: 0,
      maxEn: 0
    },
    combat: {                   // 新增：战斗相关效果
      allowsSkills: ["purify"], // 允许使用的技能
      damageBonus: 3,           // 固定伤害加成
      damageBonusVs: {          // 针对特定敌人的伤害加成
        oni_wisp: 1,
        shrine_guardian: 1
      }
    },
    desc: "描述文字"
  }
}
```

### 9.3 装备与战斗的交互

#### 有效属性计算
战斗和 UI 使用 `derivePlayerStats(state)` 计算有效属性：
```javascript
function derivePlayerStats(state) {
  // 1. 基础属性（state.player.atk/def/maxHp 等）
  // 2. 装备加成（state.equipment.weapon/armor 的 stats）
  // 3. 组合效果（DATA.equipmentBonuses.tagCombos）
  return {
    atk: 基础 + 装备 + 组合,
    def: 基础 + 装备 + 组合,
    maxHp: 基础 + 装备 + 组合,
    maxMp: 基础 + 装备 + 组合,
    maxEn: 基础 + 装备 + 组合,
    bonuses: ["奥术共鸣", "齿轮共振", ...] // 已触发的组合名称
  };
}
```

#### 技能权限
- `purify`（破邪斩）等技能现在要求**装备的武器**在 `combat.allowsSkills` 中声明
- 例如：铁刃的 `combat.allowsSkills: ["purify"]` 允许使用破邪斩

#### 伤害计算
- 武器伤害加成来自**当前装备的武器**（而非全局 flag）
- `iron_blade` 对灵体敌人的 +1 伤害通过 `combat.damageBonusVs` 实现

### 9.4 装备组合效果

#### 数据结构
```javascript
DATA.equipmentBonuses = {
  tagCombos: [
    {
      id: "combo_magic",
      name: "奥术共鸣",           // 组合名称，显示给玩家
      tag: "magic",               // 触发组合的 tag
      count: 2,                   // 需要同 tag 装备数量
      stats: { maxMp: 3 },        // 组合提供的属性
      description: "两件魔法装备生效" // 可选描述
    },
    // ... 更多组合
  ]
};
```

#### 内置组合
| 组合名称 | 触发条件 | 效果 |
|---------|---------|------|
| 奥术共鸣 | 装备 2 件带 `magic` tag 的物品 | maxMp +3 |
| 齿轮共振 | 装备 2 件带 `tech` tag 的物品 | maxEn +3 |
| 珍稀回响 | 装备 2 件带 `rare` tag 的物品 | atk +1, def +1 |

### 9.5 装备操作

#### 装备物品
- 条件：物品在背包中、对应槽位为空、战斗中不可操作
- 自动装备：锻造装备后，如果对应槽位为空，自动装备

#### 卸下装备
- 条件：已装备该槽位、战斗中不可操作
- 丢弃自动卸下：丢弃最后一件已装备物品时，自动卸下对应槽位

### 9.6 装备列表

| 物品 ID | 名称 | 槽位 | 属性 | 战斗效果 |
|--------|------|------|------|----------|
| `iron_blade` | 铁刃 | weapon | atk +2 | 允许技能：purify；对鬼面火/神社守 +1 |
| `heavy_blade` | 重剑 | weapon | atk +6 | 允许技能：purify |
| `master_blade` | 神刃 | weapon | atk +5 | 允许技能：purify；固定伤害 +3 |
| `runic_staff` | 符文法杖 | weapon | atk +1, maxMp +5 | - |
| `scrap_pistol` | 废铁手枪 | weapon | atk +3 | - |
| `repeating_crossbow` | 连弩 | weapon | atk +3 | - |
| `plate_armor` | 板甲 | armor | def +3 | - |
| `warding_robe` | 护法长袍 | armor | def +1, maxMp +2 | - |

### 9.7 制作配方

| 配方 ID | 名称 | 输入 | 输出 | 解锁条件 |
|--------|------|------|------|----------|
| `forge_iron_blade` | 锻铁刃 | iron_ore x2, cedar_wood x2 | iron_blade x1 | has_firepit |
| `forge_heavy_blade` | 锻造重剑 | iron_ore x4, cedar_wood x3 | heavy_blade x1 | has_firepit, class_warrior, has_iron_blade |
| `craft_runic_staff` | 制作符文法杖 | cedar_wood x4, mana_crystal x2 | runic_staff x1 | has_firepit, class_mage |
| `assemble_scrap_pistol` | 组装废铁手枪 | scrap_metal x5, cedar_wood x2 | scrap_pistol x1 | has_firepit, class_engineer |
| `forge_master_blade` | 锻神刃 | iron_ingot x2, monster_fang x2, spirit_stone x1 | master_blade x1 | has_iron_blade, met_blacksmith |
| `forge_plate_armor` | 锻板甲 | iron_ingot x2, iron_ore x2 | plate_armor x1 | has_firepit, met_blacksmith |
| `stitch_warding_robe` | 缝制护法长袍 | cedar_wood x2, mana_crystal x1, spirit_stone x1 | warding_robe x1 | has_firepit, met_herbalist |

### 9.8 装备系统测试

必须覆盖：
- 锻造装备后自动装备
- 装备变化时有效属性正确更新
- 组合效果在满足条件时触发
- 卸下/丢弃装备后属性正确下降
- 战斗中无法更换装备
- 技能权限基于装备判断

推荐执行：
- `node tests/equipment.mjs`
- `node tests/run_all.mjs`

---

## 10. 数值平衡参考

### 10.1 基础属性

| 属性 | 初始值 |
|------|--------|
| hp | 20 |
| maxHp | 20 |
| mp | 10 |
| maxMp | 10 |
| en | 10 |
| maxEn | 10 |
| atk | 3 |
| def | 1 |

### 10.2 装备属性总表

| 装备 | atk | def | maxHp | maxMp | maxEn | 特殊 |
|------|-----|-----|-------|-------|-------|------|
| 无装备 | - | - | - | - | - | - |
| iron_blade | +2 | - | - | - | - | purify +1 vs 灵体 |
| heavy_blade | +6 | - | - | - | - | purify |
| master_blade | +5 | - | - | - | - | purify, +3 伤害 |
| runic_staff | +1 | - | - | +5 | - | - |
| scrap_pistol | +3 | - | - | - | - | - |
| plate_armor | - | +3 | - | - | - | - |
| warding_robe | - | +1 | - | +2 | - | - |

### 10.3 组合效果汇总

| 组合 | 需求 | atk | def | maxHp | maxMp | maxEn |
|------|------|-----|-----|-------|-------|-------|
| 奥术共鸣 | 2x magic | - | - | - | +3 | - |
| 齿轮共振 | 2x tech | - | - | - | - | +3 |
| 珍稀回响 | 2x rare | +1 | +1 | - | - | - |

### 10.4 最大属性示例

- 战士终极配装：master_blade (+5) + plate_armor (+3) + rare x2 (+1/+1) = atk 9, def 5
- 法师终极配装：runic_staff (+1/+5) + warding_robe (+1/+2) + magic x2 (+3 mp) = atk 4, def 1, maxMp 20
- 工程师终极配装：scrap_pistol (+3) + plate_armor (+3) + tech x2 (+3 en) = atk 6, def 3, maxEn 13

---

## 11. 爽点矩阵（目标实现：先改本文，再改代码）

本节定义下一阶段的设计合同：让每个道具/技能都有独特意义与可观测的爽点。

实现规则：任何玩法改动必须先更新本节（以及相关章节），再落地到代码与测试。

### 11.1 设计原则（把爽点做成“看得见的决策”）

- 锁住的选项要可见：prompt 中宁可显示“灰色不可选 + 需要条件”，也不要直接隐藏。
- 读条要清晰：高威胁招式必须提前 1 回合在 log 中提示（例如“它开始蓄力重击”）。
- 对策不做二元：避免“没有某道具就必死/必卡关”，改为软克制（减伤/打断/降低概率/缩短读条）。
- 每个强力效果都有代价：消耗品、冷却、SP/MP/EN、占用稀有材料、或牺牲时间/金币。
- 爽点必须可观测：触发时输出明确 log 文案（后续测试将用这些文案做断言）。

### 11.2 Trait -> Counter 矩阵（敌人“出题”，玩家“解题”）

| trait_id | 代表敌人 | 玩家看到的提示（示例） | 主要惩罚 | 主要对策（至少 2 条，且不应互相重复） |
|---|---|---|---|---|
| `evasion` | `shadow_beast` / `wolf` / `clockwork_spider` | “它的身形在雾里忽隐忽现。” | 普攻更容易落空（输出不稳定） | `repeating_crossbow`（降低闪避概率）、`deploy_turret`（持续压制，减少空刀损失） |
| `high_def` | `crystal_golem` / `crystal_overseer` / `possessed_tree` | “护甲像岩层一样闭合。” | 物理伤害被明显压低（战斗拖长） | `fireball`（防御越高越痛）、`deploy_turret`/`shock_swarm`（持续伤害）、`explosive_trap`（爆发破甲） |
| `heavy_attack` | `cursed_miner` / `clockwork_titan` / `mine_warlord` | “它开始蓄力。”（下一回合重击） | 下一回合高伤害（容易被一波带走） | `defend`（显著减伤）、`warding_talisman`（硬吃保险）、`stealth`（躲过重击并反打）、`bound_charm`（打断蓄力）、`counter`（格挡成功后反击） |
| `curses` | `cursed_miner` / `mine_warlord` | “黑灰缠上你的手腕。” | 进入 `cursed` 状态（后续受伤更重） | `purify`（清除诅咒并反杀）、`village_homecoming_cursed`（花钱驱散）、`warding_talisman`（减少被打穿的风险） |
| `summon` | `possessed_tree` | “根须在地面下翻涌。”（召唤/堆叠） | 召唤物/缠绕堆叠让战斗失控（持续掉血或减益） | `sweep`（清理召唤物并制造输出窗口）、`explosive_trap`（爆发清场）、`bound_charm`（阻止其连续召唤） |

注：上述为目标实现。实现时要保证：每个 trait 在第一次出现之前，至少有 2 条对策是可达且可理解的。

### 11.3 道具爽点矩阵（27/27）

| item_id | 核心意义（独特价值） | 爽点时刻（示例） | 代价/限制 | 主要联动/克制 | 获取（目标） |
|---|---|---|---|---|---|
| `rice` | 基础粮食，驱动“做饭→出行”循环 | 缺血但不必回村：先做饭团再上路 | 占用时间/火坑 | `cook_rice`、`shrine_offering` | `find_rice`（village） |
| `onigiri` | 早期回血 + 供台交换资源（把生存换成控制） | Boss 前供上一枚，换到关键缚符 | 消耗品 | `shrine_offering`（换 `bound_charm`） | `cook_rice`、`village_homecoming_*`、`shrine_guardian` 掉落 |
| `cedar_wood` | 基础材料（火坑/武器） | 早期快速做出火坑，开启整套循环 | 采集耗时 | 锻造/制作主材料 | `gather_wood`、`bandit` 掉落、交易事件 |
| `iron_ore` | 核心矿料 + 风险收益点（黑光矿脉） | “再多拿 2 块，但背上不祥”这种抉择 | 采集耗时；可能带 `cursed` | `forge_iron_blade`、`refine_iron`、`sell_ore`、`mine_cursed_ore` | `mine_ore`、交易/服务 |
| `herbs` | 小回复 + 万用原料（符/茶/药） | 低血时用一把草续命，再回村提炼 | 消耗品（若直接吃） | `bind_charm`、`craft_focus_tea`、`brew_health_potion` | `forest_herbs`、`village_homecoming_forest` |
| `paper_charm` | 符系分支核心材料 | 一张纸符换来一次“跳过敌人回合” | 不可直接用（需制作） | `bind_charm`、`enchant_warding_talisman` | `shrine_charm`、`oni_wisp` 掉落 |
| `bound_charm` | 节奏控制（打断/偷回合） | 敌人蓄力重击时掷出：它动作一滞 | 战斗消耗品 | 反制 `heavy_attack` / `summon` | `bind_charm`、`shrine_offering` |
| `iron_blade` | 开荒武器 + 解锁 `purify`（驱邪线的“开门钥匙”） | 面对诅咒/灵体时，铁刃让你第一次“像个猎人” | 需要材料与时间；占用武器槽 | 允许 `purify`；对灵体额外伤害 | `forge_iron_blade`（锻造） |
| `shrine_relic` | 结局钥匙（封印/保留） | 山口抉择：手里那件东西决定世界走向 | 关键道具（通常不该随意消耗） | `pass_ending` | `shrine_guardian` 必掉 |
| `iron_ingot` | 中后期锻造瓶颈（迫使“精炼/出售/换装备”的经济决策） | 你决定把矿石卖掉换钱，还是押注打造神器 | 需要矿石与时间；机会成本 | `forge_master_blade`、`forge_plate_armor` 等 | `refine_iron`、敌人掉落、铁匠服务 |
| `mystic_herb` | 稀有催化剂（让治疗/法术更值回票价） | 决胜时刻用它把一次治疗变成翻盘 | 稀有、消耗品 | 强化 `heal_light` / 高级配方 | 草药师识别/购买；`possessed_tree` 掉落 |
| `monster_fang` | 武器升级材料（让你去追猎“特定怪”而非无脑刷） | 为了 2 颗兽牙，你愿意再进一次雾林 | 掉落稀有；机会成本 | `forge_master_blade` / `upgrade_weapon` | `shadow_beast`/`wolf`/`mine_warlord` 掉落 |
| `spirit_stone` | 技能强化石（持有即增强技能；打造装备会消耗它） | “灵石共鸣”：关键技能伤害/治疗明显提升 | 作为材料会被消耗；稀有 | 强化所有技能；与多技能流绑定 | `cursed_miner`/`crystal_golem`/Boss 掉落；流浪者购买；任务奖励 |
| `health_potion` | 应急大回复（容错） | 血线见底时一口回血把战斗拉回正轨 | 战斗消耗品 | 搭配 `warding_talisman` 顶住重击 | `brew_health_potion`、任务奖励 |
| `focus_tea` | 速效爆发药（短窗口双倍暴击） | 你先喝茶再强力击：一回合打出爆发 | 战斗消耗品 | 与 `power_strike` / `repeating_crossbow` 协同 | `craft_focus_tea`、任务奖励 |
| `explosive_trap` | 破防/清场爆发（对召唤与高防尤其好用） | 召唤物堆起来前，一炸清空节奏 | 战斗消耗品 | 反制 `summon`、压制 `high_def` | `assemble_explosive_trap`、`repair_auto_turret`、任务奖励 |
| `warding_talisman` | 护身保险（重击窗口的最稳解法） | 看到蓄力重击，你开符硬吃不死 | 战斗消耗品 | 反制 `heavy_attack`、保底过关 | `enchant_warding_talisman`、任务奖励 |
| `thieves_tools` | 工具钥匙（解锁“隐藏选项/捷径/宝箱”） | prompt 里出现“撬开侧门（需要盗贼工具）”，你直接拿到稀有奖励 | 作为开锁工具可设定为消耗品；机会成本 | 解锁 `repeating_crossbow` 获取线；解锁 `stealth` 学习线 | `shadow_beast` 掉落；`wanderer_encounter` 获得；任务奖励 |
| `master_blade` | 终局武器：稳定输出（flat bonus），让“高防 Boss 也会掉血” | 你第一次感觉“这把刀不讲道理” | 稀有材料消耗；占用武器槽 | 对 `high_def` 更友好；允许 `purify` | `forge_master_blade` / `upgrade_weapon` |
| `mana_crystal` | 法师资源（支撑 MP 与奥术装备组合） | 法师把一次回合换成资源，后面连放法术 | 采集耗时 | `runic_staff` / `warding_robe` / 法师法术 | `crystal_cave` 探索；转化；掉落 |
| `scrap_metal` | 工程师资源（支撑 EN 与科技装备组合） | 你靠科技资源打造陷阱/炮塔，走出另一条路 | 采集耗时 | `scrap_pistol` / `repair_auto_turret` | `ancient_lab` 探索；掉落 |
| `heavy_blade` | 战士武器（高 atk；解锁横扫；强力击收益最大） | 一刀劈下去，数字就是爽 | 占用武器槽 | 解锁 `sweep`（目标）；强化 `power_strike` 价值 | `forge_heavy_blade` |
| `runic_staff` | 法师武器（提高 maxMp，让法术链成立） | 法力上限变大后，法师终于“像法师” | 占用武器槽 | 强化法师技能续航 | `craft_runic_staff` |
| `scrap_pistol` | 工程师武器（稳定输出；偏向对付硬目标） | 你用科技打穿高防怪，不用硬磨 | 占用武器槽 | 与 `deploy_turret` / `shock_swarm` 协同（DoT随装备成长） | `assemble_scrap_pistol` |
| `plate_armor` | 坦度核心（让你敢吃一记重击不死） | 面对重击怪，你能站着打完 | 占用防具槽 | 与 `counter` / `warding_talisman` 协同 | `forge_plate_armor` |
| `warding_robe` | 法师防具（防御+法力；把“脆皮法师”变成“能站住的法师”） | 你第一次能边挨打边抽蓝 | 占用防具槽；消耗稀有材料 | 与 `arcane_drain`（魔法盾）/ `purify` 协同 | `stitch_warding_robe` |
| `repeating_crossbow` | 精准武器（降低敌人闪避带来的波动） | 打闪避怪时不再“空刀” | 占用武器槽；可能牺牲爆发 | 反制 `evasion`（软克制：降低闪避率） | 目标：通过 `thieves_tools` 解锁的宝箱/事件获得，或新增工程师制作线 |

### 11.4 技能爽点矩阵（12/12）

| skill_id | 核心意义（独特价值） | 爽点时刻（示例） | 代价/限制 | 主要联动/克制 | 获取（目标） |
|---|---|---|---|---|---|
| `purify` | 驱邪与清咒（遇到诅咒/灵体时的“翻盘按钮”） | 你带着不祥使出破邪斩：伤害翻倍并净化 | 每战 1 次；需要武器允许 | 反制 `curses`；对灵体高效 | 锻造铁刃；铁匠事件可学 |
| `focus` | 锁定破绽（把一回合变成“双倍暴击”） | 凝神后接强力击：打出超额伤害 | SP 消耗 + 冷却 | 与 `power_strike` 协同 | 铁匠服务 `teach_focus` |
| `sweep` | 清场/扫荡（专门处理召唤/堆叠类麻烦） | 召唤物堆起时一招清空节奏 | SP 消耗 + 冷却 | 反制 `summon`；与陷阱协同 | 目标：铁匠服务教授（需重剑或相关条件） |
| `counter` | 防守反击（把挨打变成输出） | 敌人重击落下，你格挡并触发反击 | 被动；触发条件明确 | 反制 `heavy_attack`；与 `plate_armor` 协同 | 目标：击败/见识重击后由铁匠教授或事件领悟 |
| `heal_light` | 战斗内续航（把 SP 变成生命线） | 你在濒死边缘抬一口血，继续压制 | SP 消耗 + 冷却；可被打断/压制 | 与 `mystic_herb`/药剂协同 | 草药师事件/服务教授 |
| `stealth` | 躲招与翻盘（把一回合变成“免伤窗口”） | 躲掉蓄力重击后反打一套 | SP 消耗 + 冷却 | 反制 `heavy_attack`；与 `counter`/`bound_charm` 协同 | 目标：流浪者教授（可要求 `thieves_tools`） |
| `power_strike` | 物理爆发（把优势转成击杀） | 破绽出现时一击打穿血线 | SP 消耗 + 冷却 | 与 `focus`/茶/重剑协同 | 战士起源 |
| `fireball` | 破甲反馈（敌人越硬越痛） | 面对高防怪时火球反而更猛 | MP 消耗 + 冷却 | 反制 `high_def` | 法师起源 |
| `deploy_turret` | 持续压制（小伤害连击） | 炮塔开火后每回合都在输出，武器越强跳得越高 | EN 消耗 + 冷却 | 与 `shock_swarm` 协同；随装备成长 | 工程师起源 |
| `war_cry` | 压制（让敌人伤害变得可控） | Boss 面前一声战吼，接下来的回合都更稳 | SP 消耗 + 冷却 | 反制 `heavy_attack`（减轻重击伤害） | 战士起源 |
| `arcane_drain` | 法力护体（80% 伤害转法力） | 看到重击时开盾硬吃，法力顶住整场战斗 | MP 消耗 + 冷却；法力为 0 则失效 | 与法师装备/回复资源协同 | 法师起源 |
| `shock_swarm` | 持续压榨（长战/高防的效率解） | 一次释放，后面每回合都在收利息，随装备成长 | EN 消耗 + 冷却 | 反制 `high_def`（通过持续伤害感） | 工程师起源 |

### 11.5 落地验收（后续实现必须满足）

- 每个道具/技能至少有 1 条“可观测爽点文案”（log 断言）与 1 条“可达性证明”（确定能获得/能触发）。
- `thieves_tools` / `repeating_crossbow` / `spirit_stone` / `sweep` / `stealth` / `counter` 必须优先补齐：这是“当前存在但没意义/不可达”的最大体验洞。
- traits 的实现必须先写测试，再进战斗逻辑，并用多种子回归验证稳定性。

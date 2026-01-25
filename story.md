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

### 1.3 敌人（enemy_id）

- `bandit`：山贼
- `oni_wisp`：鬼面火
- `shrine_guardian`：神社守
- `crystal_golem`：水晶巨像（高物防，弱魔法）
- `clockwork_spider`：发条蜘蛛（高闪避，弱科技）
- `shadow_beast`：暗影兽（新敌人，高回避）
- `cursed_miner`：被诅咒的矿工（矿洞精英怪）
- `possessed_tree`：被附身的树（森林精英怪）

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
- `spirit_stone`：灵石（技能升级材料）
- `health_potion`：生命药水（恢复更多HP）
- `focus_tea`：凝神茶（临时提升暴击率）
- `explosive_trap`：爆炸陷阱（战斗道具：群体伤害）
- `warding_talisman`：护身符（战斗道具：减少伤害）
- `thieves_tools`：盗贼工具（特殊场景使用）
- `mana_crystal`：法力水晶（法师资源）
- `scrap_metal`：废金属（工程师资源）
- `heavy_blade`：重剑（高伤武器）
- `runic_staff`：符文法杖（魔法武器）
- `scrap_pistol`：废铁手枪（远程武器）
- `master_blade`：神刃（传说武器）
- `plate_armor`：板甲（防具）
- `warding_robe`：护法长袍（防具）
- `repeating_crossbow`：连弩（武器）

### 1.5 关键旗标（flag）

- `has_firepit`：已制作石火坑
- `class_warrior`：职业：战士
- `class_mage`：职业：法师
- `class_engineer`：职业：工程师
- `heard_rumor_shrine`：听到"神社又醒了"的传闻（解锁古神社）
- `charm_bound`：已制作缚符（允许触发守护者事件）
- `has_iron_blade`：已锻造铁刃（允许触发守护者事件；解锁技能"破邪斩"）
- `shrine_cleansed`：已击败神社守（解锁山口）
- `cursed`：矿洞"不祥"状态（战斗受惩罚；可被"破邪斩"清除）
- `ending_seal`：结局分支：封印
- `ending_keep`：结局分支：保留
- `met_blacksmith`：已遇见铁匠（解锁特殊锻造）
- `met_herbalist`：已遇见草药师（解锁特殊制作）
- `met_elder`：已遇见村长（解锁高级信息）
- `skills_learned_purify`：已学会破邪斩
- `skills_learned_focus`：已学会凝神（提升暴击率）
- `skills_learned_sweep`：已学会横扫（群体攻击）
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
- `shrine_keeper`：神社守卫（已故，只在回忆中出现）

### 1.7 技能（skill_id）

- `purify`：破邪斩（对灵体/守护者伤害更高，可清除诅咒）
- `focus`：凝神（提升下次攻击暴击率）
- `sweep`：横扫（对多个敌人造成伤害）
- `counter`：反击（受到攻击时自动反击）
- `heal_light`：微光治愈（少量恢复HP）
- `stealth`：隐身（下回合回避率大幅提升）
- `power_strike`：强力击（战士：高伤害）
- `fireball`：火球术（法师：魔法伤害）
- `deploy_turret`：部署炮塔（工程师：持续伤害）

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
  - "我曾为王国而战" -> 战士 (获得 `heavy_blade` 配方)
  - "我研习奥术之道" -> 法师 (获得 `runic_staff` 配方, 解锁 `crystal_cave`)
  - "我创造机械奇迹" -> 工程师 (获得 `scrap_pistol` 配方, 解锁 `ancient_lab`)

4) 做恢复品（降低刷怪挫败感）
- 收集：`rice`
- 制作：`cook_rice` → `onigiri`

### Act 1：杉径与分支（`forest_path`）

目标：第一次把战斗/采集带入"出行"，并探索职业分支。

- 解锁方式：时间门槛（`timeMin >= 30`）
- 分支地点：
  - **水晶洞窟** (`crystal_cave`): 法师可感应进入，或通过探索发现。产出 `mana_crystal`。
  - **远古实验室** (`ancient_lab`): 工程师可解锁进入，或找到钥匙。产出 `scrap_metal`。
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
- 结果：设置 `has_iron_blade = true`，并提升 `atk`
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
- `node tests/playthrough.mjs`

---

## 4. NPC系统设计

### 4.1 NPC交互机制

NPC通过事件系统触发，具有以下特征：
- **位置绑定**：每个NPC固定在特定地点或通过特定条件触发
- **对话树**：NPC支持多轮对话和选择分支
- **功能提供**：NPC提供独特服务（制作、锻造、信息、交易）
- **关系系统**：与NPC的交互影响后续剧情和可用服务

### 4.2 NPC详细设计

#### `village_elder`（村长）
- **位置**：`village`，需`has_firepit`触发
- **功能**：
  - 提供村庄历史和背景故事
  - 解锁高级地点的线索
  - 给予特殊任务和奖励
- **对话选项**：
  - 询问神社历史（了解背景）
  - 请求帮助（获得特殊道具）
  - 贸易资源（用金币换稀有物品）

#### `blacksmith`（铁匠）
- **位置**：`village`，需`iron_ore >= 3`触发
- **功能**：
  - 武器升级和锻造指导
  - 解锁高级战斗技能
  - 提供战斗技巧建议
- **特殊服务**：
  - `upgrade_weapon`：消耗材料升级武器
  - `teach_skill`：教授战斗技能

#### `herbalist`（草药师）
- **位置**：`forest_path`，随机遇到
- **功能**：
  - 草药识别和收集指导
  - 药剂制作和配方
  - 治疗服务
- **特殊服务**：
  - `identify_herbs`：识别未知草药
  - `brew_potion`：制作特殊药剂

#### `wanderer`（流浪者）
- **位置**：随机在各地遇到
- **功能**：
  - 提供神秘情报和预言
  - 交易稀有物品
  - 解开隐藏剧情
- **特殊机制**：
  - 每次游戏只能遇到一次
  - 提供的选择影响结局走向

---

## 5. 技能系统设计

### 5.1 技能获取机制

技能通过以下方式获得：
- **NPC教授**：铁匠、草药师等NPC传授
- **物品解锁**：使用特定物品领悟技能
- **事件触发**：特殊剧情事件中学会
- **等级提升**：通过战斗经验积累

### 5.2 技能使用机制

- **技能点**：每个技能消耗一定的技能点（SP）
- **冷却时间**：部分技能有使用间隔
- **条件限制**：某些技能需要特定装备或状态
- **组合技**：多个技能可以组合产生新效果

### 5.3 技能详细说明

#### `purify`（破邪斩）
- **获取**：锻造铁刃后自动学会
- **效果**：对灵体敌人+5伤害，清除诅咒状态
- **消耗**：无消耗，每场战斗只能使用一次

#### `focus`（凝神）
- **获取**：向草药师学习
- **效果**：下次攻击暴击率+50%
- **消耗**：消耗1点SP，需要凝神茶

#### `sweep`（横扫）
- **获取**：向铁匠学习，需要铁刃
- **效果**：对所有敌人造成50%武器伤害
- **消耗**：消耗2点SP，需要重型武器

#### `counter`（反击）
- **获取**：通过多次战斗后领悟
- **效果**：受到攻击时自动反击，造成50%伤害
- **消耗**：被动技能，无需主动使用

#### `heal_light`（微光治愈）
- **获取**：向草药师学习
- **效果**：恢复15点HP
- **消耗**：消耗1点SP，需要神秘草药

#### `stealth`（隐身）
- **获取**：从流浪者处获得
- **效果**：下回合回避率+80%
- **消耗**：消耗2点SP，需要护身符

---

## 6. 新增物品详细说明

### 6.1 材料类物品

#### `iron_ingot`（铁锭）
- **获取**：铁匠锻造，消耗铁矿石x3
- **用途**：高级锻造配方材料
- **价值**：交易价值8金币

#### `mystic_herb`（神秘草药）
- **获取**：草药师识别，从森林深处采集
- **用途**：高级药剂制作
- **效果**：直接使用可恢复8HP

#### `monster_fang`（兽牙）
- **获取**：击败精英怪物掉落
- **用途**：武器升级材料
- **稀有度**：稀有物品

#### `spirit_stone`（灵石）
- **获取**：神社事件或流浪者交易
- **用途**：技能升级材料
- **效果**：携带时所有技能威力+20%

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
- **效果**：在某些场景中解锁额外选项
- **剧情影响**：影响某些NPC的态度

---

## 7. 新增敌人设计

### 7.1 精英敌人

#### `shadow_beast`（暗影兽）
- **位置**：森林深处，夜晚遇到
- **特征**：高回避率，低HP
- **技能**：隐身、偷袭
- **掉落**：兽牙、盗贼工具

#### `cursed_miner`（被诅咒的矿工）
- **位置**：废矿深处
- **特征**：高攻击力，会施加诅咒
- **技能**：重击、诅咒攻击
- **掉落**：铁锭、灵石

#### `possessed_tree`（被附身的树）
- **位置**：杉径深处
- **特征**：高防御，会召唤小怪
- **技能**：根须缠绕、召唤
- **掉落**：神秘草药、木材

### 7.2 敌人AI改进

- **智能选择**：敌人根据玩家状态选择攻击方式
- **协作机制**：多个敌人会有配合攻击
- **状态变化**：敌人在不同血量阶段改变行为
- **特殊抗性**：特定敌人对某些攻击类型有抗性

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

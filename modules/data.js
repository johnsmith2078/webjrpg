// Content-first game tables.

export const DATA = {
  meta: {
    title: "杉雾烛火",
    version: 1
  },

  locations: {
    village: {
      name: "黄金村",
      desc: "山间小村，杉烟贴着屋檐打转。",
      connections: ["forest_path"],
      unlock: { type: "start" }
    },
    forest_path: {
      name: "杉径",
      desc: "落针无声。雾里像有什么在看你。",
      connections: ["village", "old_shrine", "crystal_cave", "ancient_lab"],
      unlock: { type: "time", afterMin: 30 }
    },
    crystal_cave: {
      name: "水晶洞窟",
      desc: "空气中嗡嗡作响。紫色的水晶簇像心跳一样闪烁。",
      connections: ["forest_path"],
      unlock: { type: "time", afterMin: 60 }
    },
    ancient_lab: {
      name: "远古实验室",
      desc: "生锈的齿轮咬合在一起。偶尔传来蒸汽的嘶嘶声。",
      connections: ["forest_path"],
      unlock: { type: "time", afterMin: 75 }
    },
    old_shrine: {
      name: "古神社",
      desc: "残破的鸟居。空气里有锈铃的味道。",
      connections: ["forest_path", "abandoned_mine", "mountain_pass"],
      unlock: { type: "flag", flag: "heard_rumor_shrine" }
    },
    abandoned_mine: {
      name: "废矿",
      desc: "冰冷的石廊。矿脉像眼睛一样闪。",
      connections: ["old_shrine"],
      unlock: { type: "time", afterMin: 90 }
    },
    mountain_pass: {
      name: "山口",
      desc: "风把岩石刮得发白。更高处，有一盏灯在等。",
      connections: ["old_shrine"],
      unlock: { type: "flag", flag: "shrine_cleansed" }
    }
  },

  items: {
    rice: { name: "米", tags: ["food"], desc: "白花花的米，生的。" },
    onigiri: { name: "饭团", tags: ["food"], heal: 6, desc: "捏成三角形的饭团，能填饱肚子。" },
    cedar_wood: { name: "杉木", tags: ["material"], desc: "坚硬的木头，散发着清香。" },
    iron_ore: { name: "铁矿石", tags: ["ore"], desc: "沉重的矿石，用来锻造。" },
    herbs: { name: "苦草", tags: ["medicine"], heal: 4, desc: "苦涩的草药，能止血。" },
    paper_charm: { name: "纸符", tags: ["talisman"], desc: "空白的符纸，还没画上咒文。" },
    bound_charm: { name: "缚符", tags: ["talisman"], combat: { type: "stun", turns: 1 }, desc: "注入了灵力的符咒，能定住敌人。" },
    iron_blade: {
      name: "铁刃",
      tags: ["weapon"],
      slot: "weapon",
      stats: { atk: 2 },
      combat: {
        allowsSkills: ["purify"],
        damageBonusVs: { oni_wisp: 1, shrine_guardian: 1 }
      },
      desc: "锋利的铁剑，斩妖除魔。"
    },
    shrine_relic: { name: "神社遗物", tags: ["relic"], desc: "古老的神社遗物，散发着微弱的光。" },
    iron_ingot: { name: "铁锭", tags: ["material", "rare"], desc: "精炼的铁块，锻造高级装备的材料。" },
    mystic_herb: { name: "神秘草药", tags: ["medicine", "rare"], heal: 8, desc: "稀有的草药，蕴含着强大的生命力。" },
    monster_fang: { name: "兽牙", tags: ["material", "rare"], desc: "野兽的尖牙，锐利无比。" },
    spirit_stone: { name: "灵石", tags: ["material", "rare"], combat: { type: "skill_boost" }, desc: "充满灵气的石头，能强化技能。" },
    health_potion: { name: "生命药水", tags: ["medicine"], heal: 12, desc: "红色的药水，迅速恢复生命。" },
    focus_tea: { name: "凝神茶", tags: ["consumable"], combat: { type: "focus", turns: 2 }, desc: "清爽的茶，短暂让攻击必定暴击并造成双倍伤害。" },
    explosive_trap: { name: "爆炸陷阱", tags: ["consumable"], combat: { type: "explosive", damage: [8, 12] }, desc: "简易的陷阱，威力惊人。" },
    warding_talisman: { name: "护身符", tags: ["talisman"], combat: { type: "ward", turns: 2 }, desc: "护身的符咒，能减少受到的伤害。" },
    thieves_tools: { name: "盗贼工具", tags: ["tool"], desc: "一套精致的工具，也许能打开什么。" },
    master_blade: {
      name: "神刃",
      tags: ["weapon", "rare"],
      slot: "weapon",
      stats: { atk: 5 },
      combat: { allowsSkills: ["purify"], damageBonus: 3 },
      desc: "传说中的神刃，无坚不摧。"
    },
    mana_crystal: { name: "法力水晶", tags: ["material", "magic"], desc: "闪烁着奥术光辉的水晶。" },
    scrap_metal: { name: "废金属", tags: ["material", "tech"], desc: "生锈的机械零件，可以回收利用。" },
    heavy_blade: {
      name: "重剑",
      tags: ["weapon"],
      slot: "weapon",
      stats: { atk: 6 },
      combat: { allowsSkills: ["purify"] },
      desc: "厚重的铁剑，每一击都势大力沉。"
    },
    runic_staff: { name: "符文法杖", tags: ["weapon", "magic"], slot: "weapon", stats: { atk: 1, maxMp: 5 }, desc: "刻满符文的法杖，能引导法力。" },
    scrap_pistol: { name: "废铁手枪", tags: ["weapon", "tech"], slot: "weapon", stats: { atk: 3 }, desc: "虽然简陋，但能发射致命的弹丸。" },
    plate_armor: { name: "板甲", tags: ["armor"], slot: "armor", stats: { def: 3 }, desc: "厚实的铁甲，提供极高的防御。" },
    warding_robe: { name: "护法长袍", tags: ["armor", "magic"], slot: "armor", stats: { def: 1, maxMp: 2 }, desc: "轻便的长袍，编织了防护法术。" },
    repeating_crossbow: { name: "连弩", tags: ["weapon", "tech"], slot: "weapon", stats: { atk: 3 }, desc: "精密的机械弩，能快速射击。" }
  },

  equipmentBonuses: {
    tagCombos: [
      { id: "combo_magic", name: "奥术共鸣", tag: "magic", count: 2, stats: { maxMp: 3 } },
      { id: "combo_tech", name: "齿轮共振", tag: "tech", count: 2, stats: { maxEn: 3 } },
      { id: "combo_rare", name: "珍稀回响", tag: "rare", count: 2, stats: { atk: 1, def: 1 } }
    ]
  },

  recipes: {
    make_firepit: {
      name: "石火坑",
      inputs: { cedar_wood: 5 },
      outputs: {},
      timeCostMin: 20,
      effects: { setFlag: "has_firepit" },
      hiddenIf: { flags: ["has_firepit"] }
    },
    cook_rice: {
      name: "煮饭",
      inputs: { rice: 1 },
      outputs: { onigiri: 1 },
      timeCostMin: 10,
      requirements: { flags: ["has_firepit"] }
    },
    bind_charm: {
      name: "缚符",
      inputs: { paper_charm: 1, herbs: 1 },
      outputs: { bound_charm: 1 },
      timeCostMin: 15,
      effects: { setFlag: "charm_bound" },
      requirements: { flags: ["has_firepit"] }
    },
    forge_iron_blade: {
      name: "锻铁刃",
      inputs: { iron_ore: 2, cedar_wood: 2 },
      outputs: { iron_blade: 1 },
      timeCostMin: 25,
      effects: { setFlag: "has_iron_blade" },
      requirements: { flags: ["has_firepit"] },
      hiddenIf: { flags: ["has_iron_blade"] }
    },
    forge_heavy_blade: {
      name: "锻造重剑",
      inputs: { iron_ore: 4, cedar_wood: 3 },
      outputs: { heavy_blade: 1 },
      timeCostMin: 40,
      effects: { setFlag: "has_heavy_blade" },
      requirements: { flags: ["has_firepit", "class_warrior", "has_iron_blade"] },
      hiddenIf: { flags: ["has_heavy_blade"] }
    },
    craft_runic_staff: {
      name: "制作符文法杖",
      inputs: { cedar_wood: 4, mana_crystal: 2 },
      outputs: { runic_staff: 1 },
      timeCostMin: 30,
      effects: { setFlag: "has_runic_staff" },
      requirements: { flags: ["has_firepit", "class_mage"] },
      hiddenIf: { flags: ["has_runic_staff"] }
    },
    assemble_scrap_pistol: {
      name: "组装废铁手枪",
      inputs: { scrap_metal: 5, cedar_wood: 2 },
      outputs: { scrap_pistol: 1 },
      timeCostMin: 50,
      effects: { setFlag: "has_scrap_pistol" },
      requirements: { flags: ["has_firepit", "class_engineer"] },
      hiddenIf: { flags: ["has_scrap_pistol"] }
    },
    transmute_mana_crystal: {
      name: "转化法力水晶",
      inputs: { spirit_stone: 1 },
      outputs: { mana_crystal: 3 },
      timeCostMin: 10,
      requirements: { flags: ["class_mage"] }
    },

    attune_mana_1: {
      name: "奥术淬炼 I",
      inputs: { mana_crystal: 3 },
      outputs: {},
      timeCostMin: 15,
      effects: { stats: { maxMp: 1 } },
      requirements: { flags: ["has_firepit", "class_mage"] },
      hiddenIf: { flags: ["crafted_attune_mana_1"] }
    },

    attune_mana_2: {
      name: "奥术淬炼 II",
      inputs: { mana_crystal: 5 },
      outputs: {},
      timeCostMin: 20,
      effects: { stats: { maxMp: 1 } },
      requirements: { flags: ["has_firepit", "class_mage", "crafted_attune_mana_1"] },
      hiddenIf: { flags: ["crafted_attune_mana_2"] }
    },

    attune_mana_3: {
      name: "奥术淬炼 III",
      inputs: { mana_crystal: 7 },
      outputs: {},
      timeCostMin: 25,
      effects: { stats: { maxMp: 1 } },
      requirements: { flags: ["has_firepit", "class_mage", "crafted_attune_mana_2"] },
      hiddenIf: { flags: ["crafted_attune_mana_3"] }
    },
    repair_auto_turret: {
      name: "组装自动炮塔",
      inputs: { scrap_metal: 10, iron_ore: 3 },
      outputs: { explosive_trap: 3 },
      timeCostMin: 60,
      requirements: { flags: ["class_engineer"] }
    },
    forge_master_blade: {
      name: "锻神刃",
      inputs: { iron_ingot: 2, monster_fang: 2, spirit_stone: 1 },
      outputs: { master_blade: 1 },
      timeCostMin: 45,
      effects: { setFlag: "has_master_blade" },
      requirements: { flags: ["has_iron_blade", "met_blacksmith"] },
      hiddenIf: { flags: ["has_master_blade"] }
    },

    forge_plate_armor: {
      name: "锻板甲",
      inputs: { iron_ingot: 2, iron_ore: 2 },
      outputs: { plate_armor: 1 },
      timeCostMin: 45,
      effects: { setFlag: "has_plate_armor" },
      requirements: { flags: ["has_firepit", "met_blacksmith"] },
      hiddenIf: { flags: ["has_plate_armor"] }
    },

    stitch_warding_robe: {
      name: "缝制护法长袍",
      inputs: { cedar_wood: 2, mana_crystal: 1, spirit_stone: 1 },
      outputs: { warding_robe: 1 },
      timeCostMin: 40,
      effects: { setFlag: "has_warding_robe" },
      requirements: { flags: ["has_firepit", "met_herbalist"] },
      hiddenIf: { flags: ["has_warding_robe"] }
    },

    refine_iron: {
      name: "提炼铁锭",
      inputs: { iron_ore: 3 },
      outputs: { iron_ingot: 1 },
      timeCostMin: 15,
      requirements: { flags: ["has_firepit", "met_blacksmith"] }
    },

    sell_ore: {
      name: "出售铁矿石",
      inputs: { iron_ore: 3 },
      outputs: { gold: 2 },
      timeCostMin: 5,
      requirements: { flags: ["met_blacksmith"] }
    },
    brew_health_potion: {
      name: "调配生命药水",
      inputs: { herbs: 4 },
      outputs: { health_potion: 2 },
      timeCostMin: 20,
      requirements: { flags: ["met_herbalist"] }
    },
    craft_focus_tea: {
      name: "制作凝神茶",
      inputs: { herbs: 2 },
      outputs: { focus_tea: 1 },
      timeCostMin: 15,
      requirements: { flags: ["met_herbalist"] }
    },
    assemble_explosive_trap: {
      name: "组装爆炸陷阱",
      inputs: { iron_ore: 2, cedar_wood: 1 },
      outputs: { explosive_trap: 1 },
      timeCostMin: 20,
      requirements: { flags: ["met_blacksmith"] }
    },
    enchant_warding_talisman: {
      name: "附魔护身符",
      inputs: { paper_charm: 2, herbs: 3 },
      outputs: { warding_talisman: 1 },
      timeCostMin: 30,
      requirements: { flags: ["met_herbalist"] }
    }
  },

  enemies: {
    bandit: { name: "山贼", hp: 12, atk: 2, def: 0, gold: 4, loot: { cedar_wood: 1 } },
    oni_wisp: { name: "鬼面火", hp: 10, atk: 3, def: 1, gold: 6, loot: { paper_charm: 1 } },
    shrine_guardian: {
      name: "神社守" ,
      hp: 22,
      atk: 4,
      def: 2,
      gold: 20,
      loot: { onigiri: 2, shrine_relic: 1 }
    },
    shadow_beast: {
      name: "暗影兽",
      hp: 15,
      atk: 3,
      def: 1,
      gold: 12,
      loot: { monster_fang: 1, thieves_tools: 1 },
      traits: ["evasion"]
    },
    wolf: {
      name: "野狼",
      hp: 10,
      atk: 2,
      def: 0,
      gold: 8,
      loot: { monster_fang: 1 },
      traits: ["evasion"]
    },
    cursed_miner: {
      name: "被诅咒的矿工",
      hp: 20,
      atk: 4,
      def: 2,
      gold: 14,
      loot: { iron_ingot: 1, spirit_stone: 1 },
      traits: ["curses", "heavy_attack"]
    },
    possessed_tree: {
      name: "被附身的树",
      hp: 28,
      atk: 3,
      def: 3,
      gold: 15,
      loot: { mystic_herb: 3, cedar_wood: 5 },
      traits: ["summon", "high_def"]
    },
    crystal_golem: {
      name: "水晶巨像",
      hp: 18,
      atk: 4,
      def: 3,
      gold: 16,
      loot: { mana_crystal: 2, spirit_stone: 1 },
      traits: ["high_def"]
    },
    clockwork_spider: {
      name: "发条蜘蛛",
      hp: 18,
      atk: 4,
      def: 2,
      gold: 14,
      loot: { scrap_metal: 3 },
      traits: ["evasion"]
    },
    crystal_overseer: {
      name: "晶域监视者",
      hp: 32,
      atk: 4,
      def: 4,
      gold: 30,
      loot: { mana_crystal: 4, spirit_stone: 2 },
      traits: ["high_def"]
    },
    clockwork_titan: {
      name: "发条巨像",
      hp: 40,
      atk: 6,
      def: 4,
      gold: 32,
      loot: { scrap_metal: 6, iron_ingot: 1 },
      traits: ["heavy_attack"]
    },
    mine_warlord: {
      name: "矿脉督战者",
      hp: 36,
      atk: 5,
      def: 4,
      gold: 34,
      loot: { iron_ingot: 3, monster_fang: 2 },
      traits: ["curses", "heavy_attack"]
    }
  },

  events: {
    village_rumor: {
      at: "village",
      w: 2,
      once: true,
      priority: 5,
      text: ["老猎人压低声音：\"神社又醒了。\""],
      ops: [{ op: "setFlag", flag: "heard_rumor_shrine" }]
    },
    village_origins: {
      at: "village",
      w: 0,
      once: true,
      priority: 9,
      requirements: { flags: ["has_firepit"] },
      text: ["火坑噼啪作响。你盯着火星升起，忽然想起自己曾经是谁。"],
      prompt: {
        title: "起源",
        choices: [
          {
            id: "warrior",
            label: "我曾为王国而战",
            ops: [
              { op: "setFlag", flag: "class_warrior" },
              { op: "setFlag", flag: "skills_learned_power_strike" },
              { op: "setFlag", flag: "skills_learned_war_cry" },
              { op: "gainItem", item: "iron_ore", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "mage",
            label: "我研习奥术之道",
            ops: [
              { op: "setFlag", flag: "class_mage" },
              { op: "setFlag", flag: "skills_learned_fireball" },
              { op: "setFlag", flag: "skills_learned_mana_shield" },
              { op: "gainItem", item: "mana_crystal", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "engineer",
            label: "我创造机械奇迹",
            ops: [
              { op: "setFlag", flag: "class_engineer" },
              { op: "setFlag", flag: "skills_learned_deploy_turret" },
              { op: "setFlag", flag: "skills_learned_shock_swarm" },
              { op: "gainItem", item: "scrap_metal", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: []
    },
    gather_wood: {
      at: "village",
      w: 4,
      text: ["你在一户人家后院劈杉木。"],
      ops: [
        { op: "gainItem", item: "cedar_wood", qty: 2 },
        { op: "advanceTime", min: 10 }
      ]
    },
    find_rice: {
      at: "village",
      w: 2,
      text: ["邻居递给你一小袋米。"],
      ops: [{ op: "gainItem", item: "rice", qty: 1 }]
    },
    forest_herbs: {
      at: "forest_path",
      w: 3,
      text: ["湿石下藏着一把苦草。"],
      ops: [
        { op: "gainItem", item: "herbs", qty: 1 },
        { op: "advanceTime", min: 10 }
      ]
    },
    forest_bandits: {
      at: "forest_path",
      w: 2,
      text: ["山贼从雾里走出，手已搭上刀柄。"],
      ops: [
        { op: "startCombat", enemy: "bandit" },
        { op: "advanceTime", min: 5 }
      ]
    },
    forest_wolf: {
      at: "forest_path",
      w: 3,
      text: ["林间传来低吼，几匹野狼盯上了你。"],
      ops: [
        { op: "startCombat", enemy: "wolf" },
        { op: "advanceTime", min: 5 }
      ]
    },

    cave_mana: {
      at: "crystal_cave",
      w: 3,
      text: ["水晶簇轻轻共鸣，一颗法力水晶落在你掌心。"],
      ops: [
        { op: "gainItem", item: "mana_crystal", qty: 1 },
        { op: "advanceTime", min: 10 }
      ]
    },
    cave_golem: {
      at: "crystal_cave",
      w: 2,
      text: ["晶光凝聚成形，一个巨像缓缓转身。"],
      ops: [
        { op: "startCombat", enemy: "crystal_golem" },
        { op: "advanceTime", min: 5 }
      ]
    },
    cave_overseer: {
      at: "crystal_cave",
      w: 1,
      once: true,
      priority: 10,
      requirements: { flags: ["has_firepit", "shrine_cleansed"] },
      text: ["洞窟深处的水晶同时亮起。一个更巨大的影子从光里走出。"],
      ops: [
        { op: "startCombat", enemy: "crystal_overseer" },
        { op: "advanceTime", min: 8 }
      ]
    },
    lab_salvage: {
      at: "ancient_lab",
      w: 3,
      text: ["你在废弃的台架下翻出一堆废金属。"],
      ops: [
        { op: "gainItem", item: "scrap_metal", qty: 2 },
        { op: "advanceTime", min: 10 }
      ]
    },
    lab_spider: {
      at: "ancient_lab",
      w: 2,
      text: ["齿轮摩擦声逼近，一只发条蜘蛛从暗处爬出。"],
      ops: [
        { op: "startCombat", enemy: "clockwork_spider" },
        { op: "advanceTime", min: 5 }
      ]
    },
    lab_titan: {
      at: "ancient_lab",
      w: 1,
      once: true,
      priority: 10,
      requirements: { flags: ["has_firepit", "shrine_cleansed"] },
      text: ["实验室的主机在黑暗中自启。沉重的脚步声回荡。"],
      ops: [
        { op: "startCombat", enemy: "clockwork_titan" },
        { op: "advanceTime", min: 8 }
      ]
    },

    forest_fork: {
      at: "forest_path",
      w: 1,
      once: true,
      priority: 4,
      text: ["杉径在雾里分成两股。你听见远处有东西在拖行。"],
      prompt: {
        title: "岔路",
        choices: [
          {
            id: "short",
            label: "走近路（快，但更危险）",
            ops: [
              { op: "advanceTime", min: 5 },
              { op: "startCombat", enemy: "wolf" }
            ]
          },
          {
            id: "long",
            label: "绕远路（慢，但你能顺手采点草药）",
            ops: [
              { op: "advanceTime", min: 15 },
              { op: "gainItem", item: "herbs", qty: 1 }
            ]
          }
        ]
      },
      ops: []
    },
    shrine_charm: {
      at: "old_shrine",
      w: 3,
      text: ["裂柱上垂下一张纸符，轻轻摇。"],
      ops: [{ op: "gainItem", item: "paper_charm", qty: 1 }]
    },
    shrine_wisp: {
      at: "old_shrine",
      w: 2,
      requirements: { flags: ["heard_rumor_shrine"] },
      text: ["视线边缘，一团戴着鬼面的火在笑。"],
      ops: [
        { op: "startCombat", enemy: "oni_wisp" },
        { op: "advanceTime", min: 5 }
      ]
    },

    shrine_offering: {
      at: "old_shrine",
      w: 1,
      once: true,
      priority: 5,
      text: ["破损的供台上还留着灰。风里有一点米香。"],
      prompt: {
        title: "供台",
        choices: [
          {
            id: "offer_food",
            label: "供上一枚饭团（换一张缚符）",
            requires: { item: "onigiri", qty: 1 },
            ops: [
              { op: "loseItem", item: "onigiri", qty: 1 },
              { op: "gainItem", item: "bound_charm", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "touch_ash",
            label: "摸一下灰（不祥与你对视）",
            ops: [
              { op: "setFlag", flag: "cursed" },
              { op: "advanceTime", min: 2 }
            ]
          },
          {
            id: "leave",
            label: "不碰（你不想打扰这里）",
            ops: [{ op: "advanceTime", min: 1 }]
          }
        ]
      },
      ops: []
    },
    shrine_guardian: {
      at: "old_shrine",
      w: 1,
      once: true,
      priority: 10,
      requirements: { flags: ["charm_bound", "has_iron_blade"] },
      text: ["地面震动。石与祈愿凝成的守护者踏前一步。"],
      ops: [
        { op: "startCombat", enemy: "shrine_guardian" },
        { op: "advanceTime", min: 5 }
      ]
    },

    mine_cursed_ore: {
      at: "abandoned_mine",
      w: 1,
      once: true,
      priority: 6,
      text: ["矿壁深处泛着黑光。你的指尖发冷。"],
      prompt: {
        title: "黑光矿脉",
        choices: [
          {
            id: "take",
            label: "带走它（多拿 2 块铁矿石，但会沾上不祥）",
            ops: [
              { op: "gainItem", item: "iron_ore", qty: 2 },
              { op: "setFlag", flag: "cursed" }
            ]
          },
          {
            id: "leave",
            label: "别碰它（你不想招惹不该招惹的东西）",
            ops: [{ op: "advanceTime", min: 5 }]
          }
        ]
      },
      ops: []
    },
    mine_ore: {
      at: "abandoned_mine",
      w: 4,
      text: ["你撬下一块铁矿石。"],
      ops: [
        { op: "gainItem", item: "iron_ore", qty: 1 },
        { op: "advanceTime", min: 15 }
      ]
    },
    mine_warlord: {
      at: "abandoned_mine",
      w: 1,
      once: true,
      priority: 9,
      requirements: { flags: ["has_iron_blade", "defeated_crystal_overseer", "defeated_clockwork_titan"] },
      text: ["矿道尽头传来铁链拖行声。一个披甲的影子缓缓抬头。"],
      ops: [
        { op: "startCombat", enemy: "mine_warlord" },
        { op: "advanceTime", min: 8 }
      ]
    },
    pass_ending: {
      at: "mountain_pass",
      w: 5,
      once: true,
      priority: 10,
      requirements: { flags: ["shrine_cleansed"] },
      text: ["山口处，雾终于断开。", "大山像是松了口气。"],
      prompt: {
        title: "山口",
        choices: [
          {
            id: "seal",
            label: "把神社遗物封回鸟居之下（终结这段雾）",
            requires: { item: "shrine_relic", qty: 1 },
            ops: [
              { op: "loseItem", item: "shrine_relic", qty: 1 },
              { op: "setFlag", flag: "ending_seal" },
              { op: "endGame" }
            ]
          },
          {
            id: "keep",
            label: "把遗物收进怀里（你想看看它还能带来什么）",
            requires: { item: "shrine_relic", qty: 1 },
            ops: [
              { op: "setFlag", flag: "ending_keep" },
              { op: "endGame" }
            ]
          }
        ]
      },
      ops: []
    },

    village_trader: {
      at: "village",
      w: 1,
      once: false,
      priority: 4,
      requirements: { flags: ["has_firepit"] },
      text: ["游商在屋檐下摆开布包：\"要不要换点东西？\""],
      prompt: {
        title: "游商",
        choices: [
          {
            id: "buy_herbs",
            label: "用 2 钱换一把苦草",
            requires: { gold: 2 },
            ops: [
              { op: "spendGold", amt: 2 },
              { op: "gainItem", item: "herbs", qty: 1 }
            ]
          },
          {
            id: "buy_charm",
            label: "用 3 钱换一张纸符",
            requires: { gold: 3 },
            ops: [
              { op: "spendGold", amt: 3 },
              { op: "gainItem", item: "paper_charm", qty: 1 }
            ]
          },
          {
            id: "buy_iron",
            label: "用 5 钱换 2 块铁矿石",
            requires: { gold: 5 },
            ops: [
              { op: "spendGold", amt: 5 },
              { op: "gainItem", item: "iron_ore", qty: 2 }
            ]
          },
          {
            id: "buy_wood",
            label: "用 1 钱换 2 块杉木",
            requires: { gold: 1 },
            ops: [
              { op: "spendGold", amt: 1 },
              { op: "gainItem", item: "cedar_wood", qty: 2 }
            ]
          },
          {
            id: "leave",
            label: "摇摇头离开",
            ops: [
              { op: "log", text: "你摇摇头，没有交易。" },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: []
    },

    village_homecoming_forest: {
      at: "village",
      onArrive: true,
      from: ["forest_path"],
      once: true,
      priority: 9,
      requirements: { flags: ["has_firepit"] },
      text: ["你回到村口，几个熟面孔围上来。\"外头怎么样？\""],
      prompt: {
        title: "归村",
        choices: [
          {
            id: "share_food",
            label: "把你见到的告诉他们（换一顿热饭）",
            ops: [
              { op: "gainItem", item: "onigiri", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "ask_herbs",
            label: "问他们要点草药（以备不测）",
            ops: [
              { op: "gainItem", item: "herbs", qty: 1 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "stay_silent",
            label: "含糊其辞，早点回屋",
            ops: [{ op: "advanceTime", min: 2 }]
          }
        ]
      },
      ops: []
    },

    village_homecoming_cursed: {
      at: "village",
      onArrive: true,
      from: ["abandoned_mine", "old_shrine", "forest_path"],
      once: true,
      priority: 10,
      requirements: { flags: ["cursed"] },
      text: ["你一踏进村子，火堆旁的老人就皱起眉：\"你身上带着不祥。\""],
      prompt: {
        title: "不祥",
        choices: [
          {
            id: "cleanse",
            label: "请他驱散不祥（花 6 钱）",
            requires: { gold: 6 },
            ops: [
              { op: "spendGold", amt: 6 },
              { op: "clearFlag", flag: "cursed" },
              { op: "heal", amt: 8 },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "refuse",
            label: "拒绝（你还想带着它走一段）",
            ops: [{ op: "advanceTime", min: 2 }]
          }
        ]
      },
      ops: []
    },

    village_homecoming_cleansed: {
      at: "village",
      onArrive: true,
      from: ["old_shrine"],
      once: true,
      priority: 8,
      requirements: { flags: ["shrine_cleansed"] },
      text: ["村里有人点起灯笼。\"神社那边……安静了？\""],
      prompt: {
        title: "灯火",
        choices: [
          {
            id: "accept",
            label: "收下他们递来的饭团",
            ops: [
              { op: "gainItem", item: "onigiri", qty: 2 },
              { op: "advanceTime", min: 5 }
            ]
          },
          {
            id: "leave",
            label: "摇头（你只想尽快上路）",
            ops: [
              { op: "log", text: "你摇了摇头，转身离开。" },
              { op: "advanceTime", min: 1 }
            ]
          }
        ]
      },
      ops: []
    },

    village_elder_meeting: {
      at: "village",
      w: 1,
      once: true,
      priority: 6,
      requirements: { flags: ["has_firepit"] },
      text: ["村长从火堆旁走来：\"年轻人，能聊聊吗？\""],
      prompt: {
        title: "村长",
        choices: [
          {
            id: "ask_shrine",
            label: "询问神社的历史",
            ops: [
              { op: "setFlag", flag: "met_elder" },
              { op: "log", text: "村长告诉你：神社曾经是村庄的守护之地，但不知从何时起变得异常。" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "request_help",
            label: "请求帮助",
            requires: { gold: 3 },
            ops: [
              { op: "spendGold", amt: 3 },
              { op: "gainItem", item: "mystic_herb", qty: 1 },
              { op: "log", text: "村长交给你一株神秘草药：\"这也许能在危急时刻救你的命。\"" },
              { op: "setFlag", flag: "met_elder" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "politely_refuse",
            label: "礼貌地拒绝",
            ops: [
              { op: "setFlag", flag: "met_elder" },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: [{ op: "startQuest", quest: "elder_wisdom" }]
    },

    blacksmith_encounter: {
      at: "village",
      w: 1,
      once: true,
      priority: 7,
      requirements: { items: { iron_ore: 3 } },
      text: ["铁匠放下锤子：\"哦？有铁矿石？让我看看。\""],
      prompt: {
        title: "铁匠",
        choices: [
          {
            id: "learn_smithing",
            label: "学习锻造技巧",
            ops: [
              { op: "setFlag", flag: "met_blacksmith" },
              { op: "setFlag", flag: "skills_learned_purify" },
              { op: "log", text: "你还学会了破邪斩的精髓：\"正义之心，无物不破。\"" },
              { op: "advanceTime", min: 20 }
            ]
          },
          {
            id: "trade_ore",
            label: "用铁矿石换铁锭",
            requires: { items: { iron_ore: 3 } },
            ops: [
              { op: "loseItem", item: "iron_ore", qty: 3 },
              { op: "gainItem", item: "iron_ingot", qty: 1 },
              { op: "log", text: "铁匠帮你锻造：\"好铁需要好火候。这铁锭够纯，能做神器。\"" },
              { op: "setFlag", flag: "met_blacksmith" },
              { op: "advanceTime", min: 15 }
            ]
          },
          {
            id: "leave",
            label: "离开",
            ops: [
              { op: "setFlag", flag: "met_blacksmith" },
              { op: "log", text: "你告别了铁匠。" },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: [{ op: "startQuest", quest: "blacksmith_mastery" }]
    },

    herbalist_encounter: {
      at: "forest_path",
      w: 1,
      once: true,
      priority: 5,
      requirements: { flags: ["heard_rumor_shrine"] },
      text: ["一个穿绿衣的女子在采集草药：\"这些植物都有自己的故事。\""],
      prompt: {
        title: "草药师",
        choices: [
          {
            id: "learn_herbs",
            label: "学习草药知识",
            ops: [
              { op: "setFlag", flag: "met_herbalist" },
              { op: "setFlag", flag: "skills_learned_heal_light" },
              { op: "setFlag", flag: "skills_learned_focus" },
              { op: "log", text: "草药师分享知识：\"植物有灵性，用心倾听，它们会回应。\"" },
              { op: "log", text: "你学会了微光治愈：用内在之力修补外在伤痕。\"" },
              { op: "log", text: "你学会了凝神：心神归一，捕捉稍纵即逝的破绽。" },
              { op: "advanceTime", min: 15 }
            ]
          },
          {
            id: "identify_plants",
            label: "请她识别植物",
            requires: { items: { herbs: 2 } },
            ops: [
              { op: "loseItem", item: "herbs", qty: 2 },
              { op: "gainItem", item: "mystic_herb", qty: 1 },
              { op: "log", text: "草药师仔细鉴别：\"这些虽是苦草，但有灵性，经提炼能成圣药。\"" },
              { op: "setFlag", flag: "met_herbalist" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "thank_leave",
            label: "感谢后离开",
            ops: [
              { op: "setFlag", flag: "met_herbalist" },
              { op: "log", text: "你谢过草药师，继续上路。" },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: [{ op: "startQuest", quest: "herbalist_collection" }]
    },

    wanderer_encounter: {
      at: "random",
      w: 1,
      once: true,
      priority: 8,
      requirements: { flags: ["shrine_cleansed"] },
      text: ["一个神秘的流浪者出现在路边：\"命运就像雾，时而清晰，时而模糊。\""],
      prompt: {
        title: "流浪者",
        choices: [
          {
            id: "buy_rare",
            label: "购买稀有物品（10金币换1灵石）",
            requires: { gold: 10 },
            ops: [
              { op: "spendGold", amt: 10 },
              { op: "gainItem", item: "spirit_stone", qty: 1 },
              { op: "log", text: "流浪者神秘地说：\"此石通古灵，持之能见命运轨迹。\"" },
              { op: "setFlag", flag: "met_wanderer" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "buy_fang",
            label: "购买兽牙（8金币换1个）",
            requires: { gold: 8 },
            ops: [
              { op: "spendGold", amt: 8 },
              { op: "gainItem", item: "monster_fang", qty: 1 },
              { op: "log", text: "流浪者递给你一颗兽牙：\"野兽的獠牙，有时比刀剑更锋利。\"" },
              { op: "setFlag", flag: "met_wanderer" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "ask_fate",
            label: "询问命运",
            ops: [
              { op: "gainItem", item: "thieves_tools", qty: 1 },
              { op: "log", text: "流浪者低声道：\"路上会有门，也会有锁。拿着它，别把自己困住。\"" },
              { op: "setFlag", flag: "met_wanderer" },
              { op: "advanceTime", min: 15 }
            ]
          },
          {
            id: "mysterious_leave",
            label: "神秘地离开",
            ops: [
              { op: "setFlag", flag: "met_wanderer" },
              { op: "log", text: "流浪者在雾中消失了，就像从未存在过一样。" },
              { op: "advanceTime", min: 5 }
            ]
          }
        ]
      },
      ops: [{ op: "startQuest", quest: "wanderer_mystery" }]
    },

    shadow_beast_ambush: {
      at: "forest_path",
      w: 1,
      once: true,
      priority: 4,
      requirements: { flags: ["met_herbalist"] },
      text: ["黑影在林间移动，一双发亮的眼睛盯着你。"],
      ops: [
        { op: "startCombat", enemy: "shadow_beast" },
        { op: "advanceTime", min: 5 }
      ]
    },

    cursed_miner_attack: {
      at: "abandoned_mine",
      w: 1,
      once: true,
      priority: 5,
      requirements: { flags: ["has_iron_blade"] },
      text: ["矿道深处传来诅咒的低语，一个扭曲的身影走向你。"],
      ops: [
        { op: "startCombat", enemy: "cursed_miner" },
        { op: "advanceTime", min: 5 }
      ]
    },

    possessed_tree_guard: {
      at: "forest_path",
      w: 1,
      once: true,
      priority: 3,
      requirements: { flags: ["shrine_cleansed"] },
      text: ["古树发出呻吟，根须像蛇一样蠕动。"],
      ops: [
        { op: "startCombat", enemy: "possessed_tree" },
        { op: "advanceTime", min: 5 }
      ]
    }
  },

  npcs: {
    village_elder: {
      name: "村长",
      location: "village",
      requirements: { flags: ["has_firepit"] },
      dialogues: {
        greeting: [
          "年轻人，你来了。村子需要像你这样有能力的人。",
          "外面的世界很危险，但你看起来很有勇气。"
        ],
        shrine_history: [
          "神社曾经是村庄的守护之地。",
          "但不知从何时起，那里变得异常……",
          "传说需要纯洁之心才能净化那里。"
        ],
        request_help: [
          "我这里有一些祖传的物品，也许对你有用。",
          "如果你能帮助村子，这些东西就是你的了。"
        ],
        trade: {
          gold_for_herb: { cost: 5, item: "mystic_herb", qty: 1 },
          gold_for_stone: { cost: 8, item: "spirit_stone", qty: 1 }
        }
      }
    },
    blacksmith: {
      name: "铁匠",
      location: "village",
      requirements: { items: { iron_ore: 3 } },
      dialogues: {
        greeting: [
          "哦？有铁矿石？让我看看你的手艺。",
          "好的钢铁需要好的火候和耐心。"
        ],
        smithing_tips: [
          "记住，锻造不只是锤打，更是与金属对话。",
          "每一把武器都有自己的灵魂。"
        ],
        services: {
          upgrade_weapon: {
            name: "升级武器",
            requires: { items: { iron_blade: 1, monster_fang: 2, iron_ingot: 1 } },
            gives: { item: "master_blade", qty: 1 },
            cost: 10
          },
          refine_iron: {
            name: "提炼铁锭",
            requires: { items: { iron_ore: 3 } },
            gives: { item: "iron_ingot", qty: 1 },
            cost: 0,
            description: "用3块铁矿石提炼1个铁锭"
          },
          sell_ore: {
            name: "出售铁矿石",
            requires: { items: { iron_ore: 3 } },
            gives: { gold: 2 },
            cost: 0,
            description: "卖出3块铁矿石换取2钱"
          }
        }
      }
    },
    herbalist: {
      name: "草药师",
      location: "forest_path",
      requirements: { flags: ["heard_rumor_shrine"] },
      dialogues: {
        greeting: [
          "这片森林里的植物都有自己的故事。",
          "你能感受到它们的气息吗？"
        ],
        healing_wisdom: [
          "真正的治愈来自内心的平静。",
          "草药只是引导，身体会自己痊愈。"
        ],
        services: {
          identify_herbs: {
            name: "识别草药",
            requires: { items: { herbs: 3 } },
            gives: { item: "mystic_herb", qty: 1 },
            cost: 3
          },
          sell_herbs: {
            name: "出售草药",
            requires: { flags: ["met_herbalist"], items: { herbs: 5 } },
            gives: { gold: 3 },
            cost: 0,
            description: "卖出5把草药换取3钱"
          },
          buy_mystic: {
            name: "购买神秘草药",
            requires: { gold: 20 },
            gives: { item: "mystic_herb", qty: 1 },
            cost: 20,
            description: "用20金币购买1株神秘草药"
          },
          teach_heal: {
            name: "教授治愈技能",
            requires: { flags: ["met_herbalist"] },
            gives: { skill: "heal_light" },
            cost: 0
          },
          teach_focus: {
            name: "教授凝神技能",
            requires: { flags: ["met_herbalist"] },
            gives: { skill: "focus" },
            cost: 0
          }
        }
      }
    },
    wanderer: {
      name: "流浪者",
      location: "random",
      requirements: { flags: ["shrine_cleansed"] },
      dialogues: {
        greeting: [
          "我走过很多地方，见过很多事。",
          "命运就像雾，时而清晰，时而模糊。"
        ],
        mysterious_tales: [
          "山口的另一边，有更古老的东西在等待。",
          "你的选择将决定这个世界的未来。"
        ],
        trade: {
          rare_items: [
            { item: "spirit_stone", cost: 15 },
            { item: "mystic_herb", cost: 8 },
            { item: "thieves_tools", cost: 12 }
          ]
        }
      },
      encounters: {
        max_encounters: 1,
        locations: ["forest_path", "old_shrine", "abandoned_mine", "mountain_pass"]
      }
    }
  },

  quests: {
    herbalist_collection: {
      name: "草药采集任务",
      description: "为草药师采集稀有草药",
      from: "herbalist",
      requirements: { flags: ["met_herbalist"] },
      objectives: [
        { type: "collect", item: "mystic_herb", qty: 3, countMode: "acquire", description: "采集3株神秘草药" }
      ],
      rewards: {
        gold: 15,
        items: { spirit_stone: 1, focus_tea: 2 },
        flags: { quest_herbalist_complete: true }
      }
    },
    blacksmith_mastery: {
      name: "锻造大师任务",
      description: "为铁匠锻造传说中的神刃",
      from: "blacksmith", 
      requirements: { flags: ["met_blacksmith", "has_iron_blade"] },
      objectives: [
        { type: "craft", recipe: "forge_master_blade", description: "锻造神刃" }
      ],
      rewards: {
        gold: 25,
        items: { explosive_trap: 2 },
        flags: { quest_blacksmith_complete: true }
      }
    },
    elder_wisdom: {
      name: "村长智慧任务",
      description: "帮助村长收集古老知识",
      from: "village_elder",
      requirements: { flags: ["met_elder"] },
      objectives: [
        { type: "explore", location: "abandoned_mine", count: 3, description: "探索废矿3次" },
        { type: "collect", item: "shrine_relic", qty: 1, description: "获得神社遗物" }
      ],
      rewards: {
        gold: 20,
        items: { thieves_tools: 1, health_potion: 2 },
        flags: { quest_elder_complete: true }
      }
    },
    wanderer_mystery: {
      name: "流浪者之谜任务",
      description: "帮助流浪者解开古老谜题",
      from: "wanderer",
      requirements: { flags: ["met_wanderer", "shrine_cleansed"] },
      objectives: [
        { type: "defeat", enemy: "shadow_beast", description: "击败暗影兽" },
        { type: "defeat", enemy: "cursed_miner", description: "击败被诅咒的矿工" }
      ],
      rewards: {
        gold: 30,
        items: { master_blade: 1, warding_talisman: 2 },
        flags: { quest_wanderer_complete: true }
      }
    }
  },

  skills: {
    purify: {
      name: "破邪斩",
      description: "对灵体敌人造成额外伤害并清除诅咒",
      damage_bonus: 5,
      targets: ["spirit", "undead"],
      effects: ["cleanse_curse"],
      cooldown: 0,
      uses_per_combat: 1
    },
    focus: {
      name: "凝神",
      description: "短暂凝神，使攻击必定暴击并造成双倍伤害",
      effects: ["crit_boost"],
      boost_amount: 50,
      duration: 2,
      cooldown: 3,
      cost: 1
    },
    sweep: {
      name: "横扫",
      description: "对所有敌人造成范围伤害",
      damage_percent: 50,
      effects: ["area_damage"],
      cooldown: 2,
      cost: 2
    },
    counter: {
      name: "反击",
      description: "受到攻击时自动反击",
      effects: ["auto_counter"],
      counter_percent: 50,
      passive: true
    },
    heal_light: {
      name: "微光治愈",
      description: "恢复少量生命值",
      heal_amount: 15,
      effects: ["heal"],
      cooldown: 1,
      cost: 1
    },
    stealth: {
      name: "隐身",
      description: "大幅提升下回合回避率",
      effects: ["evasion_boost"],
      boost_amount: 80,
      duration: 1,
      cooldown: 4,
      cost: 2
    },
    power_strike: {
      name: "强力击",
      description: "蓄力重击，造成高额伤害",
      effects: ["heavy_damage"],
      cooldown: 2,
      cost: 2
    },
    fireball: {
      name: "火球术",
      description: "投出火球，对敌人造成魔法伤害（法力上限越高越痛，但仍受防御减伤）",
      effects: ["magic_damage"],
      base_damage: 1,
      mp_scale: 0.6,
      cooldown: 1,
      mpCost: 4
    },
    deploy_turret: {
      name: "部署炮塔",
      description: "部署炮塔，持续造成小伤害",
      effects: ["tech_dot"],
      tick_base: 2,
      atk_scale: 0.4,
      duration: 3,
      cooldown: 3,
      enCost: 4
    },
    war_cry: {
      name: "战吼",
      description: "震慑敌人，降低其攻击力",
      effects: ["weaken"],
      atk_down: 2,
      duration: 2,
      cooldown: 3,
      cost: 1
    },
    mana_shield: {
      name: "魔法盾",
      description: "展开魔法盾，以法力抵挡大部分伤害",
      effects: ["mana_shield"],
      shield_ratio: 0.7,
      cooldown: 2,
      mpCost: 4
    },
    shock_swarm: {
      name: "电弧蜂群",
      description: "释放持续电弧，回合末造成小伤害",
      effects: ["shock_swarm"],
      tick_base: 1,
      atk_scale: 0.35,
      duration: 4,
      cooldown: 3,
      enCost: 3
    }
  }
};

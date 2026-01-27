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
      connections: ["old_shrine", "fogback_waystation"],
      unlock: {
        type: "all",
        of: [
          { type: "flag", flag: "shrine_cleansed" },
          { type: "flag", flag: "defeated_crystal_overseer" },
          { type: "flag", flag: "defeated_clockwork_titan" },
          { type: "flag", flag: "defeated_mine_warlord" }
        ]
      }
    },

    // Chapter 2/3 (keep route)
    fogback_waystation: {
      name: "雾背驿站",
      desc: "一盏孤灯立在崩塌的石阶下。木梁带着杉烟，墙里却嵌着齿轮。",
      connections: ["mountain_pass", "rust_channel"],
      unlock: { type: "flag", flag: "ch2_route_opened" }
    },
    rust_channel: {
      name: "锈水渠",
      desc: "雾沿着沟渠流动，像被谁引走的潮。铁味很重。",
      connections: ["fogback_waystation", "lockyard", "lower_works"],
      unlock: { type: "flag", flag: "ch2_rust_opened" }
    },
    lockyard: {
      name: "锁场",
      desc: "成排的铁门与铆钉。鸟居的形状被做成了锁。",
      connections: ["rust_channel"],
      unlock: { type: "flag", flag: "ch2_rust_opened" }
    },
    lower_works: {
      name: "下水工坊",
      desc: "蒸汽管道嘶鸣。泵机像喘息，雾在金属里回声。",
      connections: ["rust_channel", "mist_well"],
      unlock: { type: "flag", flag: "ch2_rust_opened" }
    },
    mist_well: {
      name: "雾井",
      desc: "井口像一张没合拢的嘴。碎纸符贴着石沿。",
      connections: ["lower_works", "paper_atrium"],
      unlock: {
        type: "all",
        of: [
          { type: "flag", flag: "defeated_works_guardian" },
          { type: "item", item: "pump_key", qty: 1 }
        ]
      }
    },
    paper_atrium: {
      name: "纸符天井",
      desc: "井下空腔挂满旧符。风一吹，像有人在翻页。",
      connections: ["mist_well", "blacklight_heart"],
      unlock: {
        type: "all",
        of: [
          { type: "flag", flag: "defeated_works_guardian" },
          { type: "item", item: "pump_key", qty: 1 }
        ]
      }
    },
    blacklight_heart: {
      name: "黑光心室",
      desc: "齿轮还在转。黑光不是光，更像一阵冷。",
      connections: ["paper_atrium"],
      unlock: { type: "flag", flag: "ch3_imprint_done" }
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
    pump_key: { name: "泵钥", tags: ["tool", "rare"], desc: "一枚冰冷的钥，槽位像鸟居的影子。" },
    rust_scale: { name: "锈鳞", tags: ["material"], desc: "从锈水渠的东西身上剥下来的硬片，有铁味。" },
    gear_spring: { name: "齿轮弹簧", tags: ["material", "tech"], desc: "回弹仍有力的弹簧，做工像旧工坊。" },
    pump_rivet: { name: "泵铆钉", tags: ["material", "tech"], desc: "带鸟居槽的铆钉，拧紧时像在扣住某个门。" },
    oil_slick: { name: "油泥", tags: ["material"], desc: "黑亮的黏泥，摸上去很凉。" },
    fog_fiber: { name: "雾纤维", tags: ["material"], desc: "从雾里捻出的细丝，像湿冷的线。" },
    paper_ash: { name: "纸灰", tags: ["material"], desc: "碎符烧尽后的灰，仍有墨的气味。" },
    ink_resin: { name: "墨脂", tags: ["material", "rare"], desc: "像凝住的黑光，靠近时指尖会发麻。" },
    heart_coil: { name: "心室线圈", tags: ["material", "rare"], desc: "从主泵守体内拆出的线圈，冷得像一口井。" },
    rust_salve: { name: "锈膏", tags: ["medicine"], heal: 8, desc: "抹上去辣得发热，伤口却会很快收紧。" },
    paper_tonic: { name: "纸符补剂", tags: ["medicine", "rare"], heal: 10, desc: "喝下去像吞了一张纸，随后全身一轻。" },
    chain_snare: { name: "锁链索套", tags: ["consumable"], combat: { type: "stun", turns: 1 }, desc: "一甩便缠上，能让敌人动作一滞。" },
    shrapnel_charge: { name: "碎片雷", tags: ["consumable"], combat: { type: "explosive", damage: [8, 12] }, desc: "炸开时像一把碎铁雨。" },
    fogward_talisman: { name: "雾护符", tags: ["talisman"], combat: { type: "ward", turns: 2 }, desc: "雾在符面上聚成薄膜，替你挡下一些冲击。" },
    bitter_focus_tea: { name: "苦凝神茶", tags: ["consumable"], combat: { type: "focus", turns: 2 }, desc: "苦到发麻，但破绽会变得清晰。" },
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
    rust_sabre: {
      name: "锈刃",
      tags: ["weapon", "rare"],
      slot: "weapon",
      stats: { atk: 4 },
      combat: { allowsSkills: ["purify"] },
      desc: "锈色的刃口却很干净。握着它，你知道该往哪里斩。"
    },
    plate_armor: { name: "板甲", tags: ["armor"], slot: "armor", stats: { def: 3 }, desc: "厚实的铁甲，提供极高的防御。" },
    warding_robe: { name: "护法长袍", tags: ["armor", "magic"], slot: "armor", stats: { def: 2, maxMp: 2 }, desc: "轻便的长袍，编织了防护法术。" },
    fog_mask: {
      name: "雾面",
      tags: ["armor", "rare"],
      slot: "armor",
      stats: { def: 1, maxHp: 2 },
      desc: "布面上有细密的孔。呼吸穿过去时，雾像被筛了一遍。"
    },
    fogback_waystation_mail: {
      name: "驿站链甲",
      tags: ["armor", "rare"],
      slot: "armor",
      stats: { def: 2, maxHp: 2 },
      desc: "旧链甲上还残着杉烟味。穿上它，你的步子更稳。"
    },
    fogback_waystation_robe: {
      name: "驿站长袍",
      tags: ["armor", "magic", "rare"],
      slot: "armor",
      stats: { def: 1, maxMp: 3 },
      desc: "织纹里夹着碎符。法力像被拢进袖口。"
    },
    fogback_waystation_harness: {
      name: "驿站束具",
      tags: ["armor", "tech", "rare"],
      slot: "armor",
      stats: { def: 1, maxEn: 3 },
      desc: "皮带与齿轮扣件相连。扣紧后，你的呼吸更省。"
    },
    repeating_crossbow_mk2: {
      name: "连弩·改",
      tags: ["weapon", "tech", "rare"],
      slot: "weapon",
      stats: { atk: 4 },
      desc: "换了更顺的齿轮组，出手更稳。"
    },
    scrap_pistol_calibrated: {
      name: "废铁手枪·校",
      tags: ["weapon", "tech", "rare"],
      slot: "weapon",
      stats: { atk: 4 },
      desc: "校准后的枪机更干脆，回火也更小。"
    },
    runic_staff_etched: {
      name: "符文法杖·刻",
      tags: ["weapon", "magic", "rare"],
      slot: "weapon",
      stats: { atk: 1, maxMp: 7 },
      desc: "在旧符纹上再刻一圈，法力像有了回路。"
    },
    plate_armor_riveted: {
      name: "板甲·铆",
      tags: ["armor", "rare"],
      slot: "armor",
      stats: { def: 4 },
      desc: "用泵铆钉加固后的板甲，像一块能站住的墙。"
    },
    warding_robe_lined: {
      name: "护法长袍·衬",
      tags: ["armor", "magic", "rare"],
      slot: "armor",
      stats: { def: 2, maxMp: 3 },
      desc: "内衬更密，护法纹路不容易散。"
    },
    fogback_waystation_mail_reinforced: {
      name: "驿站链甲·固",
      tags: ["armor", "rare"],
      slot: "armor",
      stats: { def: 3, maxHp: 2 },
      desc: "在链环里加了泵铆钉，冲击不再那么刺骨。"
    },
    fogback_waystation_robe_inscribed: {
      name: "驿站长袍·铭",
      tags: ["armor", "magic", "rare"],
      slot: "armor",
      stats: { def: 1, maxMp: 4 },
      desc: "铭过的符边像锁口，让法力不那么漏。"
    },
    fogback_waystation_harness_overclocked: {
      name: "驿站束具·超",
      tags: ["armor", "tech", "rare"],
      slot: "armor",
      stats: { def: 1, maxEn: 4 },
      desc: "把扣件换成更紧的齿轮，能量像被拧出来。"
    },
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
    },

    // Chapter 2/3 consumables & materials
    brew_rust_salve: {
      name: "调配锈膏",
      inputs: { herbs: 2, rust_scale: 1 },
      outputs: { rust_salve: 1 },
      timeCostMin: 15,
      requirements: { flags: ["met_herbalist", "ch2_rust_opened"] }
    },
    brew_paper_tonic: {
      name: "调配纸符补剂",
      inputs: { mystic_herb: 1, paper_ash: 2 },
      outputs: { paper_tonic: 1 },
      timeCostMin: 20,
      requirements: { flags: ["met_herbalist", "defeated_works_guardian"] }
    },
    bind_chain_snare: {
      name: "制作锁链索套",
      inputs: { pump_rivet: 1, iron_ingot: 1 },
      outputs: { chain_snare: 1 },
      timeCostMin: 20,
      requirements: { flags: ["met_blacksmith", "ch2_rust_opened"] }
    },
    assemble_shrapnel_charge: {
      name: "组装碎片雷",
      inputs: { iron_ore: 1, gear_spring: 1 },
      outputs: { shrapnel_charge: 1 },
      timeCostMin: 20,
      requirements: { flags: ["met_blacksmith", "ch2_rust_opened"] }
    },
    enchant_fogward_talisman: {
      name: "附魔雾护符",
      inputs: { paper_charm: 1, fog_fiber: 2, herbs: 2 },
      outputs: { fogward_talisman: 1 },
      timeCostMin: 25,
      requirements: { flags: ["met_herbalist", "ch2_rust_opened"] }
    },
    craft_bitter_focus_tea: {
      name: "制作苦凝神茶",
      inputs: { herbs: 1, oil_slick: 1 },
      outputs: { bitter_focus_tea: 1 },
      timeCostMin: 15,
      requirements: { flags: ["met_herbalist", "ch2_rust_opened"] }
    },

    forge_rust_sabre: {
      name: "锻造锈刃",
      inputs: { iron_ingot: 1, rust_scale: 2, monster_fang: 1 },
      outputs: { rust_sabre: 1 },
      timeCostMin: 25,
      requirements: { flags: ["has_firepit", "met_blacksmith", "ch2_rust_opened"] }
    },
    stitch_fog_mask: {
      name: "缝制雾面",
      inputs: { fog_fiber: 3, paper_ash: 1, herbs: 1 },
      outputs: { fog_mask: 1 },
      timeCostMin: 20,
      requirements: { flags: ["has_firepit", "met_herbalist", "defeated_works_guardian"] }
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
      hp: 24,
      atk: 2,
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
      hp: 16,
      atk: 3,
      def: 1,
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
      traits: ["heavy_attack"],
      heavyAttack: {
        enabled: true,
        interval: 3,
        intervalEnraged: 2,
        chargedMult: 1.8,
        defendMult: 0.6,
        telegraphText: "它开始蓄力。",
        chargedText: "蓄力重击落下！",
        breakTurns: 2,
        breakMult: 1.5,
        breakText: "你打断了蓄力，金属关节露出破绽。",
        defendBreakText: "你顶住重击，它的动作露出破绽。"
      }
    },
    mine_warlord: {
      name: "矿脉督战者",
      hp: 36,
      atk: 5,
      def: 4,
      gold: 34,
      loot: { iron_ingot: 3, monster_fang: 2 },
      traits: ["curses", "heavy_attack"],
      heavyAttack: {
        enabled: true,
        interval: 3,
        intervalEnraged: 2,
        chargedMult: 1.8,
        defendMult: 0.6,
        telegraphText: "它开始蓄力。",
        chargedText: "蓄力重击落下！",
        breakTurns: 2,
        breakMult: 1.5,
        breakText: "你打断了蓄力，金属关节露出破绽。",
        defendBreakText: "你顶住重击，它的动作露出破绽。"
      }
    },

    // Chapter 2/3 (keep route)
    rust_leech: {
      name: "锈蚀水蛭",
      hp: 14,
      atk: 3,
      def: 1,
      gold: 10,
      loot: { rust_scale: 2, oil_slick: 1 }
    },
    lockyard_sentinel: {
      name: "锁场哨兵",
      hp: 18,
      atk: 4,
      def: 2,
      gold: 14,
      loot: { gear_spring: 1, pump_rivet: 1 },
      traits: ["heavy_attack"]
    },
    fog_skulker: {
      name: "雾潜客",
      hp: 16,
      atk: 3,
      def: 1,
      gold: 12,
      loot: { fog_fiber: 2 },
      traits: ["evasion"]
    },
    paper_swarm: {
      name: "纸屑群",
      hp: 12,
      atk: 3,
      def: 1,
      gold: 10,
      loot: { paper_ash: 2, paper_charm: 1 },
      traits: ["summon"]
    },
    steam_wretch: {
      name: "蒸汽残躯",
      hp: 20,
      atk: 4,
      def: 2,
      gold: 16,
      loot: { oil_slick: 2, scrap_metal: 2 },
      traits: ["heavy_attack"]
    },
    heart_needle: {
      name: "心针",
      hp: 18,
      atk: 4,
      def: 2,
      gold: 18,
      loot: { ink_resin: 1, spirit_stone: 1 },
      traits: ["curses"]
    },
    works_guardian: {
      name: "泵守",
      hp: 34,
      atk: 5,
      def: 3,
      gold: 30,
      loot: { pump_key: 1, spirit_stone: 1, pump_rivet: 2 },
      traits: ["heavy_attack"],
      heavyAttack: {
        enabled: true,
        interval: 3,
        intervalEnraged: 2,
        chargedMult: 1.8,
        defendMult: 0.6,
        telegraphText: "它开始蓄力。",
        chargedText: "蓄力重击落下！",
        breakTurns: 2,
        breakMult: 1.5,
        breakText: "你打断了蓄力，金属关节露出破绽。",
        defendBreakText: "你顶住重击，泵守的关节响了一声。"
      }
    },
    heart_pump_guardian: {
      name: "主泵守",
      hp: 48,
      atk: 6,
      def: 4,
      gold: 70,
      loot: { spirit_stone: 1, ink_resin: 1, heart_coil: 1 },
      traits: ["heavy_attack", "curses", "summon"],
      heavyAttack: {
        enabled: true,
        interval: 3,
        intervalEnraged: 2,
        chargedMult: 1.8,
        defendMult: 0.6,
        telegraphText: "它开始蓄力。",
        chargedText: "蓄力重击落下！",
        breakTurns: 2,
        breakMult: 1.5,
        breakText: "你打断了蓄力，主泵守的黑光一滞。",
        defendBreakText: "你顶住重击，黑光心室的节拍乱了一瞬。"
      }
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
      requirements: {
        flags: [
          "shrine_cleansed",
          "defeated_crystal_overseer",
          "defeated_clockwork_titan",
          "defeated_mine_warlord"
        ]
      },
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
              { op: "setFlag", flag: "ch2_route_opened" },
              { op: "log", text: "你没有把遗物封回鸟居之下。" },
              { op: "log", text: "山口的风更冷，雾却更黏。" },
              { op: "log", text: "遗物贴着胸口，像一枚沉默的铁心。" },
              { op: "advanceTime", min: 3 }
            ]
          }
        ]
      },
      ops: []
    },

    // --- Chapter 2/3 (keep route) ---

    ch2_waystation_intro: {
      at: "fogback_waystation",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["ch2_route_opened"] },
      text: [
        "翻过山口，路并没有开阔。",
        "雾在这里有铁味，像湿冷的锈。",
        "一盏孤灯后，是被遗忘的驿站。木梁带着杉烟，墙里却嵌着齿轮。",
        "有人盯着你怀里的那块东西：\"雾不是天灾，是被人放出来的。\""
      ],
      prompt: {
        title: "驿站",
        choices: [
          {
            id: "take_warrior_kit",
            label: "战士：收下链甲与旧法（学会：横扫）",
            requires: { flags: ["class_warrior"] },
            ops: [
              { op: "gainItem", item: "fogback_waystation_mail", qty: 1 },
              { op: "setFlag", flag: "skills_learned_sweep" },
              { op: "log", text: "你接过链甲。重量让你的肩膀更安静。" },
              { op: "advanceTime", min: 2 }
            ]
          },
          {
            id: "take_mage_kit",
            label: "法师：收下长袍与碎符（法力更盛）",
            requires: { flags: ["class_mage"] },
            ops: [
              { op: "gainItem", item: "fogback_waystation_robe", qty: 1 },
              { op: "log", text: "长袍的内衬贴着皮肤，像一层薄薄的符。" },
              { op: "advanceTime", min: 2 }
            ]
          },
          {
            id: "take_engineer_kit",
            label: "工程师：收下束具与扣件（能量更足）",
            requires: { flags: ["class_engineer"] },
            ops: [
              { op: "gainItem", item: "fogback_waystation_harness", qty: 1 },
              { op: "log", text: "你扣紧束具。齿轮扣件咬合得很轻。" },
              { op: "advanceTime", min: 2 }
            ]
          },
          {
            id: "leave",
            label: "先不拿（继续赶路）",
            ops: [{ op: "advanceTime", min: 1 }]
          }
        ]
      },
      ops: [
        { op: "setFlag", flag: "ch2_rust_opened" },
        { op: "advanceTime", min: 6 }
      ]
    },

    lockyard_chest: {
      at: "lockyard",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["暗箱嵌在铁门背面，缝里积着灰。"],
      prompt: {
        title: "暗箱",
        choices: [
          {
            id: "open_take",
            label: "撬开暗箱并取走（需要盗贼工具；会沾上不祥）",
            requires: { item: "thieves_tools", qty: 1 },
            ops: [
              { op: "gainItem", item: "repeating_crossbow", qty: 1 },
              { op: "setFlag", flag: "opened_lockyard_chest" },
              { op: "setFlag", flag: "cursed" },
              { op: "log", text: "你听见一声轻响，锁舌退回去。" },
              { op: "log", text: "箱里的灰像活物一样沾上你的指尖。" },
              { op: "advanceTime", min: 8 }
            ]
          },
          {
            id: "detour",
            label: "放过暗箱（不沾灰；绕路更久）",
            ops: [
              { op: "log", text: "你把手收回袖里。绕路会更久，但你还想保持干净。" },
              { op: "advanceTime", min: 15 }
            ]
          }
        ]
      },
      ops: []
    },

    // Chapter 2 roaming encounters
    rust_channel_leeches: {
      at: "rust_channel",
      w: 4,
      text: ["锈水渠边传来黏滑的声音。"],
      ops: [
        { op: "startCombat", enemy: "rust_leech" },
        { op: "advanceTime", min: 6 }
      ]
    },
    rust_channel_steam_wretch: {
      at: "rust_channel",
      w: 3,
      text: ["蒸汽在雾里咳嗽，一具残躯拖着管道走来。"],
      ops: [
        { op: "startCombat", enemy: "steam_wretch" },
        { op: "advanceTime", min: 6 }
      ]
    },
    rust_channel_scrape: {
      at: "rust_channel",
      w: 2,
      text: ["你从沟渠的铁锈里刮下一些硬片。"],
      ops: [
        { op: "gainItem", item: "rust_scale", qty: 1 },
        { op: "gainItem", item: "oil_slick", qty: 1 },
        { op: "advanceTime", min: 10 }
      ]
    },

    lockyard_patrol: {
      at: "lockyard",
      w: 4,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["铁门后传来规律的铆钉声。"],
      ops: [
        { op: "startCombat", enemy: "lockyard_sentinel" },
        { op: "advanceTime", min: 6 }
      ]
    },
    lockyard_fog_skulker: {
      at: "lockyard",
      w: 3,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["雾从锁缝里渗出，一个影子贴着地面滑来。"],
      ops: [
        { op: "startCombat", enemy: "fog_skulker" },
        { op: "advanceTime", min: 6 }
      ]
    },
    lockyard_salvage: {
      at: "lockyard",
      w: 2,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["你从废门轴里拆出一截弹簧。"],
      ops: [
        { op: "gainItem", item: "gear_spring", qty: 1 },
        { op: "gainItem", item: "pump_rivet", qty: 1 },
        { op: "advanceTime", min: 10 }
      ]
    },

    lower_works_guardian: {
      at: "lower_works",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["泵机的影子抬头。外壳是铁，关节却缠着纸。"],
      ops: [
        { op: "startCombat", enemy: "works_guardian" },
        { op: "advanceTime", min: 8 }
      ]
    },

    lower_works_paper_swarm: {
      at: "lower_works",
      w: 3,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["碎符纸贴着管道乱飞，像在找落点。"],
      ops: [
        { op: "startCombat", enemy: "paper_swarm" },
        { op: "advanceTime", min: 6 }
      ]
    },
    lower_works_heart_needle: {
      at: "lower_works",
      w: 2,
      requirements: { flags: ["ch2_rust_opened"] },
      text: ["一枚细长的黑影从雾里刺出。"],
      ops: [
        { op: "startCombat", enemy: "heart_needle" },
        { op: "advanceTime", min: 6 }
      ]
    },

    ch3_mist_well_intro: {
      at: "mist_well",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["雾不再飘，它像水一样贴着墙。井口边散着碎纸符。"],
      ops: [{ op: "advanceTime", min: 6 }]
    },

    // Chapter 3 roaming encounters
    mist_well_fog_skulker: {
      at: "mist_well",
      w: 3,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["井下的雾更黏，一个影子贴着墙走。"],
      ops: [
        { op: "startCombat", enemy: "fog_skulker" },
        { op: "advanceTime", min: 6 }
      ]
    },

    paper_atrium_imprint: {
      at: "paper_atrium",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["符纸在风里轻响。你的手心发热，像握着一块冷铁。"],
      prompt: {
        title: "刻印",
        choices: [
          {
            id: "imprint_stealth",
            label: "藏进雾里（学会：隐身）",
            requires: { item: "spirit_stone", qty: 1 },
            ops: [
              { op: "loseItem", item: "spirit_stone", qty: 1 },
              { op: "setFlag", flag: "skills_learned_stealth" },
              { op: "setFlag", flag: "ch3_imprint_done" },
              { op: "log", text: "雾贴上你的皮肤，你学会让自己变轻。" },
              { op: "advanceTime", min: 10 }
            ]
          },
          {
            id: "imprint_counter",
            label: "站住反打（学会：反击）",
            requires: { item: "spirit_stone", qty: 1 },
            ops: [
              { op: "loseItem", item: "spirit_stone", qty: 1 },
              { op: "setFlag", flag: "skills_learned_counter" },
              { op: "setFlag", flag: "ch3_imprint_done" },
              { op: "log", text: "你把重心放低。雾像一面盾，回声在你骨头里响。" },
              { op: "advanceTime", min: 10 }
            ]
          }
        ]
      },
      ops: []
    },

    paper_atrium_paper_swarm: {
      at: "paper_atrium",
      w: 3,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["符纸像群鸟一样扑来。"],
      ops: [
        { op: "startCombat", enemy: "paper_swarm" },
        { op: "advanceTime", min: 6 }
      ]
    },
    paper_atrium_heart_needle: {
      at: "paper_atrium",
      w: 2,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["黑影从符纸之间穿过，像一根针。"],
      ops: [
        { op: "startCombat", enemy: "heart_needle" },
        { op: "advanceTime", min: 6 }
      ]
    },
    paper_atrium_collect: {
      at: "paper_atrium",
      w: 2,
      requirements: { flags: ["defeated_works_guardian"] },
      text: ["你捡起一撮纸灰，指尖沾上墨。"],
      ops: [
        { op: "gainItem", item: "paper_ash", qty: 1 },
        { op: "gainItem", item: "ink_resin", qty: 1 },
        { op: "advanceTime", min: 10 }
      ]
    },

    blacklight_heart_boss: {
      at: "blacklight_heart",
      w: 0,
      once: true,
      priority: 10,
      requirements: { flags: ["ch3_imprint_done"] },
      text: ["齿轮咬合的声音更近。黑光像冷，贴着你的牙。"],
      prompt: {
        title: "心室",
        choices: [
          {
            id: "prep_warrior",
            label: "战士：稳住呼吸（带上护身符再上）",
            requires: { flags: ["class_warrior"] },
            ops: [
              { op: "gainItem", item: "warding_talisman", qty: 1 },
              { op: "log", text: "你把护身符贴在胸口。铁味更重，但你不退。" },
              { op: "advanceTime", min: 2 },
              { op: "startCombat", enemy: "heart_pump_guardian" }
            ]
          },
          {
            id: "prep_mage",
            label: "法师：压住心跳（喝一口凝神茶）",
            requires: { flags: ["class_mage"] },
            ops: [
              { op: "gainItem", item: "focus_tea", qty: 1 },
              { op: "log", text: "茶香压过了一瞬冷意。你的视线变得更锋利。" },
              { op: "advanceTime", min: 2 },
              { op: "startCombat", enemy: "heart_pump_guardian" }
            ]
          },
          {
            id: "prep_engineer",
            label: "工程师：先设一手（放好爆炸陷阱）",
            requires: { flags: ["class_engineer"] },
            ops: [
              { op: "gainItem", item: "explosive_trap", qty: 1 },
              { op: "log", text: "你把引信藏进雾里。只等它迈进那一步。" },
              { op: "advanceTime", min: 2 },
              { op: "startCombat", enemy: "heart_pump_guardian" }
            ]
          },
          {
            id: "charge",
            label: "直接上前",
            ops: [
              { op: "advanceTime", min: 1 },
              { op: "startCombat", enemy: "heart_pump_guardian" }
            ]
          }
        ]
      },
      ops: [{ op: "advanceTime", min: 2 }]
    },

    ch3_ending: {
      at: "blacklight_heart",
      w: 0,
      once: true,
      priority: 9,
      requirements: { flags: ["defeated_heart_pump_guardian"] },
      text: ["你听见某个锁扣声在更深处合上。"],
      prompt: {
        title: "黑光",
        choices: [
          {
            id: "reset",
            label: "复位（把遗物嵌回槽位）",
            ops: [
              { op: "setFlag", flag: "ending_ch3_reset" },
              { op: "endGame" }
            ]
          },
          {
            id: "bind",
            label: "绑住（用灵石刻印在身上）",
            requires: { item: "spirit_stone", qty: 1 },
            ops: [
              { op: "loseItem", item: "spirit_stone", qty: 1 },
              { op: "setFlag", flag: "ending_ch3_bind" },
              { op: "endGame" }
            ]
          },
          {
            id: "smash",
            label: "砸碎（把遗物砸在铁板上）",
            ops: [
              { op: "setFlag", flag: "ending_ch3_smash" },
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
          upgrade_repeating_crossbow: {
            name: "升级连弩",
            requires: { items: { repeating_crossbow: 1, gear_spring: 2, pump_rivet: 1 } },
            gives: { item: "repeating_crossbow_mk2", qty: 1 },
            cost: 12,
            description: "更稳的齿轮组，降低出手波动"
          },
          upgrade_scrap_pistol: {
            name: "校准手枪",
            requires: { items: { scrap_pistol: 1, gear_spring: 2, oil_slick: 1 } },
            gives: { item: "scrap_pistol_calibrated", qty: 1 },
            cost: 10
          },
          upgrade_runic_staff: {
            name: "刻符法杖",
            requires: { items: { runic_staff: 1, mana_crystal: 2, ink_resin: 1 } },
            gives: { item: "runic_staff_etched", qty: 1 },
            cost: 10
          },
          upgrade_plate_armor: {
            name: "加固板甲",
            requires: { items: { plate_armor: 1, pump_rivet: 2, iron_ingot: 1 } },
            gives: { item: "plate_armor_riveted", qty: 1 },
            cost: 10
          },
          upgrade_warding_robe: {
            name: "衬里长袍",
            requires: { items: { warding_robe: 1, paper_ash: 2, spirit_stone: 1 } },
            gives: { item: "warding_robe_lined", qty: 1 },
            cost: 10
          },
          upgrade_fogback_mail: {
            name: "加固驿站链甲",
            requires: { items: { fogback_waystation_mail: 1, pump_rivet: 1, iron_ingot: 1 } },
            gives: { item: "fogback_waystation_mail_reinforced", qty: 1 },
            cost: 8
          },
          upgrade_fogback_robe: {
            name: "铭刻驿站长袍",
            requires: { items: { fogback_waystation_robe: 1, ink_resin: 1, mana_crystal: 1 } },
            gives: { item: "fogback_waystation_robe_inscribed", qty: 1 },
            cost: 8
          },
          upgrade_fogback_harness: {
            name: "超频驿站束具",
            requires: { items: { fogback_waystation_harness: 1, gear_spring: 2, scrap_metal: 2 } },
            gives: { item: "fogback_waystation_harness_overclocked", qty: 1 },
            cost: 8
          },

          // Skill upgrades (tiers)
          upgrade_skill_purify_t1: {
            name: "精修破邪斩 I",
            requires: { flags: ["skills_learned_purify", "defeated_works_guardian"], items: { spirit_stone: 1, pump_rivet: 1 } },
            gives: { skillUpgrade: { skill: "purify", toTier: 1 } },
            cost: 12
          },
          upgrade_skill_purify_t2: {
            name: "精修破邪斩 II",
            requires: { flags: ["skills_learned_purify", "skill_upgraded_purify_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, spirit_stone: 1 } },
            gives: { skillUpgrade: { skill: "purify", toTier: 2 } },
            cost: 15
          },
          upgrade_skill_sweep_t1: {
            name: "打磨横扫 I",
            requires: { flags: ["skills_learned_sweep", "defeated_works_guardian"], items: { iron_ingot: 1, monster_fang: 1 } },
            gives: { skillUpgrade: { skill: "sweep", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_sweep_t2: {
            name: "打磨横扫 II",
            requires: { flags: ["skills_learned_sweep", "skill_upgraded_sweep_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, iron_ingot: 1 } },
            gives: { skillUpgrade: { skill: "sweep", toTier: 2 } },
            cost: 12
          },
          upgrade_skill_fireball_t1: {
            name: "淬炼火球术 I",
            requires: { flags: ["skills_learned_fireball", "defeated_works_guardian"], items: { mana_crystal: 2, ink_resin: 1 } },
            gives: { skillUpgrade: { skill: "fireball", toTier: 1 } },
            cost: 12
          },
          upgrade_skill_fireball_t2: {
            name: "淬炼火球术 II",
            requires: { flags: ["skills_learned_fireball", "skill_upgraded_fireball_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, mana_crystal: 2 } },
            gives: { skillUpgrade: { skill: "fireball", toTier: 2 } },
            cost: 15
          },
          upgrade_skill_heal_light_t1: {
            name: "稳固微光治愈 I",
            requires: { flags: ["skills_learned_heal_light", "defeated_works_guardian"], items: { mystic_herb: 1, paper_ash: 2 } },
            gives: { skillUpgrade: { skill: "heal_light", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_heal_light_t2: {
            name: "稳固微光治愈 II",
            requires: { flags: ["skills_learned_heal_light", "skill_upgraded_heal_light_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, mystic_herb: 1 } },
            gives: { skillUpgrade: { skill: "heal_light", toTier: 2 } },
            cost: 12
          },
          upgrade_skill_mana_shield_t1: {
            name: "加厚魔法盾 I",
            requires: { flags: ["skills_learned_mana_shield", "defeated_works_guardian"], items: { mana_crystal: 2, spirit_stone: 1 } },
            gives: { skillUpgrade: { skill: "mana_shield", toTier: 1 } },
            cost: 12
          },
          upgrade_skill_mana_shield_t2: {
            name: "加厚魔法盾 II",
            requires: { flags: ["skills_learned_mana_shield", "skill_upgraded_mana_shield_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, spirit_stone: 1 } },
            gives: { skillUpgrade: { skill: "mana_shield", toTier: 2 } },
            cost: 15
          },
          upgrade_skill_stealth_t1: {
            name: "磨亮隐身 I",
            requires: { flags: ["skills_learned_stealth", "defeated_works_guardian"], items: { fog_fiber: 3, ink_resin: 1 } },
            gives: { skillUpgrade: { skill: "stealth", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_stealth_t2: {
            name: "磨亮隐身 II",
            requires: { flags: ["skills_learned_stealth", "skill_upgraded_stealth_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, fog_fiber: 3 } },
            gives: { skillUpgrade: { skill: "stealth", toTier: 2 } },
            cost: 12
          },
          upgrade_skill_power_strike_t1: {
            name: "重铸强力击 I",
            requires: { flags: ["skills_learned_power_strike", "defeated_works_guardian"], items: { iron_ingot: 1, pump_rivet: 1 } },
            gives: { skillUpgrade: { skill: "power_strike", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_power_strike_t2: {
            name: "重铸强力击 II",
            requires: { flags: ["skills_learned_power_strike", "skill_upgraded_power_strike_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, iron_ingot: 1 } },
            gives: { skillUpgrade: { skill: "power_strike", toTier: 2 } },
            cost: 12
          },
          upgrade_skill_deploy_turret_t1: {
            name: "校准炮塔 I",
            requires: { flags: ["skills_learned_deploy_turret", "defeated_works_guardian"], items: { gear_spring: 2, scrap_metal: 2 } },
            gives: { skillUpgrade: { skill: "deploy_turret", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_deploy_turret_t2: {
            name: "校准炮塔 II",
            requires: { flags: ["skills_learned_deploy_turret", "skill_upgraded_deploy_turret_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, gear_spring: 2 } },
            gives: { skillUpgrade: { skill: "deploy_turret", toTier: 2 } },
            cost: 12
          },
          upgrade_skill_shock_swarm_t1: {
            name: "调频蜂群 I",
            requires: { flags: ["skills_learned_shock_swarm", "defeated_works_guardian"], items: { gear_spring: 2, oil_slick: 1 } },
            gives: { skillUpgrade: { skill: "shock_swarm", toTier: 1 } },
            cost: 10
          },
          upgrade_skill_shock_swarm_t2: {
            name: "调频蜂群 II",
            requires: { flags: ["skills_learned_shock_swarm", "skill_upgraded_shock_swarm_t1", "defeated_heart_pump_guardian"], items: { heart_coil: 1, gear_spring: 2 } },
            gives: { skillUpgrade: { skill: "shock_swarm", toTier: 2 } },
            cost: 12
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
  },

  skillUpgrades: {
    purify: {
      maxTier: 2,
      tiers: {
        1: { dmgBase: 2 },
        2: { dmgBase: 2 }
      }
    },
    sweep: {
      maxTier: 2,
      tiers: {
        1: { damage_percent: 10 },
        2: { damage_percent: 10 }
      }
    },
    heal_light: {
      maxTier: 2,
      tiers: {
        1: { heal_amount: 5 },
        2: { heal_amount: 5 }
      }
    },
    stealth: {
      maxTier: 2,
      tiers: {
        1: { evadeChance: 0.05 },
        2: { evadeChance: 0.05 }
      }
    },
    power_strike: {
      maxTier: 2,
      tiers: {
        1: { mult: 0.2 },
        2: { mult: 0.2 }
      }
    },
    fireball: {
      maxTier: 2,
      tiers: {
        1: { mp_scale: 0.1 },
        2: { base_damage: 1 }
      }
    },
    mana_shield: {
      maxTier: 2,
      tiers: {
        1: { shield_ratio: 0.05 },
        2: { shield_ratio: 0.05 }
      }
    },
    deploy_turret: {
      maxTier: 2,
      tiers: {
        1: { atk_scale: 0.05 },
        2: { duration: 1 }
      }
    },
    shock_swarm: {
      maxTier: 2,
      tiers: {
        1: { atk_scale: 0.04 },
        2: { duration: 1 }
      }
    }
  }
};

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
      connections: ["village", "old_shrine"],
      unlock: { type: "time", afterMin: 30 }
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
    iron_blade: { name: "铁刃", tags: ["weapon"], desc: "锋利的铁剑，斩妖除魔。" },
    shrine_relic: { name: "神社遗物", tags: ["relic"], desc: "古老的神社遗物，散发着微弱的光。" },
    iron_ingot: { name: "铁锭", tags: ["material", "rare"], desc: "精炼的铁块，锻造高级装备的材料。" },
    mystic_herb: { name: "神秘草药", tags: ["medicine", "rare"], heal: 8, desc: "稀有的草药，蕴含着强大的生命力。" },
    monster_fang: { name: "兽牙", tags: ["material", "rare"], desc: "野兽的尖牙，锐利无比。" },
    spirit_stone: { name: "灵石", tags: ["material", "rare"], combat: { type: "skill_boost" }, desc: "充满灵气的石头，能强化技能。" },
    health_potion: { name: "生命药水", tags: ["medicine"], heal: 12, desc: "红色的药水，迅速恢复生命。" },
    focus_tea: { name: "凝神茶", tags: ["consumable"], combat: { type: "focus", turns: 2 }, desc: "清爽的茶，能让人集中精神。" },
    explosive_trap: { name: "爆炸陷阱", tags: ["consumable"], combat: { type: "explosive", damage: [8, 12] }, desc: "简易的陷阱，威力惊人。" },
    warding_talisman: { name: "护身符", tags: ["talisman"], combat: { type: "ward", turns: 2 }, desc: "护身的符咒，能减少受到的伤害。" },
    thieves_tools: { name: "盗贼工具", tags: ["tool"], desc: "一套精致的工具，也许能打开什么。" },
    master_blade: { name: "神刃", tags: ["weapon", "rare"], desc: "传说中的神刃，无坚不摧。" }
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
      effects: { setFlag: "has_iron_blade", stats: { atk: 2 } },
      requirements: { flags: ["has_firepit"] },
      hiddenIf: { flags: ["has_iron_blade"] }
    },
    forge_master_blade: {
      name: "锻神刃",
      inputs: { iron_ingot: 3, monster_fang: 2, spirit_stone: 1 },
      outputs: { master_blade: 1 },
      timeCostMin: 45,
      effects: { setFlag: "has_master_blade", stats: { atk: 5 } },
      requirements: { flags: ["has_iron_blade", "met_blacksmith"] },
      hiddenIf: { flags: ["has_master_blade"] }
    },
    brew_health_potion: {
      name: "调配生命药水",
      inputs: { mystic_herb: 2, herbs: 3 },
      outputs: { health_potion: 2 },
      timeCostMin: 20,
      requirements: { flags: ["met_herbalist"] }
    },
    craft_focus_tea: {
      name: "制作凝神茶",
      inputs: { mystic_herb: 1, herbs: 1 },
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
      inputs: { paper_charm: 2, spirit_stone: 1, herbs: 2 },
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
    cursed_miner: {
      name: "被诅咒的矿工",
      hp: 28,
      atk: 5,
      def: 3,
      gold: 18,
      loot: { iron_ingot: 2, spirit_stone: 1 },
      traits: ["curses", "heavy_attack"]
    },
    possessed_tree: {
      name: "被附身的树",
      hp: 35,
      atk: 4,
      def: 4,
      gold: 15,
      loot: { mystic_herb: 3, cedar_wood: 5 },
      traits: ["summon", "high_def"]
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
              { op: "startCombat", enemy: "bandit" }
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
      once: true,
      priority: 4,
      requirements: { gold: 2, flags: ["has_firepit"] },
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
            id: "leave",
            label: "摇摇头离开",
            ops: [{ op: "advanceTime", min: 5 }]
          }
        ]
      },
      ops: []
    }
    ,

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
            ops: [{ op: "advanceTime", min: 1 }]
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
              { op: "startQuest", quest: "elder_wisdom" },
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
      ops: []
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
              { op: "startQuest", quest: "blacksmith_mastery" },
              { op: "setFlag", flag: "met_blacksmith" },
              { op: "setFlag", flag: "skills_learned_focus" },
              { op: "setFlag", flag: "skills_learned_purify" },
              { op: "log", text: "铁匠教你凝神技巧：\"集中精神，能看破敌人的弱点。\"" },
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
      ops: []
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
              { op: "startQuest", quest: "herbalist_collection" },
              { op: "setFlag", flag: "met_herbalist" },
              { op: "setFlag", flag: "skills_learned_heal_light" },
              { op: "log", text: "草药师分享知识：\"植物有灵性，用心倾听，它们会回应。\"" },
              { op: "log", text: "你学会了微光治愈：用内在之力修补外在伤痕。\"" },
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
      ops: []
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
            label: "购买稀有物品",
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
            id: "ask_fate",
            label: "询问命运",
            ops: [
              { op: "startQuest", quest: "wanderer_mystery" },
              { op: "gainItem", item: "thieves_tools", qty: 1 },
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
      ops: []
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
            gives: { master_blade: 1 },
            cost: 10
          },
          teach_focus: {
            name: "教授凝神技能",
            requires: { flags: ["has_iron_blade"] },
            gives: { skill: "focus" },
            cost: 0
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
            gives: { mystic_herb: 1 },
            cost: 3
          },
          teach_heal: {
            name: "教授治愈技能",
            requires: { flags: ["met_herbalist"] },
            gives: { skill: "heal_light" },
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
        { type: "collect", item: "mystic_herb", qty: 3, description: "采集3株神秘草药" }
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
      description: "提升下次攻击的暴击率",
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
    }
  }
};

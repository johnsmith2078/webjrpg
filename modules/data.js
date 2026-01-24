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
    rice: { name: "米", tags: ["food"] },
    onigiri: { name: "饭团", tags: ["food"], heal: 6 },
    cedar_wood: { name: "杉木", tags: ["material"] },
    iron_ore: { name: "铁矿石", tags: ["ore"] },
    herbs: { name: "苦草", tags: ["medicine"], heal: 4 },
    paper_charm: { name: "纸符", tags: ["talisman"] },
    bound_charm: { name: "缚符", tags: ["talisman"], combat: { type: "stun", turns: 1 } },
    iron_blade: { name: "铁刃", tags: ["weapon"] },
    shrine_relic: { name: "神社遗物", tags: ["relic"] }
  },

  recipes: {
    make_firepit: {
      name: "石火坑",
      inputs: { cedar_wood: 5 },
      outputs: {},
      timeCostMin: 20,
      effects: { setFlag: "has_firepit" }
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
      requirements: { flags: ["has_firepit"] }
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
    }
  }
};

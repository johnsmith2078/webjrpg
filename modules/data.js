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
    paper_charm: { name: "纸符", tags: ["talisman"] }
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
      outputs: { paper_charm: 1 },
      timeCostMin: 15,
      effects: { setFlag: "charm_bound" },
      requirements: { flags: ["has_firepit"] }
    },
    forge_iron_blade: {
      name: "锻铁刃",
      inputs: { iron_ore: 2, cedar_wood: 2 },
      outputs: {},
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
      loot: { onigiri: 2 }
    }
  },

  events: {
    village_rumor: {
      at: "village",
      w: 2,
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
    shrine_guardian: {
      at: "old_shrine",
      w: 1,
      requirements: { flags: ["charm_bound", "has_iron_blade"] },
      text: ["地面震动。石与祈愿凝成的守护者踏前一步。"],
      ops: [
        { op: "startCombat", enemy: "shrine_guardian" },
        { op: "advanceTime", min: 5 }
      ]
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
      requirements: { flags: ["shrine_cleansed"] },
      text: ["山口处，雾终于断开。", "大山像是松了口气。", "山下某处，铃声回应。"],
      ops: [{ op: "endGame" }]
    }
  }
};

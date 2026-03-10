// ══════════════════════════════════════════════════════════════

export const TARGETS = {
  commission_pct: { max: 30, label: "Commission",  unit: "%" },
  discount_pct:   { max: 30, label: "Discount",    unit: "%" },
  ads_pct:        { max: 10, label: "Ads Spend",   unit: "%" },
  net_margin:     { min: 60, label: "Net Payout",  unit: "%" },
};

export const BRANDS_META = {
  TOP: { full: "Taste of Protein", color: "#818CF8" },
  FB:  { full: "FytBlend",         color: "#FCD34D" },
  FI:  { full: "Foldit",           color: "#6EE7B7" },
};

export const LOCS = {
  HSR: "HSR Layout", MTH: "Marathahalli", BTM: "BTM Layout", IND: "Indiranagar"
};

export const SWIGGY_WEEKS = [
  // W1 · 01-Feb-2026
  { brand:"TOP", loc:"HSR", week:"01-Feb", gmv:67998,  ns:53005.49, np:27328.49, comm:14408.44, disc:14992.51, ads:6206.74, orders:168 },
  { brand:"TOP", loc:"MTH", week:"01-Feb", gmv:44023,  ns:33749.95, np:19477.90, comm:7796.37,  disc:10273.05, ads:3589.26, orders:129 },
  { brand:"TOP", loc:"BTM", week:"01-Feb", gmv:16269,  ns:12467.32, np:6552.32,  comm:2880.01,  disc:3801.68,  ads:2032.37, orders:37  },
  { brand:"TOP", loc:"IND", week:"01-Feb", gmv:873,    ns:793.00,   np:-205.29,  comm:199.84,   disc:80.00,    ads:742.04,  orders:3   },
  { brand:"FB",  loc:"HSR", week:"01-Feb", gmv:4656,   ns:3122.02,  np:1414.61,  comm:786.75,   disc:1533.98,  ads:653.72,  orders:10  },
  { brand:"FB",  loc:"MTH", week:"01-Feb", gmv:6877,   ns:5025.01,  np:2657.39,  comm:1160.76,  disc:1851.99,  ads:783.52,  orders:18  },
  { brand:"FB",  loc:"BTM", week:"01-Feb", gmv:3669,   ns:2769.01,  np:-3760.94, comm:639.64,   disc:899.99,   ads:2900.32, orders:9   },
  { brand:"FB",  loc:"IND", week:"01-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"HSR", week:"01-Feb", gmv:1097,   ns:742.30,   np:395.62,   comm:163.31,   disc:354.70,   ads:119.18,  orders:5   },
  { brand:"FI",  loc:"MTH", week:"01-Feb", gmv:2166,   ns:1506.00,  np:930.49,   comm:331.32,   disc:660.00,   ads:119.18,  orders:7   },
  { brand:"FI",  loc:"BTM", week:"01-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"01-Feb", gmv:405,    ns:405.00,   np:-369.80,  comm:102.06,   disc:0,        ads:0,       orders:1   },
  // W2 · 08-Feb-2026
  { brand:"TOP", loc:"HSR", week:"08-Feb", gmv:85612,  ns:68771.08, np:34940.70, comm:18698.75, disc:16840.92, ads:9909.93, orders:209 },
  { brand:"TOP", loc:"MTH", week:"08-Feb", gmv:64616,  ns:48350.30, np:28025.74, comm:11169.07, disc:16265.70, ads:4680.76, orders:171 },
  { brand:"TOP", loc:"BTM", week:"08-Feb", gmv:15232,  ns:12176.40, np:5544.90,  comm:2653.87,  disc:3055.60,  ads:2637.00, orders:36  },
  { brand:"TOP", loc:"IND", week:"08-Feb", gmv:1720,   ns:1371.30,  np:-1755.17, comm:345.57,   disc:348.70,   ads:2683.34, orders:5   },
  { brand:"FB",  loc:"HSR", week:"08-Feb", gmv:10530,  ns:7690.01,  np:3999.68,  comm:1937.91,  disc:2839.99,  ads:1081.47, orders:27  },
  { brand:"FB",  loc:"MTH", week:"08-Feb", gmv:6867,   ns:5045.85,  np:2022.41,  comm:1165.59,  disc:1821.15,  ads:1403.02, orders:18  },
  { brand:"FB",  loc:"BTM", week:"08-Feb", gmv:1106,   ns:650.00,   np:-4123.20, comm:150.14,   disc:456.00,   ads:1801.51, orders:4   },
  { brand:"FB",  loc:"IND", week:"08-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"HSR", week:"08-Feb", gmv:3578,   ns:2478.54,  np:1447.87,  comm:545.27,   disc:1099.46,  ads:281.43,  orders:10  },
  { brand:"FI",  loc:"MTH", week:"08-Feb", gmv:3286,   ns:2153.02,  np:926.42,   comm:473.66,   disc:1132.98,  ads:281.43,  orders:11  },
  { brand:"FI",  loc:"BTM", week:"08-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"08-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  // W3 · 15-Feb-2026
  { brand:"TOP", loc:"HSR", week:"15-Feb", gmv:61882,  ns:58769.00, np:32356.73, comm:16044.03, disc:3113.00,  ads:5779.93, orders:153 },
  { brand:"TOP", loc:"MTH", week:"15-Feb", gmv:66876,  ns:51772.45, np:32517.63, comm:11959.57, disc:15103.55, ads:2866.51, orders:180 },
  { brand:"TOP", loc:"BTM", week:"15-Feb", gmv:20802,  ns:16039.48, np:8544.83,  comm:3629.44,  disc:4762.52,  ads:2367.96, orders:56  },
  { brand:"TOP", loc:"IND", week:"15-Feb", gmv:8451,   ns:7064.43,  np:1070.37,  comm:1780.25,  disc:1386.57,  ads:3668.23, orders:15  },
  { brand:"FB",  loc:"HSR", week:"15-Feb", gmv:10814,  ns:8026.01,  np:4354.56,  comm:2022.59,  disc:2787.99,  ads:963.47,  orders:29  },
  { brand:"FB",  loc:"MTH", week:"15-Feb", gmv:6386,   ns:4950.04,  np:2501.40,  comm:1143.47,  disc:1435.96,  ads:889.72,  orders:14  },
  { brand:"FB",  loc:"BTM", week:"15-Feb", gmv:2307,   ns:1478.00,  np:-3567.02, comm:341.41,   disc:829.00,   ads:1823.91, orders:5   },
  { brand:"FB",  loc:"IND", week:"15-Feb", gmv:589,    ns:549.01,   np:371.60,   comm:138.35,   disc:39.99,    ads:0,       orders:1   },
  { brand:"FI",  loc:"HSR", week:"15-Feb", gmv:4939,   ns:3679.57,  np:2333.55,  comm:809.50,   disc:1259.43,  ads:148.68,  orders:12  },
  { brand:"FI",  loc:"MTH", week:"15-Feb", gmv:1366,   ns:867.01,   np:449.49,   comm:190.74,   disc:498.99,   ads:148.68,  orders:5   },
  { brand:"FI",  loc:"BTM", week:"15-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"15-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  // W4 · 22-Feb-2026
  { brand:"TOP", loc:"HSR", week:"22-Feb", gmv:50802,  ns:47909.70, np:27206.54, comm:13049.60, disc:2892.30,  ads:3950.93, orders:119 },
  { brand:"TOP", loc:"MTH", week:"22-Feb", gmv:65937,  ns:50571.95, np:31579.47, comm:11682.32, disc:15365.05, ads:2969.76, orders:189 },
  { brand:"TOP", loc:"BTM", week:"22-Feb", gmv:24685,  ns:18688.80, np:11593.35, comm:4317.20,  disc:5996.20,  ads:1192.68, orders:71  },
  { brand:"TOP", loc:"IND", week:"22-Feb", gmv:4433,   ns:3948.41,  np:1934.74,  comm:995.01,   disc:484.59,   ads:737.79,  orders:10  },
  { brand:"FB",  loc:"HSR", week:"22-Feb", gmv:14553,  ns:10785.64, np:6707.87,  comm:2718.00,  disc:3767.36,  ads:447.22,  orders:37  },
  { brand:"FB",  loc:"MTH", week:"22-Feb", gmv:5368,   ns:3966.01,  np:2205.76,  comm:916.14,   disc:1401.99,  ads:500.32,  orders:14  },
  { brand:"FB",  loc:"BTM", week:"22-Feb", gmv:3548,   ns:2554.51,  np:-1969.97, comm:590.11,   disc:993.49,   ads:970.37,  orders:8   },
  { brand:"FB",  loc:"IND", week:"22-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"HSR", week:"22-Feb", gmv:2251,   ns:1771.03,  np:1216.98,  comm:389.62,   disc:479.97,   ads:30.68,   orders:4   },
  { brand:"FI",  loc:"MTH", week:"22-Feb", gmv:1815,   ns:1335.02,  np:919.63,   comm:293.70,   disc:479.98,   ads:15.93,   orders:4   },
  { brand:"FI",  loc:"BTM", week:"22-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"22-Feb", gmv:259,    ns:259.00,   np:-194.51,  comm:65.27,    disc:0,        ads:0,       orders:1   },
];

export const ZOMATO_WEEKS = [
  // W1
  { brand:"TOP", loc:"HSR", week:"01-Feb", gmv:77203,  ns:61615.98, np:42336.02, comm:13555.45, disc:15587.02, ads:1709.82, orders:186 },
  { brand:"TOP", loc:"MTH", week:"01-Feb", gmv:27404,  ns:20359.80, np:14498.11, comm:4479.16,  disc:7044.20,  ads:0,       orders:83  },
  { brand:"TOP", loc:"BTM", week:"01-Feb", gmv:15071,  ns:12005.20, np:12605.46, comm:1680.74,  disc:3065.80,  ads:434.24,  orders:46  },
  { brand:"TOP", loc:"IND", week:"01-Feb", gmv:5655,   ns:4927.80,  np:5174.19,  comm:0,        disc:727.20,   ads:0,       orders:16  },
  { brand:"FB",  loc:"HSR", week:"01-Feb", gmv:9677,   ns:6984.50,  np:5005.15,  comm:1536.59,  disc:2692.50,  ads:830.13,  orders:24  },
  { brand:"FB",  loc:"MTH", week:"01-Feb", gmv:2446,   ns:1795.00,  np:1286.33,  comm:394.90,   disc:651.00,   ads:0,       orders:6   },
  { brand:"FB",  loc:"BTM", week:"01-Feb", gmv:947,    ns:747.00,   np:784.35,   comm:104.58,   disc:200.00,   ads:0,       orders:2   },
  { brand:"FB",  loc:"IND", week:"01-Feb", gmv:1670,   ns:1670.00,  np:1752.50,  comm:0,        disc:0,        ads:0,       orders:4   },
  { brand:"FI",  loc:"HSR", week:"01-Feb", gmv:7736,   ns:5484.80,  np:5759.05,  comm:0,        disc:2251.20,  ads:0,       orders:22  },
  { brand:"FI",  loc:"MTH", week:"01-Feb", gmv:6040,   ns:4468.90,  np:4692.35,  comm:0,        disc:1571.10,  ads:0,       orders:18  },
  { brand:"FI",  loc:"BTM", week:"01-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"01-Feb", gmv:2860,   ns:2860.00,  np:3003.00,  comm:0,        disc:0,        ads:0,       orders:9   },
  // W2
  { brand:"TOP", loc:"HSR", week:"08-Feb", gmv:72476,  ns:57153.50, np:37315.71, comm:12573.77, disc:15322.50, ads:3000.10, orders:183 },
  { brand:"TOP", loc:"MTH", week:"08-Feb", gmv:39108,  ns:29451.00, np:20873.75, comm:6407.04,  disc:9657.00,  ads:804.76,  orders:110 },
  { brand:"TOP", loc:"BTM", week:"08-Feb", gmv:22825,  ns:16487.60, np:17311.98, comm:2308.27,  disc:6337.40,  ads:804.76,  orders:63  },
  { brand:"TOP", loc:"IND", week:"08-Feb", gmv:6665,   ns:5207.40,  np:5467.77,  comm:0,        disc:1457.60,  ads:238.28,  orders:22  },
  { brand:"FB",  loc:"HSR", week:"08-Feb", gmv:8051,   ns:5830.60,  np:4178.21,  comm:1282.73,  disc:2220.40,  ads:1497.02, orders:23  },
  { brand:"FB",  loc:"MTH", week:"08-Feb", gmv:3957,   ns:3417.50,  np:2327.86,  comm:688.27,   disc:539.50,   ads:377.60,  orders:9   },
  { brand:"FB",  loc:"BTM", week:"08-Feb", gmv:254,    ns:154.00,   np:161.70,   comm:21.56,    disc:100.00,   ads:0,       orders:1   },
  { brand:"FB",  loc:"IND", week:"08-Feb", gmv:2028,   ns:2028.00,  np:2128.90,  comm:0,        disc:0,        ads:361.08,  orders:5   },
  { brand:"FI",  loc:"HSR", week:"08-Feb", gmv:6571,   ns:4112.90,  np:4318.58,  comm:0,        disc:2458.10,  ads:441.32,  orders:21  },
  { brand:"FI",  loc:"MTH", week:"08-Feb", gmv:9138,   ns:6351.90,  np:6669.55,  comm:0,        disc:2786.10,  ads:766.51,  orders:28  },
  { brand:"FI",  loc:"BTM", week:"08-Feb", gmv:0,      ns:0,        np:0,        comm:0,        disc:0,        ads:0,       orders:0   },
  { brand:"FI",  loc:"IND", week:"08-Feb", gmv:2410,   ns:2410.00,  np:2530.50,  comm:0,        disc:0,        ads:469.85,  orders:7   },
  // W3
  { brand:"TOP", loc:"HSR", week:"15-Feb", gmv:71540,  ns:57061.94, np:37154.45, comm:12553.59, disc:14478.06, ads:3270.96, orders:195 },
  { brand:"TOP", loc:"MTH", week:"15-Feb", gmv:43582,  ns:32405.38, np:22854.44, comm:7041.39,  disc:11176.62, ads:615.78,  orders:126 },
  { brand:"TOP", loc:"BTM", week:"15-Feb", gmv:23195,  ns:18491.75, np:19416.44, comm:2588.85,  disc:4703.25,  ads:545.16,  orders:77  },
  { brand:"TOP", loc:"IND", week:"15-Feb", gmv:6455,   ns:5717.80,  np:5977.82,  comm:0,        disc:737.20,   ads:446.04,  orders:18  },
  { brand:"FB",  loc:"HSR", week:"15-Feb", gmv:8677,   ns:6599.21,  np:4729.04,  comm:1451.83,  disc:2077.79,  ads:896.80,  orders:25  },
  { brand:"FB",  loc:"MTH", week:"15-Feb", gmv:5067,   ns:3785.80,  np:2712.94,  comm:832.86,   disc:1281.20,  ads:259.60,  orders:15  },
  { brand:"FB",  loc:"BTM", week:"15-Feb", gmv:349,    ns:249.00,   np:261.45,   comm:34.86,    disc:100.00,   ads:70.80,   orders:1   },
  { brand:"FB",  loc:"IND", week:"15-Feb", gmv:628,    ns:628.00,   np:659.40,   comm:0,        disc:0,        ads:212.40,  orders:2   },
  { brand:"FI",  loc:"HSR", week:"15-Feb", gmv:7036,   ns:4519.33,  np:4745.34,  comm:0,        disc:2516.67,  ads:597.08,  orders:24  },
  { brand:"FI",  loc:"MTH", week:"15-Feb", gmv:13457,  ns:8578.99,  np:9008.03,  comm:0,        disc:4878.01,  ads:597.08,  orders:41  },
  { brand:"FI",  loc:"BTM", week:"15-Feb", gmv:767,    ns:767.00,   np:805.35,   comm:0,        disc:0,        ads:0,       orders:1   },
  { brand:"FI",  loc:"IND", week:"15-Feb", gmv:1305,   ns:1305.00,  np:1370.25,  comm:0,        disc:0,        ads:318.60,  orders:5   },
  // W4 — ADD ZOMATO W4 HERE WHEN AVAILABLE
];

export const ZOMATO_MONTHLY = [
  { brand:"TOP", loc:"HSR", month:"Feb-26", gmv:287550, ns:229481.66, np:158373.12, comm:49884.23, disc:58068.34, ads:6271.06,  orders:751, hyp:15845 },
  { brand:"TOP", loc:"MTH", month:"Feb-26", gmv:146357, ns:109642.44, np:75542.55,  comm:23686.53, disc:36714.56, ads:2173.38,  orders:427, hyp:16546 },
  { brand:"TOP", loc:"BTM", month:"Feb-26", gmv:89890,  ns:68435.41,  np:69884.36,  comm:9581.00,  disc:21454.59, ads:1972.96,  orders:282, hyp:27500 },
  { brand:"TOP", loc:"IND", month:"Feb-26", gmv:27518,  ns:23443.42,  np:23501.85,  comm:0,        disc:4074.58,  ads:1087.88,  orders:82,  hyp:4159  },
  { brand:"FB",  loc:"HSR", month:"Feb-26", gmv:31404,  ns:23284.31,  np:12929.89,  comm:5122.55,  disc:8119.69,  ads:3755.77,  orders:85,  hyp:0     },
  { brand:"FB",  loc:"MTH", month:"Feb-26", gmv:16625,  ns:12950.30,  np:7981.00,   comm:2785.46,  disc:3674.70,  ads:1178.17,  orders:42,  hyp:0     },
  { brand:"FB",  loc:"BTM", month:"Feb-26", gmv:3059,   ns:2360.00,   np:2023.24,   comm:330.40,   disc:699.00,   ads:454.76,   orders:8,   hyp:0     },
  { brand:"FB",  loc:"IND", month:"Feb-26", gmv:7616,   ns:7616.00,   np:6912.06,   comm:0,        disc:0,        ads:1083.24,  orders:19,  hyp:0     },
  { brand:"FI",  loc:"HSR", month:"Feb-26", gmv:29487,  ns:18920.53,  np:18335.02,  comm:0,        disc:10566.47, ads:1531.64,  orders:87,  hyp:0     },
  { brand:"FI",  loc:"MTH", month:"Feb-26", gmv:37955,  ns:25543.71,  np:24730.63,  comm:0,        disc:12411.29, ads:2090.47,  orders:118, hyp:0     },
  { brand:"FI",  loc:"BTM", month:"Feb-26", gmv:767,    ns:767.00,    np:805.35,    comm:0,        disc:0,        ads:0,        orders:1,   hyp:0     },
  { brand:"FI",  loc:"IND", month:"Feb-26", gmv:6963,   ns:6963.00,   np:6437.74,   comm:0,        disc:0,        ads:873.41,   orders:23,  hyp:0     },
];

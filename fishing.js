/* ============================================================
   MAGANG QUEST — FISHING SYSTEM ADDON
   fishing.js — Complete fishing mini-game with:
   - Lake zone with fishing spots
   - NPC merchant (Pak Ikan) selling bait and rods
   - 3 Bait tiers: biasa, langka, premium
   - Fish rarity system: biasa (50:1), langka (850:1), legendaris (2000:1)
   - Canvas-drawn fish assets with jump/catch animations
   - Fish inventory & sell system
   - All integrated into the existing game engine
============================================================ */

'use strict';

// ────────────────────────────────────────────────────────────
//  FISHING CONSTANTS
// ────────────────────────────────────────────────────────────

// Lake is located at tiles 5–20 x, 5–30 y (far northwest of map)
const LAKE_TILES = { x1: 3, y1: 3, x2: 22, y2: 28 };
// Fishing spot interaction radius (in pixels)
const FISHING_SPOT_RADIUS = 80;

// Fishing spots — positions at the shore (adjacent to water)
const FISHING_SPOTS = [
  { id: 'spot_n1', tx: 32,  ty: 17, label: 'Dermaga Utara' },
  { id: 'spot_n2', tx: 32,  ty:  21, label: 'Batu Besar' },
  { id: 'spot_w1', tx: 36,  ty: 17, label: 'Tepi Barat' },
  { id: 'spot_s1', tx: 36, ty: 21,  label: 'Muara Selatan' },
];

// ────────────────────────────────────────────────────────────
//  FISH CATALOG
// ────────────────────────────────────────────────────────────
// Each fish has: id, name, rarity, basePrice (per fish in rupiah),
// color scheme for canvas drawing, size (pixels), and description.
const FISH_CATALOG = {
  // ── BIASA (common) ────────────────────────────────────────
  lele: {
    id:'lele', name:'Ikan Lele', rarity:'biasa', basePrice:2000,
    bodyColor:'#5a4a3a', finColor:'#3d3020', eyeColor:'#fff',
    size:28, hasWhiskers:true, shape:'elongated',
    desc:'Ikan air tawar paling umum ditemukan.'
  },
  patin: {
    id:'patin', name:'Ikan Patin', rarity:'biasa', basePrice:3500,
    bodyColor:'#c0b0a0', finColor:'#8a7a6a', eyeColor:'#fff',
    size:32, hasWhiskers:true, shape:'elongated',
    desc:'Patin segar favorit warung makan.'
  },
  nila: {
    id:'nila', name:'Ikan Nila', rarity:'biasa', basePrice:2500,
    bodyColor:'#607080', finColor:'#404f60', eyeColor:'#fff',
    size:26, hasWhiskers:false, shape:'oval',
    desc:'Berwarna abu kehijauan, mudah dipancing.'
  },
  gurame: {
    id:'gurame', name:'Ikan Gurame', rarity:'biasa', basePrice:4000,
    bodyColor:'#d4a060', finColor:'#a07840', eyeColor:'#fff',
    size:30, hasWhiskers:false, shape:'deep',
    desc:'Gurame segar harganya lumayan!'
  },
  teri: {
    id:'teri', name:'Ikan Teri', rarity:'biasa', basePrice:800,
    bodyColor:'#e0e8e0', finColor:'#b0c0b0', eyeColor:'#333',
    size:14, hasWhiskers:false, shape:'slim',
    desc:'Kecil tapi hasilnya banyak.'
  },
  asin: {
    id:'asin', name:'Ikan Asin', rarity:'biasa', basePrice:1200,
    bodyColor:'#e8d098', finColor:'#c0a870', eyeColor:'#444',
    size:20, hasWhiskers:false, shape:'flat',
    desc:'Sudah kering di terik matahari.'
  },
  mas: {
    id:'mas', name:'Ikan Mas', rarity:'biasa', basePrice:3000,
    bodyColor:'#e8b820', finColor:'#c09010', eyeColor:'#fff',
    size:28, hasWhiskers:false, shape:'oval',
    desc:'Warnanya kuning emas berkilau.'
  },
  mujair: {
    id:'mujair', name:'Ikan Mujair', rarity:'biasa', basePrice:2200,
    bodyColor:'#708090', finColor:'#506070', eyeColor:'#fff',
    size:24, hasWhiskers:false, shape:'oval',
    desc:'Mujair goreng renyah, nikmat!'
  },

  // ── LANGKA (rare) ─────────────────────────────────────────
  cupang: {
    id:'cupang', name:'Ikan Cupang', rarity:'langka', basePrice:25000,
    bodyColor:'#e04080', finColor:'#9010c0', eyeColor:'#fff',
    size:22, hasWhiskers:false, shape:'fancy',
    desc:'Ekornya indah seperti bendera, sangat cantik!'
  },
  arwana: {
    id:'arwana', name:'Ikan Arwana', rarity:'langka', basePrice:80000,
    bodyColor:'#d0c040', finColor:'#a09020', eyeColor:'#f0a000',
    size:42, hasWhiskers:false, shape:'elongated',
    desc:'Simbol keberuntungan. Warnanya keemasan.'
  },
  napoleon: {
    id:'napoleon', name:'Ikan Napoleon', rarity:'langka', basePrice:60000,
    bodyColor:'#4080d0', finColor:'#206090', eyeColor:'#fff',
    size:44, hasWhiskers:false, shape:'deep',
    desc:'Tonjolan kepala besar seperti topi Napoleon!'
  },
  terubuk: {
    id:'terubuk', name:'Ikan Terubuk', rarity:'langka', basePrice:45000,
    bodyColor:'#c0d8e0', finColor:'#80b0c0', eyeColor:'#fff',
    size:36, hasWhiskers:false, shape:'slim',
    desc:'Ikan bertelur mahal, telurnya istimewa.'
  },

  // ── LEGENDARIS (legendary) ────────────────────────────────
  cupang_emas: {
    id:'cupang_emas', name:'Cupang Emas', rarity:'legendaris', basePrice:500000,
    bodyColor:'#ffd700', finColor:'#ff8c00', eyeColor:'#ff4400',
    size:26, hasWhiskers:false, shape:'fancy',
    desc:'MITOS! Cupang bermahkota emas, sangat langka!'
  },
  gegebong: {
    id:'gegebong', name:'Ikan Gegebong', rarity:'legendaris', basePrice:750000,
    bodyColor:'#20c080', finColor:'#108050', eyeColor:'#80ff80',
    size:50, hasWhiskers:true, shape:'deep',
    desc:'Legenda danau. Dipercaya membawa keberuntungan!'
  },
  hiu: {
    id:'hiu', name:'Hiu Danau', rarity:'legendaris', basePrice:1000000,
    bodyColor:'#607080', finColor:'#405060', eyeColor:'#ff3030',
    size:60, hasWhiskers:false, shape:'shark',
    desc:'APA?! Hiu di danau kota?! Mustahil... tapi nyata!'
  },
  angler: {
    id:'angler', name:'Angler Fish', rarity:'legendaris', basePrice:900000,
    bodyColor:'#2a1a3a', finColor:'#4a2a6a', eyeColor:'#80ff40',
    size:44, hasWhiskers:true, shape:'angler',
    desc:'Ikan laut dalam yang misterius. Bagaimana bisa di sini?!'
  },
  crimsonfish: {
    id:'crimsonfish', name:'Crimson Fish', rarity:'legendaris', basePrice:850000,
    bodyColor:'#cc1020', finColor:'#880010', eyeColor:'#ffff00',
    size:38, hasWhiskers:false, shape:'deep',
    desc:'Api merah memancar dari sisiknya. Luar biasa!'
  },
  glacierfish: {
    id:'glacierfish', name:'Glacier Fish', rarity:'legendaris', basePrice:800000,
    bodyColor:'#a0e8ff', finColor:'#60c0e0', eyeColor:'#ffffff',
    size:40, hasWhiskers:false, shape:'slim',
    desc:'Tubuh transparan seperti es. Langka sekali!'
  },
};

// Flat arrays grouped by rarity for quick lookup
const FISH_BY_RARITY = {
  biasa:     ['lele','patin','nila','gurame','teri','asin','mas','mujair'],
  langka:    ['cupang','arwana','napoleon','terubuk'],
  legendaris:['cupang_emas','gegebong','hiu','angler','crimsonfish','glacierfish'],
};

// ────────────────────────────────────────────────────────────
//  BAIT CATALOG
// ────────────────────────────────────────────────────────────
// Bait affects the weight given to each rarity tier during rolls.
// The roll works: generate random 1-2000, check thresholds per bait.
const BAIT_CATALOG = {
  biasa: {
    id:'biasa', name:'Umpan Biasa', emoji:'🪱', price:500,
    desc:'Cacing tanah biasa. Menarik ikan biasa.',
    // Roll thresholds (inclusive): 1-40 = biasa, 41-50 = langka, 51-2000 = nothing
    commonThresh:  40,  // /50 → biasa
    rareThresh:    50,  // /850 → langka
    legendThresh:  2000, // no legend bonus (1/2000 natural)
    legendBonus:   false,
  },
  langka: {
    id:'langka', name:'Umpan Langka', emoji:'🦗', price:5000,
    desc:'Serangga dan larva pilihan. Lebih menarik ikan langka.',
    commonThresh:  40,
    rareThresh:    50,
    legendThresh:  2000,
    legendBonus:   false,
    rareBonus:     3, // multiply rare chance by 3
  },
  premium: {
    id:'premium', name:'Umpan Premium', emoji:'🦑', price:20000,
    desc:'Umpan cumi ajaib. Bahkan ikan legendaris pun penasaran!',
    commonThresh:  40,
    rareThresh:    50,
    legendThresh:  2000,
    legendBonus:   true, // 5x legend chance
  },
};

// ────────────────────────────────────────────────────────────
//  ROD CATALOG
// ────────────────────────────────────────────────────────────
const ROD_CATALOG = {
  bambu: {
    id:'bambu', name:'Joran Bambu', emoji:'🎣', price:0, // given free
    desc:'Joran bambu sederhana. Cocok untuk pemula.',
    catchSpeedBonus: 0,  // no bonus
  },
  fiber: {
    id:'fiber', name:'Joran Fiber', emoji:'🎣', price:15000,
    desc:'Lebih kuat dan fleksibel. Mempercepat pancingan.',
    catchSpeedBonus: 20, // 20% faster minigame bar
  },
  karbon: {
    id:'karbon', name:'Joran Karbon', emoji:'🏆', price:75000,
    desc:'Teknologi tinggi! Memancing ikan legendaris lebih mudah.',
    catchSpeedBonus: 40,
    legendBonus: true,
  },
};

// ────────────────────────────────────────────────────────────
//  FISHING STATE
// ────────────────────────────────────────────────────────────
const FS = {
  // Inventory
  caughtFish:    [], // { fishId, count, totalValue }
  gold:          0,  // total rupiah from selling fish
  baitInventory: { biasa: 10, langka: 10, premium: 5 }, // starting bait
  rodId:         'bambu', // current rod
  ownedRods:     new Set(['bambu']),

  // Session stats
  totalCaught:   0,
  totalSold:     0,
  legendsCaught: 0,

  // Mini-game state
  active:        false, // is fishing mini-game open
  phase:         'idle', // idle | casting | waiting | biting | reeling | result
  baitId:        'biasa',
  catchTimer:    0,    // countdown until a fish bites (ms)
  catchTarget:   0,
  reelProgress:  0,   // 0-100
  reelTarget:    0,   // position the fish is at, random
  reelBar:       50,  // player's bar position
  reelDir:       1,   // fish pulling direction
  reelSpeed:     0,
  reelDirTimer:  0,
  pendingFish:   null, // which fish is biting
  castAnim:      0,
  bobberX:       0,
  bobberY:       0,
  rippleR:       0,
  jumpAnim:      null, // { fish, x, y, vy, vx, rot, alpha, frame }

  // Current spot
  spotId:        null,
};

// ────────────────────────────────────────────────────────────
//  MAP PATCH — Add lake to northwest area
// ────────────────────────────────────────────────────────────

/**
 * This function patches the already-generated game map after createMap()
 * is called, replacing the northwest grass area with the lake, shore paths,
 * fishing spots, and the NPC merchant's stall.
 * Called from the patched startGame() function below.
 */
function patchMapWithLake(map) {
  const T = window.T; // use global T from game.js

  function fill(x1,y1,x2,y2,t) {
    for (let y=y1; y<=y2; y++) for (let x=x1; x<=x2; x++) {
      if (y>=0 && y<100 && x>=0 && x<120) map[y][x]=t;
    }
  }

  // Clear zone to grass first
  fill(0, 0, 25, 32, T.GRASS);

  // Large lake body
  fill(4, 4, 20, 26, T.WATER);

  // Shore paths all around the lake
  fill(3, 3, 21, 3,  T.PATH); // top shore
  fill(3, 27, 21, 27, T.PATH); // bottom shore
  fill(3, 3, 3, 27,  T.PATH); // left shore
  fill(21, 3, 21, 27, T.PATH); // right shore

  // Grass surrounding
  fill(0, 0, 2, 32, T.GRASS);
  fill(22, 0, 25, 32, T.GRASS);
  fill(0, 28, 25, 32, T.GRASS);
  fill(0, 0, 25, 2, T.GRASS);

  // Trees around the lake for atmosphere
  const lakeTrees = [
    [1,1],[2,0],[0,5],[0,10],[0,15],[0,20],[0,25],[0,28],
    [22,0],[23,1],[24,3],[24,8],[24,12],[24,18],[24,23],[24,27],[24,30],
    [5,0],[9,0],[14,0],[18,0],
    [5,29],[9,29],[14,29],[18,29],
  ];
  lakeTrees.forEach(([x,y]) => {
    if (map[y] && map[y][x] === T.GRASS) map[y][x] = T.TREE;
  });

  // Flowers along shore
  const flowers = [
    [2,5],[2,9],[2,13],[2,17],[2,22],[22,6],[22,11],[22,16],[22,22],
    [7,2],[12,2],[17,2],[7,28],[12,28],[17,28],
  ];
  flowers.forEach(([x,y]) => { if (map[y] && map[y][x] === T.GRASS) map[y][x] = T.FLOWER; });

  // Wooden dock (path tiles jutting into water from south shore)
  fill(8, 25, 10, 27, T.PATH);  // south dock

  // Merchant stall area (northeast corner of lake zone)
  fill(22, 2, 25, 7, T.FLOOR_W); // stall floor
  // roof
  fill(22, 1, 25, 1, T.ROOF_Y);
  // table
  if (map[3]) map[3][23] = T.TABLE;
  if (map[4]) map[4][23] = T.SHELF;

  // Rocks at water edge
  [[3,8],[3,14],[21,8],[21,14],[21,19]].forEach(([x,y]) => {
    if (map[y] && map[y][x] === T.PATH) map[y][x] = T.ROCK;
  });
}

// ────────────────────────────────────────────────────────────
//  FISH CANVAS DRAWING ENGINE
// ────────────────────────────────────────────────────────────

/**
 * Draws a pixel-art style fish on any canvas context.
 * Each fish shape is different based on its 'shape' property.
 * @param {CanvasRenderingContext2D} ctx2d - target context
 * @param {object} fishData - from FISH_CATALOG
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} scale - 1.0 = normal
 * @param {number} rot - rotation in radians
 * @param {number} alpha - opacity
 */
function drawFish(ctx2d, fishData, x, y, scale=1.0, rot=0, alpha=1.0) {
  ctx2d.save();
  ctx2d.globalAlpha = alpha;
  ctx2d.translate(x, y);
  ctx2d.rotate(rot);
  ctx2d.scale(scale, scale);

  const s = fishData.size;
  const bc = fishData.bodyColor;
  const fc = fishData.finColor;
  const ec = fishData.eyeColor;

  switch (fishData.shape) {
    case 'elongated': drawFishElongated(ctx2d, s, bc, fc, ec, fishData.hasWhiskers); break;
    case 'oval':      drawFishOval(ctx2d, s, bc, fc, ec); break;
    case 'deep':      drawFishDeep(ctx2d, s, bc, fc, ec); break;
    case 'slim':      drawFishSlim(ctx2d, s, bc, fc, ec); break;
    case 'flat':      drawFishFlat(ctx2d, s, bc, fc, ec); break;
    case 'fancy':     drawFishFancy(ctx2d, s, bc, fc, ec); break;
    case 'shark':     drawFishShark(ctx2d, s, bc, fc, ec); break;
    case 'angler':    drawFishAngler(ctx2d, s, bc, fc, ec); break;
    default:          drawFishOval(ctx2d, s, bc, fc, ec);
  }

  ctx2d.restore();
}

function drawFishElongated(c, s, bc, fc, ec, whiskers) {
  // Body — long cylinder shape
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.35, 0, 0, Math.PI*2);
  c.fill();
  // Belly highlight
  c.fillStyle = lighten(bc, 30);
  c.beginPath();
  c.ellipse(s*0.1, s*0.1, s*0.6, s*0.15, 0, 0, Math.PI*2);
  c.fill();
  // Tail
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.55, -s*0.4);
  c.lineTo(-s-s*0.55, s*0.4);
  c.closePath(); c.fill();
  // Dorsal fin
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s*0.1, -s*0.35);
  c.lineTo(s*0.4, -s*0.35);
  c.lineTo(s*0.2, -s*0.7);
  c.closePath(); c.fill();
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.65, -s*0.08, s*0.13, 0, Math.PI*2); c.fill();
  c.fillStyle = '#000';
  c.beginPath(); c.arc(s*0.65, -s*0.08, s*0.07, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.68, -s*0.12, s*0.04, 0, Math.PI*2); c.fill();
  // Whiskers (catfish)
  if (whiskers) {
    c.strokeStyle = darken(bc, 20);
    c.lineWidth = 1;
    [[-0.15, -0.3], [0, -0.3], [0.15, -0.3]].forEach(([ox, oy]) => {
      c.beginPath();
      c.moveTo(s*0.78, 0);
      c.lineTo(s*(0.78+ox*0.6), s*(oy*0.6));
      c.stroke();
    });
  }
  // Scales pattern
  c.strokeStyle = darken(bc, 15);
  c.lineWidth = 0.5;
  for (let i=0; i<4; i++) {
    c.beginPath();
    c.arc(-s*0.3+i*s*0.22, 0, s*0.18, Math.PI*0.5, Math.PI*1.5);
    c.stroke();
  }
}

function drawFishOval(c, s, bc, fc, ec) {
  // Body
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.55, 0, 0, Math.PI*2);
  c.fill();
  // Gradient sheen
  c.fillStyle = 'rgba(255,255,255,0.15)';
  c.beginPath();
  c.ellipse(s*0.1, -s*0.15, s*0.5, s*0.25, 0, 0, Math.PI*2);
  c.fill();
  // Tail fin
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, -s*0.1);
  c.lineTo(-s*1.5, -s*0.45);
  c.lineTo(-s*1.5, s*0.45);
  c.lineTo(-s, s*0.1);
  c.closePath(); c.fill();
  // Dorsal
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(0, -s*0.55);
  c.lineTo(s*0.5, -s*0.55);
  c.lineTo(s*0.2, -s*0.95);
  c.closePath(); c.fill();
  // Pectoral fin
  c.fillStyle = fc;
  c.beginPath();
  c.ellipse(s*0.2, s*0.4, s*0.25, s*0.12, 0.4, 0, Math.PI*2);
  c.fill();
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.55, -s*0.1, s*0.14, 0, Math.PI*2); c.fill();
  c.fillStyle = '#111';
  c.beginPath(); c.arc(s*0.55, -s*0.1, s*0.08, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.58, -s*0.14, s*0.04, 0, Math.PI*2); c.fill();
  // Scale arcs
  c.strokeStyle = darken(bc, 12);
  c.lineWidth = 0.7;
  for (let r=0; r<3; r++) for (let col=0; col<3; col++) {
    c.beginPath();
    c.arc(-s*0.3+col*s*0.28, -s*0.1+r*s*0.22, s*0.2, Math.PI*0.5, Math.PI*1.5);
    c.stroke();
  }
}

function drawFishDeep(c, s, bc, fc, ec) {
  // High-body fish (gurame/napoleon style)
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.75, 0, 0, Math.PI*2);
  c.fill();
  // Metallic sheen
  const grad = c.createLinearGradient(-s, -s, s, s);
  grad.addColorStop(0, 'rgba(255,255,255,0.2)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  grad.addColorStop(1, 'rgba(0,0,0,0.1)');
  c.fillStyle = grad;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.75, 0, 0, Math.PI*2);
  c.fill();
  // Tail
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.6, -s*0.55);
  c.lineTo(-s-s*0.6, s*0.55);
  c.closePath(); c.fill();
  // Tall dorsal
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s*0.2, -s*0.75);
  c.lineTo(s*0.6, -s*0.75);
  c.lineTo(s*0.3, -s*1.3);
  c.lineTo(-s*0.1, -s*1.1);
  c.closePath(); c.fill();
  // Napoleon hump (for napoleon fish)
  c.fillStyle = lighten(bc, 15);
  c.beginPath(); c.arc(s*0.4, -s*0.5, s*0.35, Math.PI, Math.PI*2); c.fill();
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.6, -s*0.15, s*0.15, 0, Math.PI*2); c.fill();
  c.fillStyle = '#000';
  c.beginPath(); c.arc(s*0.6, -s*0.15, s*0.09, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.64, -s*0.19, s*0.04, 0, Math.PI*2); c.fill();
}

function drawFishSlim(c, s, bc, fc, ec) {
  // Slim / torpedo fish
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.22, 0, 0, Math.PI*2);
  c.fill();
  // Silver streak
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.beginPath();
  c.ellipse(0, -s*0.05, s*0.7, s*0.07, 0, 0, Math.PI*2);
  c.fill();
  // Forked tail
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.5, -s*0.35);
  c.quadraticCurveTo(-s-s*0.3, -s*0.1, -s, 0);
  c.fill();
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.5, s*0.35);
  c.quadraticCurveTo(-s-s*0.3, s*0.1, -s, 0);
  c.fill();
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.7, -s*0.04, s*0.1, 0, Math.PI*2); c.fill();
  c.fillStyle = '#000';
  c.beginPath(); c.arc(s*0.7, -s*0.04, s*0.06, 0, Math.PI*2); c.fill();
}

function drawFishFlat(c, s, bc, fc, ec) {
  // Flat dried fish
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s, s*0.28, 0, 0, Math.PI*2);
  c.fill();
  // Dried texture lines
  c.strokeStyle = darken(bc, 25);
  c.lineWidth = 0.8;
  for (let i=0; i<5; i++) {
    c.beginPath();
    c.moveTo(-s+i*s*0.4, -s*0.2);
    c.lineTo(-s+i*s*0.4+s*0.1, s*0.2);
    c.stroke();
  }
  // Tail
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.4, -s*0.25);
  c.lineTo(-s-s*0.4, s*0.25);
  c.closePath(); c.fill();
  // Eye
  c.fillStyle = '#555';
  c.beginPath(); c.arc(s*0.65, 0, s*0.1, 0, Math.PI*2); c.fill();
}

function drawFishFancy(c, s, bc, fc, ec) {
  // Fancy betta / cupang — flowing fins
  // Body
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, 0, s*0.8, s*0.5, 0, 0, Math.PI*2);
  c.fill();
  // Flowing tail (large, multi-layered)
  const layers = [fc, lighten(fc, 20), lighten(bc, 15)];
  layers.forEach((col, i) => {
    c.fillStyle = col;
    c.globalAlpha = 0.75 - i*0.2;
    c.beginPath();
    c.moveTo(-s*0.6, 0);
    c.bezierCurveTo(-s, -s*(0.8+i*0.3), -s*(1.5+i*0.2), -s*(0.5+i*0.2), -s*(1.2+i*0.3), s*0.1);
    c.bezierCurveTo(-s*(1.5+i*0.2), s*(0.5+i*0.2), -s, s*(0.8+i*0.3), -s*0.6, 0);
    c.fill();
  });
  c.globalAlpha = 1;
  // Ventral trailing fins
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(s*0.2, s*0.5);
  c.bezierCurveTo(0, s*1.2, -s*0.4, s*1.3, -s*0.3, s*0.6);
  c.fill();
  // Dorsal
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(s*0.3, -s*0.5);
  c.bezierCurveTo(s*0.1, -s, -s*0.2, -s*1.1, -s*0.1, -s*0.5);
  c.fill();
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.45, -s*0.1, s*0.15, 0, Math.PI*2); c.fill();
  c.fillStyle = '#000';
  c.beginPath(); c.arc(s*0.45, -s*0.1, s*0.09, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.49, -s*0.14, s*0.04, 0, Math.PI*2); c.fill();
  // Shimmer
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.beginPath(); c.ellipse(s*0.1, -s*0.15, s*0.35, s*0.18, -0.3, 0, Math.PI*2); c.fill();
}

function drawFishShark(c, s, bc, fc, ec) {
  // Shark — torpedo body, large dorsal
  c.fillStyle = bc;
  c.beginPath();
  c.moveTo(s, 0);
  c.bezierCurveTo(s*0.8, -s*0.35, -s*0.6, -s*0.4, -s, 0);
  c.bezierCurveTo(-s*0.6, s*0.3, s*0.8, s*0.3, s, 0);
  c.fill();
  // White belly
  c.fillStyle = '#e8f0e8';
  c.beginPath();
  c.moveTo(s*0.6, s*0.05);
  c.bezierCurveTo(s*0.3, s*0.25, -s*0.4, s*0.25, -s*0.6, 0);
  c.bezierCurveTo(-s*0.4, -s*0.05, s*0.3, -s*0.05, s*0.6, s*0.05);
  c.fill();
  // Large dorsal fin
  c.fillStyle = bc;
  c.beginPath();
  c.moveTo(-s*0.1, -s*0.38);
  c.lineTo(s*0.2, -s*0.38);
  c.lineTo(s*0.0, -s*1.0);
  c.closePath(); c.fill();
  // Tail
  c.fillStyle = bc;
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.5, -s*0.55);
  c.lineTo(-s-s*0.1, 0);
  c.fill();
  c.beginPath();
  c.moveTo(-s, 0);
  c.lineTo(-s-s*0.5, s*0.3);
  c.lineTo(-s-s*0.1, 0);
  c.fill();
  // Pectoral
  c.fillStyle = darken(bc, 10);
  c.beginPath();
  c.moveTo(s*0.2, s*0.1);
  c.lineTo(-s*0.2, s*0.5);
  c.lineTo(-s*0.35, s*0.1);
  c.closePath(); c.fill();
  // Eye
  c.fillStyle = '#111';
  c.beginPath(); c.arc(s*0.6, -s*0.1, s*0.1, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.63, -s*0.13, s*0.04, 0, Math.PI*2); c.fill();
  // Gill lines
  c.strokeStyle = darken(bc, 20);
  c.lineWidth = 1;
  [0.35, 0.42, 0.49].forEach(pos => {
    c.beginPath();
    c.moveTo(s*pos, -s*0.2);
    c.quadraticCurveTo(s*pos-s*0.05, 0, s*pos, s*0.15);
    c.stroke();
  });
  // Teeth
  c.fillStyle = '#fff';
  c.beginPath();
  c.moveTo(s*0.9, s*0.05);
  c.lineTo(s*0.95, s*0.15);
  c.lineTo(s, s*0.05);
  c.fill();
}

function drawFishAngler(c, s, bc, fc, ec) {
  // Anglerfish — bulbous body, lure on head
  c.fillStyle = bc;
  c.beginPath();
  c.ellipse(0, s*0.1, s, s*0.65, 0, 0, Math.PI*2);
  c.fill();
  // Dark texture
  c.strokeStyle = 'rgba(0,0,0,0.2)';
  c.lineWidth = 1.5;
  for (let i=0; i<6; i++) {
    c.beginPath();
    c.arc(i*s*0.3-s*0.7, s*0.1, s*0.22, Math.PI*0.4, Math.PI*1.6);
    c.stroke();
  }
  // Tail (spiky)
  c.fillStyle = fc;
  c.beginPath();
  c.moveTo(-s, s*0.1);
  c.lineTo(-s-s*0.5, -s*0.4);
  c.lineTo(-s-s*0.3, s*0.1);
  c.lineTo(-s-s*0.5, s*0.55);
  c.closePath(); c.fill();
  // Lure (top rod)
  c.strokeStyle = darken(bc, 10);
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(s*0.5, -s*0.65);
  c.bezierCurveTo(s*0.8, -s*1.0, s*0.2, -s*1.2, s*0.5, -s*1.0);
  c.stroke();
  // Lure bulb (glowing)
  const t = Date.now()*0.003;
  const glow = 0.6 + 0.4*Math.sin(t);
  c.fillStyle = ec;
  c.globalAlpha = glow;
  c.beginPath(); c.arc(s*0.5, -s*1.0, s*0.15, 0, Math.PI*2); c.fill();
  c.globalAlpha = 1;
  // Large jagged mouth
  c.fillStyle = '#cc0020';
  c.beginPath();
  c.moveTo(s*0.7, s*0.3);
  c.lineTo(s*0.85, s*0.15);
  c.lineTo(s*0.75, s*0.1);
  c.lineTo(s*0.9, -s*0.05);
  c.lineTo(s*0.7, s*0.05);
  c.closePath(); c.fill();
  // Teeth
  c.fillStyle = '#fff';
  [[s*0.72, s*0.25], [s*0.78, s*0.2], [s*0.84, s*0.15]].forEach(([tx, ty]) => {
    c.beginPath();
    c.moveTo(tx, ty); c.lineTo(tx+s*0.04, ty-s*0.12); c.lineTo(tx+s*0.08, ty);
    c.fill();
  });
  // Eye
  c.fillStyle = ec;
  c.beginPath(); c.arc(s*0.4, -s*0.1, s*0.18, 0, Math.PI*2); c.fill();
  c.fillStyle = '#000';
  c.beginPath(); c.arc(s*0.4, -s*0.1, s*0.12, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(s*0.44, -s*0.14, s*0.05, 0, Math.PI*2); c.fill();
}

// Color helpers
function lighten(hex, amt) {
  return adjustColor(hex, amt);
}
function darken(hex, amt) {
  return adjustColor(hex, -amt);
}
function adjustColor(hex, amt) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, ((n>>16)&0xff)+amt));
  const g = Math.min(255, Math.max(0, ((n>>8)&0xff)+amt));
  const b = Math.min(255, Math.max(0, (n&0xff)+amt));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ────────────────────────────────────────────────────────────
//  JUMP ANIMATION ENGINE
// ────────────────────────────────────────────────────────────

let fishJumps = []; // list of active fish jump animations

/**
 * Spawns a fish jump animation at the given world coordinates.
 * The fish arcs out of the water, spins, and splashes back.
 */
function spawnFishJump(fishData, wx, wy) {
  fishJumps.push({
    fishData,
    wx, wy,
    t: 0,           // 0→1 progress
    totalTime: 120, // frames
    vy: -8,         // initial upward velocity
    vx: (Math.random()-0.5)*3,
    gravity: 0.18,
    rot: 0,
    rotSpeed: (Math.random()-0.5)*0.25,
    phase: 'up',    // up | fall | splash
    alpha: 1,
    splashR: 0,
    splashAlpha: 0,
  });
}

function updateAndDrawFishJumps(cx, cy) {
  fishJumps = fishJumps.filter(j => j.alpha > 0.01);
  fishJumps.forEach(j => {
    j.vy += j.gravity;
    j.wy += j.vy;
    j.wx += j.vx;
    j.rot += j.rotSpeed;
    j.t++;

    const sx = j.wx - cx;
    const sy = j.wy - cy;

    if (j.vy > 0 && j.phase === 'up') {
      j.phase = 'fall';
    }
    if (j.phase === 'fall' && j.vy > 5) {
      j.phase = 'splash';
      j.splashAlpha = 1;
      j.splashR = 5;
    }
    if (j.phase === 'splash') {
      j.alpha -= 0.04;
      j.splashR += 4;
      j.splashAlpha -= 0.06;
      // Draw splash rings
      if (j.splashAlpha > 0) {
        ctx.strokeStyle = `rgba(100,180,255,${j.splashAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(sx, sy, j.splashR, j.splashR*0.4, 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(200,240,255,${j.splashAlpha*0.5})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy, j.splashR*0.5, j.splashR*0.2, 0, 0, Math.PI*2);
        ctx.stroke();
      }
    } else {
      // Draw the fish in mid-air
      drawFish(ctx, j.fishData, sx, sy, 1.2, j.rot, j.alpha);
      // Water droplets
      if (j.t < 20) {
        ctx.fillStyle = 'rgba(100,200,255,0.6)';
        for (let d=0; d<3; d++) {
          const da = j.t*0.3+d*2;
          ctx.beginPath();
          ctx.arc(sx+Math.cos(da)*8, sy+Math.sin(da)*8, 2, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  });
}

// ────────────────────────────────────────────────────────────
//  RARITY ROLL ENGINE
// ────────────────────────────────────────────────────────────

/**
 * Attempts to catch a fish based on current bait.
 * Returns a fish catalog entry or null (nothing caught).
 *
 * Odds per bait type:
 *   biasa:   biasa=1/50, langka=1/850, legendaris=1/2000
 *   langka:  biasa=1/50, langka=3/850 (3x), legendaris=1/2000
 *   premium: biasa=1/50, langka=3/850, legendaris=5/2000 (5x)
 *
 * A single roll is drawn from 0–1. We use thresholds:
 *   legendChance = 1/2000 * legendMultiplier
 *   rareChance   = 1/850  * rareMultiplier
 *   commonChance = 1/50
 */
function rollFish(baitId) {
  const bait = BAIT_CATALOG[baitId] || BAIT_CATALOG.biasa;
  const rod = ROD_CATALOG[FS.rodId] || ROD_CATALOG.bambu;

  const legendMult = (bait.legendBonus ? 5 : 1) * (rod.legendBonus ? 2 : 1);
  const rareMult   = bait.rareBonus || 1;

  const legendChance = legendMult / 30;
  const rareChance   = rareMult   / 15;
  const commonChance = 1 / 5;

  const roll = Math.random();

  if (roll < legendChance) {
    const pool = FISH_BY_RARITY.legendaris;
    return FISH_CATALOG[pool[Math.floor(Math.random()*pool.length)]];
  } else if (roll < legendChance + rareChance) {
    const pool = FISH_BY_RARITY.langka;
    return FISH_CATALOG[pool[Math.floor(Math.random()*pool.length)]];
  } else if (roll < legendChance + rareChance + commonChance) {
    const pool = FISH_BY_RARITY.biasa;
    return FISH_CATALOG[pool[Math.floor(Math.random()*pool.length)]];
  }
  return null; // nothing this time
}

// ────────────────────────────────────────────────────────────
//  FISHING UI (HTML overlay)
// ────────────────────────────────────────────────────────────

function buildFishingUI() {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = FISHING_CSS;
  document.head.appendChild(style);

  // Main fishing overlay (mini-game)
  const fishOverlay = document.createElement('div');
  fishOverlay.id = 'fishing-overlay';
  fishOverlay.className = 'hidden';
  fishOverlay.innerHTML = `
    <div id="fishing-panel">
      <div id="fishing-header">
        <span id="fishing-title">🎣 Memancing</span>
        <div id="fishing-spot-label"></div>
      </div>

      <!-- Water scene with animated fish -->
      <div id="fishing-scene">
        <canvas id="fishing-canvas" width="340" height="180"></canvas>
        <div id="fishing-rod-wrap">
          <div id="fishing-rod"></div>
          <div id="fishing-line"></div>
          <div id="fishing-bobber" class="hidden">🎯</div>
        </div>
      </div>

      <!-- Status message -->
      <div id="fishing-status">Pilih umpan dan tekan Lempar!</div>

      <!-- Reel mini-game bar -->
      <div id="reel-section" class="hidden">
        <div id="reel-label">🐟 Tarik Ikannya!</div>
        <div id="reel-outer">
          <div id="reel-fish-zone"></div>
          <div id="reel-bar"></div>
        </div>
        <div id="reel-hint">Tekan SPASI / Tombol Tarik berulang kali!</div>
        <button id="reel-pull-btn" class="reel-btn">⬆ TARIK!</button>
      </div>

      <!-- Bait & rod selector -->
      <div id="fishing-controls">
        <div class="fc-row">
          <label>Umpan:</label>
          <div id="bait-selector"></div>
        </div>
        <div class="fc-row">
          <label>Joran:</label>
          <div id="rod-display"></div>
        </div>
      </div>

      <div id="fishing-action-row">
        <button id="btn-cast" class="fish-btn cast-btn">🎣 Lempar!</button>
        <button id="btn-stop-fish" class="fish-btn stop-btn">✕ Berhenti</button>
      </div>
    </div>
  `;
  document.body.appendChild(fishOverlay);

  // Fish inventory & sell panel
  const invOverlay = document.createElement('div');
  invOverlay.id = 'fish-inv-overlay';
  invOverlay.className = 'panel-overlay hidden';
  invOverlay.innerHTML = `
    <div class="panel wide">
      <div class="panel-title">🐟 Kantong Ikan</div>
      <div id="fish-inv-stats">
        <span>💰 Uang: <b id="fish-gold">Rp 500</b></span>
        <span>🎣 Ditangkap: <b id="fish-total-caught">0</b></span>
        <span>⭐ Legenda: <b id="fish-legend-count">0</b></span>
      </div>
      <div id="fish-inv-grid"></div>
      <div id="fish-inv-actions">
        <button id="btn-sell-all" class="fish-btn sell-btn">💰 Jual Semua</button>
        <button id="btn-sell-selected" class="fish-btn sell-btn" style="display:none">💰 Jual Pilihan</button>
      </div>
      <button class="close-panel">✕ Tutup</button>
    </div>
  `;
  document.body.appendChild(invOverlay);

  // Catch result popup
  const catchPopup = document.createElement('div');
  catchPopup.id = 'catch-popup';
  catchPopup.className = 'hidden';
  catchPopup.innerHTML = `
    <div id="catch-popup-inner">
      <div id="catch-rarity-badge"></div>
      <canvas id="catch-fish-canvas" width="160" height="120"></canvas>
      <div id="catch-fish-name"></div>
      <div id="catch-fish-desc"></div>
      <div id="catch-fish-value"></div>
      <button id="catch-ok-btn" class="fish-btn cast-btn">✅ Simpan</button>
      <button id="catch-sell-btn" class="fish-btn sell-btn">💰 Jual Langsung</button>
    </div>
  `;
  document.body.appendChild(catchPopup);

  // Merchant NPC shop
  const shopOverlay = document.createElement('div');
  shopOverlay.id = 'fish-shop-overlay';
  shopOverlay.className = 'panel-overlay hidden';
  shopOverlay.innerHTML = `
    <div class="panel wide">
      <div class="panel-title">🏪 Toko Pak Ikan — Perlengkapan Pancing</div>
      <div id="fish-shop-stock"></div>
      <div id="fish-shop-gold">💰 Kantong: <b id="shop-gold-display">Rp 0</b></div>
      <button class="close-panel">✕ Tutup</button>
    </div>
  `;
  document.body.appendChild(shopOverlay);

  // Bind events
  bindFishingEvents();
}

const FISHING_CSS = `
/* ── FISHING PANEL ─────────────────────────────────────────── */
#fishing-overlay {
  position:fixed; inset:0; z-index:200;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,10,20,0.82);
  backdrop-filter:blur(3px);
}
#fishing-overlay.hidden { display:none; }

#fishing-panel {
  width:360px; max-width:95vw;
  background:linear-gradient(160deg,#0a1a2a,#0d2235,#0a1a2a);
  border:2px solid #40e0d0;
  border-radius:16px;
  padding:16px;
  box-shadow:0 0 40px rgba(64,224,208,0.3), inset 0 0 20px rgba(0,0,0,0.4);
  display:flex; flex-direction:column; gap:10px;
}

#fishing-header {
  display:flex; justify-content:space-between; align-items:center;
}
#fishing-title {
  font-family:'Press Start 2P',monospace;
  font-size:11px; color:#40e0d0;
}
#fishing-spot-label {
  font-size:11px; color:#a0c8d8;
}

#fishing-scene {
  position:relative;
  border-radius:10px; overflow:hidden;
  border:1.5px solid rgba(64,224,208,0.3);
}
#fishing-canvas {
  display:block; width:100%; height:auto;
  border-radius:10px;
}
#fishing-rod-wrap {
  position:absolute; top:0; right:30px;
  pointer-events:none;
}
#fishing-rod {
  width:4px; height:80px;
  background:linear-gradient(#8d6e63,#a1887f);
  border-radius:2px;
  transform-origin:top center;
  transform:rotate(20deg);
}
#fishing-line {
  position:absolute; top:60px; right:0;
  width:1px; height:80px;
  background:rgba(255,255,255,0.5);
  transform-origin:top center;
}
#fishing-bobber {
  position:absolute; top:130px; right:-6px;
  font-size:14px;
  animation:bobberBob 1s ease-in-out infinite alternate;
}
@keyframes bobberBob {
  from { transform:translateY(0); }
  to   { transform:translateY(4px); }
}

#fishing-status {
  text-align:center;
  font-size:12px; color:#d0e8f0;
  padding:6px;
  background:rgba(0,0,0,0.3);
  border-radius:6px;
  min-height:32px;
}

/* Reel mini-game */
#reel-section {
  display:flex; flex-direction:column; gap:8px;
  padding:10px;
  background:rgba(0,0,0,0.3);
  border-radius:10px;
  border:1px solid rgba(64,224,208,0.2);
}
#reel-section.hidden { display:none; }
#reel-label { text-align:center; font-size:12px; color:#ffd700; font-weight:700; }
#reel-outer {
  position:relative;
  height:28px;
  background:rgba(0,0,0,0.5);
  border-radius:14px;
  border:2px solid rgba(255,255,255,0.15);
  overflow:hidden;
}
#reel-fish-zone {
  position:absolute;
  height:100%; width:22%;
  background:rgba(64,200,100,0.35);
  border-radius:14px;
  transition:left 0.08s;
}
#reel-bar {
  position:absolute; top:2px;
  width:18px; height:24px;
  background:linear-gradient(180deg,#60d0ff,#2080c0);
  border-radius:9px;
  border:2px solid #fff;
  box-shadow:0 0 8px rgba(100,200,255,0.8);
  transition:left 0.04s;
}
#reel-hint { text-align:center; font-size:10px; color:#a0c0d0; }
.reel-btn {
  width:100%;
  padding:10px;
  background:linear-gradient(135deg,#1565c0,#1976d2);
  border:2px solid #42a5f5;
  border-radius:10px;
  color:#fff;
  font-size:13px; font-weight:700;
  cursor:pointer;
  transition:all 0.15s;
  font-family:'Nunito',sans-serif;
}
.reel-btn:active { transform:scale(0.95); background:#0d47a1; }

/* Bait & controls */
#fishing-controls {
  display:flex; flex-direction:column; gap:8px;
  padding:8px;
  background:rgba(0,0,0,0.25);
  border-radius:8px;
}
.fc-row {
  display:flex; align-items:center; gap:10px;
  flex-wrap:wrap;
}
.fc-row label { font-size:11px; color:#90b0c0; width:50px; flex-shrink:0; }
#bait-selector { display:flex; gap:6px; flex-wrap:wrap; }
.bait-btn {
  padding:5px 10px;
  background:rgba(0,0,0,0.4);
  border:1.5px solid rgba(64,224,208,0.3);
  border-radius:8px;
  color:#d0e8f0;
  font-size:11px; cursor:pointer;
  transition:all 0.15s;
  font-family:'Nunito',sans-serif;
  display:flex; align-items:center; gap:4px;
}
.bait-btn:hover { border-color:#40e0d0; color:#40e0d0; }
.bait-btn.active { border-color:#ffd700; color:#ffd700; background:rgba(255,215,0,0.1); }
.bait-btn.empty  { opacity:0.4; cursor:not-allowed; }
#rod-display {
  font-size:12px; color:#ffd700;
  padding:4px 10px;
  background:rgba(255,215,0,0.08);
  border-radius:6px;
  border:1px solid rgba(255,215,0,0.3);
}

#fishing-action-row {
  display:flex; gap:8px;
}
.fish-btn {
  flex:1; padding:10px;
  border-radius:10px;
  border:2px solid;
  font-size:12px; font-weight:700;
  cursor:pointer; transition:all 0.15s;
  font-family:'Nunito',sans-serif;
}
.cast-btn {
  background:linear-gradient(135deg,#1b5e20,#2e7d32);
  border-color:#66bb6a; color:#fff;
}
.cast-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(102,187,106,0.4); }
.stop-btn {
  background:linear-gradient(135deg,#37474f,#455a64);
  border-color:#78909c; color:#cfd8dc;
  flex:0.4;
}

/* Fish inventory */
#fish-inv-stats {
  display:flex; gap:16px; flex-wrap:wrap;
  padding:8px 0;
  font-size:12px; color:#a0c0d0;
}
#fish-inv-stats b { color:#ffd700; }
#fish-inv-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(90px,1fr));
  gap:8px;
  max-height:280px; overflow-y:auto;
  padding:4px;
}
.fish-inv-card {
  background:rgba(0,0,0,0.3);
  border:1.5px solid rgba(255,255,255,0.1);
  border-radius:10px;
  padding:8px;
  display:flex; flex-direction:column;
  align-items:center; gap:4px;
  cursor:pointer;
  transition:all 0.2s;
}
.fish-inv-card:hover { border-color:#40e0d0; transform:scale(1.03); }
.fish-inv-card.selected { border-color:#ffd700; background:rgba(255,215,0,0.1); }
.fish-inv-card.rarity-biasa     { border-color:rgba(180,200,180,0.4); }
.fish-inv-card.rarity-langka    { border-color:rgba(80,180,255,0.5); }
.fish-inv-card.rarity-legendaris{ border-color:rgba(255,215,0,0.7);
  box-shadow:0 0 10px rgba(255,215,0,0.3); }
.fish-card-name { font-size:9px; color:#d0e0f0; text-align:center; }
.fish-card-count { font-size:10px; color:#ffd700; font-weight:700; }
.fish-card-value { font-size:9px; color:#80c080; }
#fish-inv-actions { display:flex; gap:8px; margin-top:4px; }
.sell-btn {
  background:linear-gradient(135deg,#e65100,#f57c00);
  border-color:#ffb74d; color:#fff;
}
.sell-btn:hover { transform:translateY(-1px); }

/* Catch popup */
#catch-popup {
  position:fixed; inset:0; z-index:300;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.85);
  animation:fadeIn 0.3s ease;
}
#catch-popup.hidden { display:none; }
#catch-popup-inner {
  background:linear-gradient(160deg,#0a1a2a,#0d2235);
  border:2px solid;
  border-radius:20px;
  padding:24px;
  display:flex; flex-direction:column;
  align-items:center; gap:10px;
  max-width:280px; width:90%;
  animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn {
  from { transform:scale(0.4) rotate(-10deg); opacity:0; }
  to   { transform:scale(1) rotate(0deg); opacity:1; }
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
#catch-rarity-badge {
  font-family:'Press Start 2P',monospace;
  font-size:10px;
  padding:4px 12px;
  border-radius:20px;
  letter-spacing:1px;
}
.badge-biasa     { background:rgba(150,180,150,0.2); color:#90c090; border:1px solid #90c090; }
.badge-langka    { background:rgba(60,120,220,0.2);  color:#60a0ff; border:1px solid #60a0ff; }
.badge-legendaris{
  background:rgba(255,215,0,0.2); color:#ffd700;
  border:1px solid #ffd700;
  box-shadow:0 0 20px rgba(255,215,0,0.5);
  animation:legendPulse 1s ease-in-out infinite alternate;
}
@keyframes legendPulse {
  from { box-shadow:0 0 10px rgba(255,215,0,0.4); }
  to   { box-shadow:0 0 30px rgba(255,215,0,0.9); }
}
#catch-fish-canvas { border-radius:10px; background:rgba(0,30,60,0.5); }
#catch-fish-name {
  font-family:'Press Start 2P',monospace;
  font-size:10px; color:#fff; text-align:center;
}
#catch-fish-desc { font-size:11px; color:#a0c8d8; text-align:center; }
#catch-fish-value { font-size:12px; color:#66bb6a; font-weight:700; }

/* Fish shop */
#fish-shop-stock {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
  gap:10px; padding:8px 0;
}
.shop-item {
  background:rgba(0,0,0,0.35);
  border:1.5px solid rgba(255,255,255,0.1);
  border-radius:10px;
  padding:10px;
  display:flex; flex-direction:column; gap:6px;
  transition:all 0.2s;
}
.shop-item:hover { border-color:#40e0d0; }
.shop-item-name { font-size:11px; color:#d0e8f0; font-weight:700; }
.shop-item-desc { font-size:10px; color:#80a0b0; }
.shop-item-price { font-size:11px; color:#ffd700; }
.shop-item-owned { font-size:10px; color:#66bb6a; }
.shop-buy-btn {
  padding:6px;
  background:linear-gradient(135deg,#1565c0,#1976d2);
  border:1px solid #42a5f5;
  border-radius:6px;
  color:#fff; font-size:10px;
  cursor:pointer; font-family:'Nunito',sans-serif;
  transition:all 0.15s;
}
.shop-buy-btn:hover { background:#1976d2; }
.shop-buy-btn:disabled { opacity:0.4; cursor:not-allowed; }
#fish-shop-gold { font-size:12px; color:#a0c0d0; padding:8px 0; }
#fish-shop-gold b { color:#ffd700; }
`;

// ────────────────────────────────────────────────────────────
//  FISHING SCENE CANVAS RENDERER
// ────────────────────────────────────────────────────────────

let fishingAnimFrame = 0;
let fishingAnimId = null;
let sceneFish = []; // background fish swimming in scene

function initSceneFish() {
  sceneFish = [];
  for (let i=0; i<5; i++) {
    const rarity = Math.random() < 0.05 ? 'langka' : 'biasa';
    const pool = FISH_BY_RARITY[rarity];
    const fishId = pool[Math.floor(Math.random()*pool.length)];
    sceneFish.push({
      fishData: FISH_CATALOG[fishId],
      x: Math.random()*280 + 30,
      y: 110 + Math.random()*40,
      vx: (Math.random()-0.5)*0.8,
      flip: Math.random() > 0.5,
      depth: 0.5 + Math.random()*0.5,
    });
  }
}

function renderFishingScene() {
  const fc = document.getElementById('fishing-canvas');
  if (!fc) return;
  const c = fc.getContext('2d');
  const W = 340, H = 180;
  fishingAnimFrame++;

  // Sky gradient
  const sky = c.createLinearGradient(0, 0, 0, 80);
  sky.addColorStop(0, '#0a2040');
  sky.addColorStop(1, '#1a4060');
  c.fillStyle = sky;
  c.fillRect(0, 0, W, 80);

  // Stars
  c.fillStyle = 'rgba(255,255,255,0.6)';
  [[20,15],[80,8],[150,20],[220,5],[300,18],[280,30]].forEach(([sx,sy]) => {
    c.beginPath(); c.arc(sx, sy, 1, 0, Math.PI*2); c.fill();
  });

  // Moon
  c.fillStyle = '#fffbe0';
  c.beginPath(); c.arc(300, 25, 14, 0, Math.PI*2); c.fill();
  c.fillStyle = '#1a4060';
  c.beginPath(); c.arc(295, 22, 11, 0, Math.PI*2); c.fill();

  // Tree silhouettes
  c.fillStyle = '#0a1a10';
  [[20,80,30,55],[60,80,25,50],[280,80,35,60],[310,80,28,55]].forEach(([tx,ty,r,h]) => {
    c.beginPath(); c.arc(tx, ty-h/2, r, 0, Math.PI*2); c.fill();
    c.fillRect(tx-4, ty-h/2, 8, h/2);
  });

  // Water body
  const waterGrad = c.createLinearGradient(0, 80, 0, H);
  waterGrad.addColorStop(0, '#1a4f7a');
  waterGrad.addColorStop(0.3, '#1a3f60');
  waterGrad.addColorStop(1, '#0d2540');
  c.fillStyle = waterGrad;
  c.fillRect(0, 80, W, H-80);

  // Water surface shimmer
  const t = fishingAnimFrame * 0.02;
  c.strokeStyle = 'rgba(100,200,255,0.2)';
  c.lineWidth = 1;
  for (let i=0; i<6; i++) {
    const waveY = 84 + i*8;
    const wavePhase = t + i*0.5;
    c.beginPath();
    for (let wx=0; wx<W; wx+=2) {
      const wy = waveY + Math.sin(wx*0.04 + wavePhase)*2;
      if (wx===0) c.moveTo(wx, wy); else c.lineTo(wx, wy);
    }
    c.stroke();
  }

  // Moon reflection
  const refGrad = c.createLinearGradient(260, 80, 320, H);
  refGrad.addColorStop(0, 'rgba(255,251,224,0.15)');
  refGrad.addColorStop(1, 'rgba(255,251,224,0.02)');
  c.fillStyle = refGrad;
  c.beginPath();
  c.moveTo(285, 80);
  c.lineTo(315, 80);
  c.lineTo(330, H);
  c.lineTo(270, H);
  c.closePath(); c.fill();

  // Background fish (swimming)
  sceneFish.forEach(sf => {
    sf.x += sf.vx;
    if (sf.x < -40) sf.x = W+20;
    if (sf.x > W+40) sf.x = -20;

    const depthAlpha = sf.depth * 0.65;
    const depthScale = sf.depth * 0.6;

    c.save();
    if (sf.flip) {
      c.scale(-1, 1);
      drawFish(c, sf.fishData, -sf.x, sf.y, depthScale, Math.sin(fishingAnimFrame*0.02+sf.x*0.01)*0.05, depthAlpha);
    } else {
      drawFish(c, sf.fishData, sf.x, sf.y, depthScale, Math.sin(fishingAnimFrame*0.02+sf.x*0.01)*0.05, depthAlpha);
    }
    c.restore();
  });

  // Seaweed / reeds
  c.strokeStyle = '#2d6a3a';
  c.lineWidth = 2;
  [[30,H,40],[50,H,30],[320,H,35],[330,H,25]].forEach(([rx,ry,rh]) => {
    c.beginPath();
    c.moveTo(rx, ry);
    c.quadraticCurveTo(rx+8, ry-rh/2, rx, ry-rh);
    c.stroke();
  });

  // Fishing line & bobber (when casting)
  if (FS.phase === 'casting' || FS.phase === 'waiting' || FS.phase === 'biting' || FS.phase === 'reeling') {
    // Line from rod tip to bobber
    const bobX = 200 + Math.sin(t*0.5)*8;
    const bobY = 95 + Math.sin(t*0.8)*2;

    c.strokeStyle = 'rgba(255,255,255,0.6)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(310, 15); // rod tip in scene
    c.quadraticCurveTo(260, 60, bobX, bobY);
    c.stroke();

    // Bobber
    c.fillStyle = '#ff4444';
    c.beginPath(); c.arc(bobX, bobY, 5, 0, Math.PI*2); c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(bobX, bobY-2, 4, Math.PI, 0); c.fill();

    // Ripple around bobber
    const rp = (fishingAnimFrame % 60) / 60;
    c.strokeStyle = `rgba(100,200,255,${0.5-rp*0.5})`;
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(bobX, bobY+2, 8+rp*20, (8+rp*20)*0.3, 0, 0, Math.PI*2); c.stroke();

    // Biting animation
    if (FS.phase === 'biting') {
      const bite = Math.sin(fishingAnimFrame*0.3)*6;
      c.fillStyle = '#ff4444';
      c.beginPath(); c.arc(bobX, bobY+bite, 5, 0, Math.PI*2); c.fill();
      // Splash effects
      c.fillStyle = 'rgba(100,200,255,0.7)';
      for (let sp=0; sp<4; sp++) {
        const sa = fishingAnimFrame*0.4+sp*Math.PI/2;
        const sr = 10+Math.sin(fishingAnimFrame*0.2)*3;
        c.beginPath(); c.arc(bobX+Math.cos(sa)*sr, bobY+Math.sin(sa)*sr*0.3, 2, 0, Math.PI*2); c.fill();
      }
    }
  }

  // Phase-specific overlays
  if (FS.phase === 'idle') {
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.fillRect(0, 70, W, 40);
    c.fillStyle = '#a0e0f0';
    c.font = '11px Nunito,sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🎣 Lempar kail untuk memulai!', W/2, 90);
  }
}

// ────────────────────────────────────────────────────────────
//  FISHING MINI-GAME LOGIC
// ────────────────────────────────────────────────────────────

function openFishingUI(spotId) {
  if (FS.active) return;
  FS.active = true;
  FS.spotId = spotId;
  FS.phase = 'idle';

  const overlay = document.getElementById('fishing-overlay');
  overlay.classList.remove('hidden');

  const spotData = FISHING_SPOTS.find(s => s.id === spotId);
  document.getElementById('fishing-spot-label').textContent = spotData ? spotData.label : '';

  updateBaitSelector();
  updateRodDisplay();
  updateReelSection(false);
  document.getElementById('fishing-status').textContent = 'Pilih umpan dan tekan Lempar!';

  // Pause the main game
  if (typeof GS !== 'undefined') GS.paused = true;

  initSceneFish();

  // Start scene animation
  function loop() {
    renderFishingScene();
    if (FS.active) fishingAnimId = requestAnimationFrame(loop);
  }
  fishingAnimId = requestAnimationFrame(loop);
}

function closeFishingUI() {
  FS.active = false;
  FS.phase = 'idle';
  cancelAnimationFrame(fishingAnimId);

  document.getElementById('fishing-overlay').classList.add('hidden');
  updateReelSection(false);

  if (typeof GS !== 'undefined') GS.paused = false;
  if (typeof showToast !== 'undefined') showToast('🎣 Selesai memancing!', 'info');
}

function castLine() {
  if (FS.phase !== 'idle' && FS.phase !== 'result') return;

  const bait = BAIT_CATALOG[FS.baitId];
  if (!bait) return;

  // Consume bait
  if (FS.baitInventory[FS.baitId] <= 0) {
    document.getElementById('fishing-status').textContent = `❌ Umpan ${bait.name} habis! Beli di toko Pak Ikan.`;
    return;
  }
  FS.baitInventory[FS.baitId]--;
  updateBaitSelector();

  FS.phase = 'casting';
  document.getElementById('fishing-status').textContent = '🎣 Melempar kail... Menunggu ikan...';
  updateReelSection(false);

  // Play cast sound
  if (typeof playTone !== 'undefined') {
    playTone(440, 'sine', 0.1, 0.1);
    setTimeout(()=>playTone(330, 'triangle', 0.15, 0.08), 120);
  }

  // Wait phase — random wait 2-6 seconds
  const waitTime = 2000 + Math.random()*4000;
  FS.phase = 'waiting';

  setTimeout(() => {
    if (!FS.active || FS.phase !== 'waiting') return;

    // Roll for fish
    const fish = rollFish(FS.baitId);
    if (!fish) {
      // Nothing bit — try again automatically
      FS.phase = 'idle';
      document.getElementById('fishing-status').textContent = '💧 Tidak ada yang menggigit... Coba lagi!';
      return;
    }

    // Fish is biting!
    FS.pendingFish = fish;
    FS.phase = 'biting';
    document.getElementById('fishing-status').textContent = `🐟 ADA YANG MENGGIGIT! Tekan SPASI / Tarik sekarang!`;

    // Play bite sound
    if (typeof playTone !== 'undefined') {
      [440,550,660].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.1,0.15),i*80));
    }

    // If player doesn't react in 4 seconds, fish escapes
    FS.biteTimeout = setTimeout(()=>{
      if (FS.phase === 'biting') {
        FS.phase = 'idle';
        document.getElementById('fishing-status').textContent = '😔 Ikannya kabur! Lempar lagi.';
        updateReelSection(false);
      }
    }, 4000);

    // Show reel section
    updateReelSection(true);
    startReel();

  }, waitTime);
}

function startReel() {
  if (!FS.pendingFish) return;

  FS.phase = 'reeling';
  FS.reelProgress = 0;
  FS.reelBar = 50;   // player bar starts center
  FS.reelTarget = 20 + Math.random()*60; // fish zone starts random
  FS.reelDir = 1;
  FS.reelDirTimer = 0;

  // Fish speed depends on rarity (rarer = faster/harder)
  const raritySpeed = { biasa:0.8, langka:1.5, legendaris:2.5 };
  FS.reelSpeed = raritySpeed[FS.pendingFish.rarity] || 1;

  document.getElementById('fishing-status').textContent = '🎣 Tahan ikan di zona hijau!';

  // Reel game loop
  let prevTime = performance.now();
  function reelLoop(now) {
    if (FS.phase !== 'reeling') return;
    const dt = now - prevTime;
    prevTime = now;

    // Move fish zone (AI fish pulling)
    FS.reelDirTimer += dt;
    if (FS.reelDirTimer > 600 + Math.random()*400) {
      FS.reelDir = (Math.random() > 0.5 ? 1 : -1);
      FS.reelDirTimer = 0;
    }
    FS.reelTarget += FS.reelDir * FS.reelSpeed * 0.5;
    FS.reelTarget = Math.max(5, Math.min(75, FS.reelTarget));

    // Bar drifts toward fish zone if not pulling
    FS.reelBar += (FS.reelTarget - FS.reelBar) * 0.015;

    // Progress: increase when bar overlaps fish zone, decrease otherwise
    const overlap = Math.abs(FS.reelBar - FS.reelTarget) < 14;
    FS.reelProgress += overlap ? 1.2 : -0.8;
    FS.reelProgress = Math.max(0, Math.min(100, FS.reelProgress));

    // Update UI
    const fishZone = document.getElementById('reel-fish-zone');
    const reelBar = document.getElementById('reel-bar');
    const outer = document.getElementById('reel-outer');
    if (fishZone && reelBar && outer) {
      const outerW = outer.clientWidth || 320;
      fishZone.style.left = (FS.reelTarget / 100 * outerW) + 'px';
      reelBar.style.left = (FS.reelBar / 100 * outerW - 9) + 'px';
      const progColor = overlap ? '#4caf50' : '#f44336';
      fishZone.style.background = `rgba(${overlap?'64,200,100':'220,60,60'},0.35)`;
    }

    // Check win/fail
    if (FS.reelProgress >= 100) {
      catchFish();
    } else if (FS.reelProgress <= 0 && FS.reelBar < 5) {
      loseFish();
    } else {
      requestAnimationFrame(reelLoop);
    }
  }
  requestAnimationFrame(reelLoop);
}

function pullBar() {
  // Player pulls the bar upward (toward fish zone top)
  if (FS.phase !== 'biting' && FS.phase !== 'reeling') return;

  if (FS.phase === 'biting') {
    clearTimeout(FS.biteTimeout);
    FS.phase = 'reeling';
    startReel();
    return;
  }

  // Boost bar toward fish zone
  FS.reelBar -= 8;
  FS.reelBar = Math.max(0, FS.reelBar);

  if (typeof playTone !== 'undefined') playTone(300+FS.reelProgress*2, 'triangle', 0.06, 0.08);
}

function catchFish() {
  FS.phase = 'result';
  updateReelSection(false);

  const fish = FS.pendingFish;
  FS.pendingFish = null;
  FS.totalCaught++;
  if (fish.rarity === 'legendaris') FS.legendsCaught++;

  // Spawn jump animation in world
  const spot = FISHING_SPOTS.find(s=>s.id===FS.spotId);
  if (spot && typeof spawnFishJump !== 'undefined') {
    spawnFishJump(fish, spot.tx*32+16, spot.ty*32+16);
  }

  // Sound
  if (typeof playTone !== 'undefined') {
    if (fish.rarity === 'legendaris') {
      [440,550,660,880,1100].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.15,0.18),i*100));
    } else if (fish.rarity === 'langka') {
      [440,550,660,440].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.12,0.15),i*80));
    } else {
      playTone(440,'sine',0.1,0.12);
    }
  }

  // Show catch popup
  showCatchPopup(fish);
}

function loseFish() {
  FS.phase = 'idle';
  updateReelSection(false);
  FS.pendingFish = null;
  document.getElementById('fishing-status').textContent = '😔 Ikannya lolos! Talinya terlalu kendur. Coba lagi!';
  if (typeof playTone !== 'undefined') [220,196,165].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.1,0.12),i*80));
}

// ────────────────────────────────────────────────────────────
//  CATCH POPUP
// ────────────────────────────────────────────────────────────

function showCatchPopup(fish) {
  const popup = document.getElementById('catch-popup');
  popup.classList.remove('hidden');

  // Set border color by rarity
  const rarityColors = {
    biasa: '#90c090',
    langka: '#60a0ff',
    legendaris: '#ffd700',
  };
  popup.querySelector('#catch-popup-inner').style.borderColor = rarityColors[fish.rarity] || '#fff';

  // Badge
  const badge = document.getElementById('catch-rarity-badge');
  badge.textContent = fish.rarity === 'biasa' ? '⚪ BIASA' : fish.rarity === 'langka' ? '🔵 LANGKA' : '🌟 LEGENDARIS';
  badge.className = `badge-${fish.rarity}`;

  // Draw fish on popup canvas
  const fc = document.getElementById('catch-fish-canvas');
  const c = fc.getContext('2d');
  c.clearRect(0, 0, 160, 120);
  // Animated spinning
  let angle = 0;
  let popupAnim = null;
  function animFish() {
    c.clearRect(0, 0, 160, 120);
    // Background water effect
    const bg = c.createRadialGradient(80, 60, 10, 80, 60, 70);
    bg.addColorStop(0, 'rgba(20,80,140,0.4)');
    bg.addColorStop(1, 'transparent');
    c.fillStyle = bg; c.fillRect(0,0,160,120);
    // Glow for legendary
    if (fish.rarity === 'legendaris') {
      c.fillStyle = `rgba(255,215,0,${0.1+0.05*Math.sin(angle*2)})`;
      c.beginPath(); c.arc(80, 60, 55+Math.sin(angle)*5, 0, Math.PI*2); c.fill();
    }
    angle += 0.04;
    const bobY = Math.sin(angle*1.5)*4;
    drawFish(c, fish, 80, 60+bobY, 1.6, Math.sin(angle*0.5)*0.08, 1);
    popupAnim = requestAnimationFrame(animFish);
  }
  animFish();

  document.getElementById('catch-fish-name').textContent = fish.name;
  document.getElementById('catch-fish-desc').textContent = fish.desc;
  document.getElementById('catch-fish-value').textContent = `💰 Nilai: Rp ${fish.basePrice.toLocaleString('id-ID')}`;

  document.getElementById('catch-ok-btn').onclick = () => {
    cancelAnimationFrame(popupAnim);
    popup.classList.add('hidden');
    addFishToInventory(fish);
    FS.phase = 'idle';
    document.getElementById('fishing-status').textContent = `✅ ${fish.name} disimpan! Lempar lagi.`;
  };
  document.getElementById('catch-sell-btn').onclick = () => {
    cancelAnimationFrame(popupAnim);
    popup.classList.add('hidden');
    FS.gold += fish.basePrice;
    FS.totalSold++;
    FS.phase = 'idle';
    document.getElementById('fishing-status').textContent = `💰 Dijual! +Rp ${fish.basePrice.toLocaleString('id-ID')}`;
    if (typeof showToast !== 'undefined') showToast(`💰 ${fish.name} dijual: +Rp ${fish.basePrice.toLocaleString('id-ID')}`, 'success');
  };
}

function addFishToInventory(fish) {
  const existing = FS.caughtFish.find(f => f.fishId === fish.id);
  if (existing) {
    existing.count++;
    existing.totalValue += fish.basePrice;
  } else {
    FS.caughtFish.push({ fishId: fish.id, fishData: fish, count: 1, totalValue: fish.basePrice });
  }
}

// ────────────────────────────────────────────────────────────
//  FISH INVENTORY UI
// ────────────────────────────────────────────────────────────

function openFishInventory() {
  const overlay = document.getElementById('fish-inv-overlay');
  overlay.classList.remove('hidden');
  renderFishInventory();
}

function renderFishInventory() {
  document.getElementById('fish-gold').textContent = 'Rp ' + FS.gold.toLocaleString('id-ID');
  document.getElementById('fish-total-caught').textContent = FS.totalCaught;
  document.getElementById('fish-legend-count').textContent = FS.legendsCaught;

  const grid = document.getElementById('fish-inv-grid');
  grid.innerHTML = '';

  if (FS.caughtFish.length === 0) {
    grid.innerHTML = '<div style="color:#60808a;grid-column:1/-1;text-align:center;padding:20px">Belum ada ikan. Ayo memancing! 🎣</div>';
    return;
  }

  FS.caughtFish.forEach(entry => {
    const card = document.createElement('div');
    card.className = `fish-inv-card rarity-${entry.fishData.rarity}`;

    // Mini fish canvas
    const mc = document.createElement('canvas');
    mc.width = 70; mc.height = 50;
    const mctx = mc.getContext('2d');
    mctx.fillStyle = 'rgba(0,30,60,0.3)';
    mctx.fillRect(0,0,70,50);
    drawFish(mctx, entry.fishData, 35, 28, 0.9, 0, 1);
    card.appendChild(mc);

    const name = document.createElement('div');
    name.className = 'fish-card-name';
    name.textContent = entry.fishData.name;
    card.appendChild(name);

    const count = document.createElement('div');
    count.className = 'fish-card-count';
    count.textContent = `×${entry.count}`;
    card.appendChild(count);

    const val = document.createElement('div');
    val.className = 'fish-card-value';
    val.textContent = 'Rp ' + entry.totalValue.toLocaleString('id-ID');
    card.appendChild(val);

    grid.appendChild(card);
  });
}

function sellAllFish() {
  if (FS.caughtFish.length === 0) {
    if (typeof showToast !== 'undefined') showToast('Tidak ada ikan untuk dijual!', 'warning');
    return;
  }
  let total = 0;
  FS.caughtFish.forEach(e => { total += e.totalValue; FS.totalSold += e.count; });
  FS.gold += total;
  FS.caughtFish = [];

  if (typeof showToast !== 'undefined') showToast(`💰 Semua ikan terjual! +Rp ${total.toLocaleString('id-ID')}`, 'success');
  if (typeof sfxGood !== 'undefined') sfxGood();
  renderFishInventory();
}

// ────────────────────────────────────────────────────────────
//  FISH SHOP UI
// ────────────────────────────────────────────────────────────

function openFishShop() {
  const overlay = document.getElementById('fish-shop-overlay');
  overlay.classList.remove('hidden');
  renderFishShop();
  if (typeof GS !== 'undefined') GS.paused = true;
}

function renderFishShop() {
  document.getElementById('shop-gold-display').textContent = 'Rp ' + FS.gold.toLocaleString('id-ID');

  const stock = document.getElementById('fish-shop-stock');
  stock.innerHTML = '';

  // Bait items
  Object.values(BAIT_CATALOG).forEach(bait => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    const owned = FS.baitInventory[bait.id] || 0;
    div.innerHTML = `
      <div class="shop-item-name">${bait.emoji} ${bait.name}</div>
      <div class="shop-item-desc">${bait.desc}</div>
      <div class="shop-item-price">Rp ${bait.price.toLocaleString('id-ID')} / buah</div>
      <div class="shop-item-owned">Dimiliki: ${owned}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${[1,5,10].map(qty => `
          <button class="shop-buy-btn" onclick="buyBait('${bait.id}',${qty})"
            ${FS.gold < bait.price*qty ? 'disabled' : ''}>
            Beli ${qty}
          </button>
        `).join('')}
      </div>
    `;
    stock.appendChild(div);
  });

  // Divider
  const div2 = document.createElement('div');
  div2.style.cssText = 'grid-column:1/-1;border-top:1px solid rgba(255,255,255,0.1);margin:4px 0;';
  stock.appendChild(div2);

  // Rod items
  Object.values(ROD_CATALOG).forEach(rod => {
    const owned = FS.ownedRods.has(rod.id);
    const equipped = FS.rodId === rod.id;
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <div class="shop-item-name">${rod.emoji} ${rod.name}</div>
      <div class="shop-item-desc">${rod.desc}</div>
      ${owned ? '' : `<div class="shop-item-price">Rp ${rod.price.toLocaleString('id-ID')}</div>`}
      ${owned ? `<div class="shop-item-owned">✅ ${equipped ? 'Dipakai' : 'Dimiliki'}</div>` : ''}
      ${!owned ? `<button class="shop-buy-btn" onclick="buyRod('${rod.id}')" ${FS.gold < rod.price ? 'disabled' : ''}>Beli</button>` : ''}
      ${owned && !equipped ? `<button class="shop-buy-btn" onclick="equipRod('${rod.id}');renderFishShop()">Pakai</button>` : ''}
    `;
    stock.appendChild(div);
  });
}

function buyBait(baitId, qty) {
  const bait = BAIT_CATALOG[baitId];
  const cost = bait.price * qty;
  if (FS.gold < cost) { if (typeof showToast!=='undefined') showToast('Uang tidak cukup!','error'); return; }
  FS.gold -= cost;
  FS.baitInventory[baitId] = (FS.baitInventory[baitId] || 0) + qty;
  if (typeof showToast!=='undefined') showToast(`✅ Beli ${qty}x ${bait.name}!`, 'success');
  if (typeof sfxGood !== 'undefined') sfxGood();
  renderFishShop();
  updateBaitSelector();
}

function buyRod(rodId) {
  const rod = ROD_CATALOG[rodId];
  if (FS.gold < rod.price) { if (typeof showToast!=='undefined') showToast('Uang tidak cukup!','error'); return; }
  FS.gold -= rod.price;
  FS.ownedRods.add(rodId);
  FS.rodId = rodId;
  if (typeof showToast!=='undefined') showToast(`🎣 ${rod.name} dibeli & dipakai!`, 'success');
  if (typeof sfxGood !== 'undefined') sfxGood();
  renderFishShop();
  updateRodDisplay();
}

function equipRod(rodId) {
  FS.rodId = rodId;
  updateRodDisplay();
  if (typeof showToast!=='undefined') showToast(`🎣 ${ROD_CATALOG[rodId].name} dipakai!`, 'success');
}

// ────────────────────────────────────────────────────────────
//  UI HELPERS
// ────────────────────────────────────────────────────────────

function updateBaitSelector() {
  const sel = document.getElementById('bait-selector');
  if (!sel) return;
  sel.innerHTML = '';
  Object.values(BAIT_CATALOG).forEach(bait => {
    const btn = document.createElement('button');
    const qty = FS.baitInventory[bait.id] || 0;
    btn.className = `bait-btn ${FS.baitId === bait.id ? 'active' : ''} ${qty === 0 ? 'empty' : ''}`;
    btn.innerHTML = `${bait.emoji} ${bait.name} <span style="color:#ffd700">(${qty})</span>`;
    btn.onclick = () => {
      if (qty > 0) {
        FS.baitId = bait.id;
        updateBaitSelector();
      }
    };
    sel.appendChild(btn);
  });
}

function updateRodDisplay() {
  const el = document.getElementById('rod-display');
  if (!el) return;
  const rod = ROD_CATALOG[FS.rodId];
  el.textContent = rod ? `${rod.emoji} ${rod.name}` : '🎣 Joran Bambu';
}

function updateReelSection(show) {
  const el = document.getElementById('reel-section');
  if (!el) return;
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

// ────────────────────────────────────────────────────────────
//  EVENT BINDINGS
// ────────────────────────────────────────────────────────────

function bindFishingEvents() {
  document.getElementById('btn-cast').onclick = castLine;
  document.getElementById('btn-stop-fish').onclick = closeFishingUI;
  document.getElementById('reel-pull-btn').onclick = pullBar;
  document.getElementById('btn-sell-all').onclick = sellAllFish;

  // Spacebar support for reel
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && FS.active) {
      e.preventDefault();
      pullBar();
    }
    if (e.code === 'KeyF' && !FS.active) {
      // F key opens fishing if near a spot
      checkFishingSpotProximity();
    }
  });

  // Close panels
  document.querySelectorAll('#fish-inv-overlay .close-panel, #fish-shop-overlay .close-panel').forEach(btn => {
    btn.onclick = () => {
      btn.closest('.panel-overlay').classList.add('hidden');
      if (typeof GS !== 'undefined') GS.paused = false;
    };
  });
}

// ────────────────────────────────────────────────────────────
//  NPC: PAK IKAN (lake merchant)
// ────────────────────────────────────────────────────────────

const PAK_IKAN_NPC = {
  id:       'pak_ikan',
  name:     'Pak Ikan',
  emoji:    '🧑‍🌾',
  color:    '#1565c0',
  x:        23,   // tile x (near lake merchant stall)
  y:        7,    // tile y
  zone:     'lake',
  dialog:   [
    'Halo! Selamat datang di Danau Nusantara!',
    'Di sini banyak ikan langka dan legendaris!',
    'Beli umpan dan joran terbaik di toko saya.',
  ],
  questIds: [],
  isFishMerchant: true,
};

// ────────────────────────────────────────────────────────────
//  FISHING SPOT PROXIMITY CHECK
// ────────────────────────────────────────────────────────────

let nearFishingSpot = null;

function checkFishingSpotProximity() {
  if (typeof player === 'undefined') return;

  let nearest = null;
  let nearDist = FISHING_SPOT_RADIUS;
  FISHING_SPOTS.forEach(spot => {
    const sx = spot.tx * 32 + 16;
    const sy = spot.ty * 32 + 16;
    const dx = sx - player.x;
    const dy = sy - player.y;
    const d = Math.sqrt(dx*dx+dy*dy);
    if (d < nearDist) { nearest = spot; nearDist = d; }
  });

  nearFishingSpot = nearest;

  if (nearest && !FS.active) {
    openFishingUI(nearest.id);
  }
}

// ────────────────────────────────────────────────────────────
//  RENDERING HOOK — fishing spots on world map
// ────────────────────────────────────────────────────────────

/**
 * Called from the patched renderGame() to draw fishing spot markers
 * and active fish jumps on the world canvas.
 */
function renderFishingLayer(cx, cy) {
  const t = Date.now() * 0.001;

  // Draw fishing spot markers
  FISHING_SPOTS.forEach(spot => {
    const sx = spot.tx * 32 + 16 - cx;
    const sy = spot.ty * 32 + 16 - cy;
    if (sx < -40 || sy < -40 || sx > canvas.width+40 || sy > canvas.height+40) return;

    // Pulsing ring
    const pulse = 0.6 + 0.4*Math.sin(t*2 + spot.tx);
    ctx.strokeStyle = `rgba(100,200,255,${pulse*0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 18+Math.sin(t*3+spot.ty)*4, 0, Math.PI*2); ctx.stroke();

    // Fishing emoji
    ctx.font = '16px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎣', sx, sy-8);

    // Label
    if (nearFishingSpot && nearFishingSpot.id === spot.id) {
      ctx.font = 'bold 9px Nunito,sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('[F] Pancing', sx, sy+12);
    }
  });

  // Draw fish jumps
  updateAndDrawFishJumps(cx, cy);

  // Draw fishing spot proximity indicator
  if (nearFishingSpot && !FS.active) {
    const spot = nearFishingSpot;
    const sx = spot.tx*32+16-cx;
    const sy = spot.ty*32+16-cy;
    ctx.fillStyle = 'rgba(255,215,0,0.15)';
    ctx.beginPath(); ctx.arc(sx, sy, FISHING_SPOT_RADIUS, 0, Math.PI*2); ctx.fill();
  }
}

// ────────────────────────────────────────────────────────────
//  PATCH INTO MAIN GAME ENGINE
// ────────────────────────────────────────────────────────────

/**
 * We patch startGame(), renderGame(), checkNPCProximity(), and
 * interactWithNPC() to hook our fishing system in.
 * The patches are applied once when this script loads, after a
 * short delay to ensure game.js has fully initialised.
 */
function applyFishingPatches() {
  // 1) Patch startGame to add lake & fishing NPC
  const _originalStartGame = window.startGame;
  window.startGame = function() {
    _originalStartGame();

    // Patch the map
    patchMapWithLake(window.gameMap);

    // Add Pak Ikan NPC
    window.npcs.push({ ...PAK_IKAN_NPC });

    showToast('🎣 Danau baru terbuka! Temukan Pak Ikan di danau barat laut!', 'info', 5000);
  };

  // 2) Patch renderGame to draw fishing layer
  const _originalRenderGame = window.renderGame;
  window.renderGame = function(cx, cy) {
    _originalRenderGame(cx, cy);
    renderFishingLayer(cx, cy);
  };

  // 3) Patch checkNPCProximity to also check fishing spots
  const _originalCheckNPC = window.checkNPCProximity;
  window.checkNPCProximity = function() {
    _originalCheckNPC();

    // Check fishing spot proximity
    if (!FS.active) {
      let nearest = null;
      let nearDist = FISHING_SPOT_RADIUS;
      FISHING_SPOTS.forEach(spot => {
        const sx = spot.tx*32+16;
        const sy = spot.ty*32+16;
        const dx = sx - player.x;
        const dy = sy - player.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < nearDist) { nearest = spot; nearDist = d; }
      });
      nearFishingSpot = nearest;

      const prompt = document.getElementById('interact-prompt');
      if (nearest && prompt) {
        prompt.classList.remove('hidden');
        prompt.textContent = 'Tekan F / 🎣 untuk memancing';
      }
    }
  };

  // 4) Patch interactWithNPC to handle Pak Ikan specially
  const _originalInteract = window.interactWithNPC;
  window.interactWithNPC = function(npc) {
    if (npc.isFishMerchant) {
      GS.paused = true;
      openDialog(npc, npc.dialog, [
        { text:'🏪 Buka Toko', type:'good', callback: () => { openFishShop(); } },
        { text:'🐟 Lihat Ikanku', callback: () => { openFishInventory(); } },
        { text:'💬 Ngobrol saja', callback: () => { GS.paused = false; } },
      ]);
      return;
    }
    _originalInteract(npc);
  };

  // 5) Keyboard F key for fishing
  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.key === 'f' || e.key === 'F') && nearFishingSpot && !FS.active && typeof GS !== 'undefined' && GS.phase === 'game' && !GS.paused) {
      openFishingUI(nearFishingSpot.id);
    }
  });

  // 6) Add fishing to HUD — fish inventory button
  const hudBtns = document.getElementById('hud-buttons');
  if (hudBtns) {
    const fishBtn = document.createElement('button');
    fishBtn.className = 'hud-btn';
    fishBtn.id = 'btn-fish-inv';
    fishBtn.title = 'Kantong Ikan';
    fishBtn.textContent = '🐟';
    fishBtn.onclick = () => openFishInventory();
    hudBtns.insertBefore(fishBtn, hudBtns.firstChild);
  }
}

// ────────────────────────────────────────────────────────────
//  INITIALISE
// ────────────────────────────────────────────────────────────
(function init() {
  // Build UI elements
  buildFishingUI();

  // Apply patches after a short delay to ensure game.js is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFishingPatches);
  } else {
    // game.js startGame is called later (on button click), so we just need
    // to patch ASAP — a microtask is enough
    Promise.resolve().then(applyFishingPatches);
  }
})();
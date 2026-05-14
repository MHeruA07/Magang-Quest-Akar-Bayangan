/* ============================================================
   MAGANG QUEST — patch.js  v3.0
   ============================================================
   CARA PASANG:
   1. Simpan file ini sebagai 'patch.js' di folder yang sama
      dengan index.html, game.js, fishing.js
   2. Tambahkan di index.html SETELAH <script src="fishing.js">:
        <script src="patch.js"></script>
   3. Rename gambar minimarket jadi 'minimarket.png' dan
      taruh di folder yang sama dengan index.html
   ============================================================ */

'use strict';

/* ── Jalankan setelah semua file di-load ── */
window.addEventListener('load', () => setTimeout(applyAllPatches, 500));

/* ============================================================
   MASTER PATCH RUNNER
============================================================ */
function applyAllPatches() {
  try {
    P1_fixStoryIntroBug();
    P2_fixInteractPrompt();
    P3_enhanceDialogPortrait();
    P4_addEnemySystem();
    P5_addWalkingNPCs();
    P6_addEmoteWheel();
    P7_addNPCVoice();
    P8_improveQuestSystem();
    P9_unifyMoney();
    P10_easierFishing();
    P11_minimarketImageAndBuilding();
    P12_addMiniGameMinimarket();
    console.log('✅ [PATCH v3.0] Semua patch berhasil!');
  } catch(err) {
    console.warn('⚠️ [PATCH] Error:', err);
  }
}

/* ============================================================
   P1 — FIX STORY INTRO BUG
   Masalah: klik cepat menyebabkan banyak setInterval berjalan
   bersamaan, teks jadi kacau/ngawur
============================================================ */
function P1_fixStoryIntroBug() {
  let _timer = null;
  let _typing = false;
  let _fullText = '';

  /* Fungsi showStoryDialog yang sudah diperbaiki */
  function safeShowStoryDialog() {
    // Hentikan timer lama
    if (_timer) { clearInterval(_timer); _timer = null; }

    const d = (typeof STORY_DIALOG !== 'undefined') ? STORY_DIALOG[storyDialogIdx] : null;
    if (!d) { if (typeof startGame !== 'undefined') startGame(); return; }

    const speakerEl = document.getElementById('story-speaker');
    const textEl    = document.getElementById('story-text');
    if (!speakerEl || !textEl) return;

    speakerEl.textContent = d.speaker;
    textEl.textContent = '';
    _fullText = d.text;
    _typing = true;
    let pos = 0;

    _timer = setInterval(() => {
      if (pos < _fullText.length) {
        /* Gunakan substring, BUKAN += agar tidak menumpuk */
        textEl.textContent = _fullText.substring(0, pos + 1);
        pos++;
      } else {
        clearInterval(_timer);
        _timer = null;
        _typing = false;
      }
    }, 28);

    /* Progress bar */
    const pct = (storyDialogIdx / STORY_DIALOG.length) * 100;
    const fill = document.getElementById('story-progress-fill');
    if (fill) fill.style.width = pct + '%';

    /* Sinkronisasi panel */
    const pi = Math.floor(storyDialogIdx / Math.max(1, STORY_DIALOG.length / STORY_PANELS.length));
    document.querySelectorAll('.story-panel').forEach((p, idx) => {
      p.classList.toggle('active', idx === Math.min(pi, STORY_PANELS.length - 1));
    });
  }

  /* Ganti tombol "Selanjutnya" */
  const origBtn = document.getElementById('story-next-btn');
  if (origBtn) {
    const newBtn = origBtn.cloneNode(true);
    origBtn.parentNode.replaceChild(newBtn, origBtn);

    newBtn.onclick = () => {
      if (_typing) {
        /* Skip ke akhir teks */
        if (_timer) { clearInterval(_timer); _timer = null; }
        _typing = false;
        const textEl = document.getElementById('story-text');
        if (textEl) textEl.textContent = _fullText;
        return;
      }
      storyDialogIdx++;
      safeShowStoryDialog();
    };
  }

  /* Ganti tombol "Mulai Petualangan" */
  const origStart = document.getElementById('start-story-btn');
  if (origStart) {
    const newStart = origStart.cloneNode(true);
    origStart.parentNode.replaceChild(newStart, origStart);

    newStart.onclick = () => {
      if (typeof initAudio !== 'undefined') initAudio();
      const nameInput = document.getElementById('char-name');
      if (typeof GS !== 'undefined') {
        GS.playerName = (nameInput ? nameInput.value.trim() : '') || 'Mahasiswa';
        if (typeof getCurrentCharacter !== 'undefined') {
          const ch = getCurrentCharacter();
          GS.gender = ch.gender;
        }
      }

      document.getElementById('intro-screen').classList.remove('active');
      const ss = document.getElementById('story-screen');
      if (ss) ss.style.display = 'flex';

      /* Bangun ulang panels */
      const wrap = document.getElementById('story-panels');
      if (wrap) { wrap.innerHTML = ''; if (typeof buildStoryPanels !== 'undefined') buildStoryPanels(); }

      storyDialogIdx = 0;
      if (_timer) { clearInterval(_timer); _timer = null; }
      _typing = false;
      safeShowStoryDialog();

      if (typeof sfxQuest !== 'undefined') sfxQuest();

      /* Tambahkan gambar minimarket di panel pertama */
      setTimeout(() => addImageToStoryPanel(), 50);
    };
  }

  /* Expose agar bisa dipanggil dari luar jika perlu */
  window._safeShowStoryDialog = safeShowStoryDialog;
}

/* Tambahkan gambar minimarket ke story panel */
function addImageToStoryPanel() {
  const panels = document.querySelectorAll('.story-panel');
  if (!panels.length) return;
  const firstPanel = panels[0];
  const artEl = firstPanel.querySelector('.story-panel-art');
  if (!artEl) return;

  /* Coba ganti emoji dengan gambar */
  const img = new Image();
  img.src = 'minimarket.png';
  img.onload = () => {
    artEl.innerHTML = '';
    img.style.cssText = 'width:120px;height:auto;border-radius:12px;box-shadow:0 0 20px rgba(240,192,64,0.5);';
    artEl.appendChild(img);
    artEl.style.fontSize = 'inherit';
  };
  img.onerror = () => { /* gambar tidak ada, biarkan emoji */ };
}

/* ============================================================
   P2 — FIX INTERACT PROMPT
   Teks prompt disesuaikan dengan konteks:
   NPC → "Tekan E untuk ngobrol"
   Musuh → "Tekan E untuk serang!"
   Toko → "Tekan E untuk masuk"
   (Fishing.js sudah handle fishing prompt)
============================================================ */
function P2_fixInteractPrompt() {
  const _origCheckNPC = window.checkNPCProximity;
  if (!_origCheckNPC) return;

  window.checkNPCProximity = function() {
    _origCheckNPC();

    const prompt = document.getElementById('interact-prompt');
    if (!prompt) return;

    /* Prioritas: Musuh > NPC > Toko */
    const nearEnemy = _patchState.enemies.find(e => {
      if (!e.alive || typeof player === 'undefined') return false;
      const dx = e.wx - player.x, dy = e.wy - player.y;
      return Math.sqrt(dx*dx+dy*dy) < 60;
    });

    if (nearEnemy) {
      prompt.classList.remove('hidden');
      prompt.textContent = '⚔️ Tekan E / 💬 untuk menyerang penjahat!';
      prompt.style.color = '#ff4444';
      _patchState.nearEnemy = nearEnemy;
      return;
    }
    _patchState.nearEnemy = null;
    prompt.style.color = '';

    /* NPC normal */
    if (typeof GS !== 'undefined' && GS.nearNPC) {
      prompt.classList.remove('hidden');
      const isShopkeeper = GS.nearNPC.id === 'pak_rudi_mini' || GS.nearNPC.id === 'pak_ikan';
      if (isShopkeeper) {
        prompt.textContent = `🏪 Tekan E / 💬 untuk bicara dengan ${GS.nearNPC.name}`;
      } else {
        prompt.textContent = `💬 Tekan E / 💬 untuk ngobrol dengan ${GS.nearNPC.name}`;
      }
    }
  };

  /* Patch keyboard E untuk tangani musuh juga */
  document.addEventListener('keydown', e => {
    if (e.key === 'e' || e.key === 'E') {
      if (_patchState.nearEnemy && typeof GS !== 'undefined' && !GS.paused) {
        openCombatUI(_patchState.nearEnemy);
      }
    }
  });
}

/* ============================================================
   P3 — ENHANCE DIALOG PORTRAIT
   Menambahkan canvas portrait karakter NPC di dialog box
============================================================ */
function P3_enhanceDialogPortrait() {
  /* Tambahkan canvas portrait di dalam dialog-portrait */
  const portrait = document.getElementById('dialog-portrait');
  if (!portrait) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'dialog-portrait-canvas';
  canvas.width = 60;
  canvas.height = 70;
  canvas.style.cssText = 'display:block;margin:0 auto;';
  portrait.innerHTML = '';
  portrait.appendChild(canvas);

  /* Patch openDialog untuk menggambar portrait */
  const _origOpenDialog = window.openDialog;
  if (!_origOpenDialog) return;

  window.openDialog = function(npc, lines, choices) {
    _origOpenDialog(npc, lines, choices);
    drawNPCPortrait(npc);
    /* Mainkan suara NPC jika ada */
    if (lines && lines.length > 0) {
      speakNPC(lines[0], npc.name);
    }
  };
}

function drawNPCPortrait(npc) {
  const canvas = document.getElementById('dialog-portrait-canvas');
  if (!canvas) return;
  const c = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  c.clearRect(0, 0, w, h);

  const cx = w / 2, cy = h * 0.6;
  const color = npc.color || '#2196f3';

  /* Lingkaran latar belakang */
  const grad = c.createRadialGradient(cx, cy, 2, cx, cy, w * 0.6);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, 'transparent');
  c.fillStyle = grad;
  c.beginPath(); c.arc(cx, cy - 10, w * 0.55, 0, Math.PI * 2); c.fill();

  /* Badan */
  c.fillStyle = color;
  c.beginPath(); c.roundRect(cx-9, cy-12, 18, 16, [3, 3, 5, 5]); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.beginPath(); c.roundRect(cx-9, cy-12, 18, 5, [3, 3, 0, 0]); c.fill();

  /* Kaki */
  c.fillStyle = '#455a64';
  c.beginPath(); c.roundRect(cx-7, cy+4, 5, 10, 2); c.fill();
  c.beginPath(); c.roundRect(cx+2, cy+4, 5, 10, 2); c.fill();

  /* Kepala */
  c.fillStyle = '#fdbcb4';
  c.beginPath(); c.arc(cx, cy - 20, 11, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.06)';
  c.beginPath(); c.arc(cx + 2, cy - 18, 9, 0, Math.PI * 2); c.fill();

  /* Emoji wajah */
  c.font = '13px serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(npc.emoji || '😊', cx, cy - 20);

  /* Rambut sederhana */
  c.fillStyle = '#222';
  c.beginPath(); c.roundRect(cx - 11, cy - 30, 22, 12, [8, 8, 0, 0]); c.fill();

  /* Frame */
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.beginPath(); c.roundRect(1, 1, w - 2, h - 2, 8); c.stroke();
}

/* ============================================================
   P4 — SISTEM MUSUH & PERTEMPURAN
   Villain/preman bisa diserang untuk menyelesaikan misi harian
============================================================ */

/* State global patch */
const _patchState = {
  nearEnemy: null,
  enemies: [],
  walkNPCs: [],
  emoteActive: false,
  emoteTimer: null,
  playerEmote: null,
};

const ENEMY_DATA_LIST = [
  {
    id: 'preman_pasar', name: 'Preman Pasar', emoji: '😈',
    color: '#c62828', wx: 52 * 32 + 16, wy: 76 * 32 + 16,
    hp: 3, maxHp: 3, alive: true,
    reward: { money: 150, integrity: 5, shadow: -5, trust: 5 },
    questId: 'dq3',
    dialog: 'Hahalah! Berani kamu melawan saya di sini?!'
  },
  {
    id: 'preman_bayangan', name: 'Penjahat Bayangan', emoji: '🦹',
    color: '#4a148c', wx: 95 * 32 + 16, wy: 85 * 32 + 16,
    hp: 5, maxHp: 5, alive: true,
    reward: { money: 500, integrity: 10, shadow: -10, trust: 10 },
    questId: 'mq10',
    dialog: 'Kamu tidak tahu siapa kami! Akar Bayangan tidak bisa dihentikan!'
  },
  {
    id: 'oknum_koruptor', name: 'Oknum Koruptor', emoji: '🤑',
    color: '#e65100', wx: 70 * 32 + 16, wy: 31 * 32 + 16,
    hp: 4, maxHp: 4, alive: true,
    reward: { money: 300, integrity: 15, shadow: -12, trust: 15 },
    questId: 'mq6',
    dialog: 'Uang bisa beli segalanya... termasuk diammu!'
  },
];

function P4_addEnemySystem() {
  _patchState.enemies = ENEMY_DATA_LIST.map(e => ({ ...e }));

  /* Buat UI pertempuran */
  buildCombatUI();

  /* Hook render game untuk gambar musuh */
  const _origRender = window.renderGame;
  if (_origRender) {
    window.renderGame = function(cx, cy) {
      _origRender(cx, cy);
      drawEnemies(cx, cy);
    };
  }

  /* Respawn musuh tiap hari baru */
  const _origEndDay = window.endDay;
  if (_origEndDay) {
    window.endDay = function() {
      _origEndDay();
      _patchState.enemies.forEach(e => {
        e.alive = true;
        e.hp = e.maxHp;
      });
    };
  }
}

function drawEnemies(cx, cy) {
  if (typeof ctx === 'undefined') return;
  const t = Date.now() * 0.003;

  _patchState.enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const px = enemy.wx - cx;
    const py = enemy.wy - cy;
    if (px < -60 || py < -60 || px > (canvas ? canvas.width : 800) + 60) return;

    const bob = Math.sin(t + enemy.wx * 0.01) * 2;
    ctx.save();
    ctx.translate(px, py + bob);

    /* Shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 16, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

    /* Tubuh merah/jahat */
    ctx.fillStyle = enemy.color;
    ctx.beginPath(); ctx.roundRect(-10, -6, 20, 18, [3, 3, 5, 5]); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.roundRect(-10, -6, 20, 6, [3, 3, 0, 0]); ctx.fill();

    /* Kaki */
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.roundRect(-7, 12, 5, 10, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 12, 5, 10, 2); ctx.fill();

    /* Kepala */
    ctx.fillStyle = '#e0b090';
    ctx.beginPath(); ctx.arc(0, -16, 11, 0, Math.PI * 2); ctx.fill();

    /* Wajah emoji */
    ctx.font = '14px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(enemy.emoji, 0, -16);

    /* Rambut berantakan */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-11, -22); ctx.lineTo(-7, -30); ctx.lineTo(-2, -23);
    ctx.lineTo(2, -32); ctx.lineTo(7, -23); ctx.lineTo(11, -27);
    ctx.lineTo(13, -22); ctx.lineTo(-11, -22); ctx.closePath(); ctx.fill();

    /* Nama & bar HP */
    const nameW = 70;
    ctx.fillStyle = 'rgba(200,0,0,0.85)';
    ctx.beginPath(); ctx.roundRect(-nameW/2, -46, nameW, 13, 4); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px Nunito, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(enemy.name, 0, -40);

    /* HP bar */
    const barW = 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(-barW/2, -58, barW, 6);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-barW/2, -58, barW * (enemy.hp / enemy.maxHp), 6);

    /* Indikator "!" jika player dekat */
    if (_patchState.nearEnemy && _patchState.nearEnemy.id === enemy.id) {
      const bScale = 1 + Math.sin(Date.now() * 0.007) * 0.1;
      ctx.save(); ctx.scale(bScale, bScale);
      ctx.fillStyle = '#ff1744';
      ctx.beginPath(); ctx.arc(0, -68, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚔', 0, -68);
      ctx.restore();
    }

    ctx.restore();
  });
}

/* ── UI Pertempuran ────────────────────────────────── */
function buildCombatUI() {
  const div = document.createElement('div');
  div.id = 'combat-overlay';
  div.className = 'hidden';
  div.innerHTML = `
    <div id="combat-box">
      <div id="combat-title">⚔️ PERTARUNGAN!</div>
      <div id="combat-enemy-info">
        <span id="combat-enemy-emoji" style="font-size:32px"></span>
        <span id="combat-enemy-name" style="font-size:16px;margin-left:10px"></span>
      </div>
      <div id="combat-enemy-dialog" style="font-size:12px;color:#ffcc80;margin:8px 0;font-style:italic;"></div>
      <div class="combat-bars">
        <div>
          <div style="font-size:11px;color:#aaa;margin-bottom:3px">HP Musuh</div>
          <div class="combat-bar-bg"><div id="combat-enemy-bar" class="combat-bar enemy-bar"></div></div>
        </div>
        <div>
          <div style="font-size:11px;color:#aaa;margin-bottom:3px">Serangan Kamu</div>
          <div class="combat-bar-bg"><div id="combat-atk-bar" class="combat-bar atk-bar"></div></div>
        </div>
      </div>
      <div id="combat-hint" style="font-size:11px;color:#80d8ff;margin:8px 0;">
        Klik/tekan SPASI berulang kali untuk menyerang!
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:8px">
        <button id="combat-attack-btn" class="big-btn" style="background:linear-gradient(135deg,#c62828,#e53935);font-size:14px;padding:10px 24px;">
          ⚔️ SERANG!
        </button>
        <button id="combat-flee-btn" class="big-btn" style="background:rgba(0,0,0,0.5);font-size:12px;padding:10px 18px;">
          🏃 Kabur
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  let atkProgress = 0;
  let combatActive = false;
  let currentEnemy = null;

  document.getElementById('combat-attack-btn').onclick = () => doAttack();
  document.getElementById('combat-flee-btn').onclick = () => closeCombat();

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && combatActive) { e.preventDefault(); doAttack(); }
  });

  function doAttack() {
    if (!combatActive || !currentEnemy) return;
    if (typeof playTone !== 'undefined') playTone(180 + Math.random() * 80, 'sawtooth', 0.08, 0.1);
    atkProgress += 18;
    if (atkProgress >= 100) {
      atkProgress = 0;
      currentEnemy.hp--;
      if (typeof spawnParticles !== 'undefined') {
        spawnParticles(currentEnemy.wx, currentEnemy.wy, '#ff1744', 8);
      }
      const atkBar = document.getElementById('combat-enemy-bar');
      if (atkBar) atkBar.style.width = (currentEnemy.hp / currentEnemy.maxHp * 100) + '%';

      if (currentEnemy.hp <= 0) {
        /* Musuh kalah */
        combatActive = false;
        currentEnemy.alive = false;
        closeCombat();
        onEnemyDefeated(currentEnemy);
        return;
      }
    }
    const atkBar2 = document.getElementById('combat-atk-bar');
    if (atkBar2) atkBar2.style.width = atkProgress + '%';
  }

  /* Decay atk bar perlahan */
  setInterval(() => {
    if (!combatActive) return;
    atkProgress = Math.max(0, atkProgress - 1.2);
    const atkBar = document.getElementById('combat-atk-bar');
    if (atkBar) atkBar.style.width = atkProgress + '%';
  }, 80);

  function closeCombat() {
    combatActive = false;
    document.getElementById('combat-overlay').classList.add('hidden');
    if (typeof GS !== 'undefined') GS.paused = false;
  }

  window.openCombatUI = function(enemy) {
    currentEnemy = enemy;
    atkProgress = 0;
    combatActive = true;
    if (typeof GS !== 'undefined') GS.paused = true;

    document.getElementById('combat-overlay').classList.remove('hidden');
    const emojiEl = document.getElementById('combat-enemy-emoji');
    const nameEl = document.getElementById('combat-enemy-name');
    const dialogEl = document.getElementById('combat-enemy-dialog');
    const enemyBar = document.getElementById('combat-enemy-bar');

    if (emojiEl) emojiEl.textContent = enemy.emoji;
    if (nameEl) nameEl.textContent = enemy.name;
    if (dialogEl) dialogEl.textContent = '"' + (enemy.dialog || '...') + '"';
    if (enemyBar) enemyBar.style.width = '100%';

    if (typeof speakNPC !== 'undefined') speakNPC(enemy.dialog || '', enemy.name);
    if (typeof sfxBad !== 'undefined') sfxBad();
  };
}

function onEnemyDefeated(enemy) {
  if (typeof GS === 'undefined') return;
  const r = enemy.reward || {};

  /* Tambah uang */
  GS.money = (GS.money || 0) + (r.money || 0);
  if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();

  /* Stat update */
  if (r.integrity && typeof modIntegrity !== 'undefined') modIntegrity(r.integrity);
  if (r.shadow   && typeof modShadow    !== 'undefined') modShadow(r.shadow);
  if (r.trust    && typeof modTrust     !== 'undefined') modTrust(r.trust);

  /* Selesaikan quest terkait */
  if (enemy.questId) {
    if (typeof ALL_QUESTS !== 'undefined') {
      const q = ALL_QUESTS.find(q => q.id === enemy.questId);
      if (q && !GS.questsDone.has(q.id)) {
        if (typeof completeQuest !== 'undefined') completeQuest(q);
      }
    }
    /* Selesaikan daily quest juga */
    GS.questsDone.add('dq3');
    GS.questsActive.delete('dq3');
    if (typeof updateQuestUI !== 'undefined') updateQuestUI();
  }

  if (typeof showToast !== 'undefined') {
    showToast(`🏆 ${enemy.name} berhasil dikalahkan! +Rp ${(r.money||0).toLocaleString('id-ID')}`, 'success', 4000);
  }
  if (typeof spawnParticles !== 'undefined') {
    spawnParticles(enemy.wx, enemy.wy, '#ffd700', 20);
  }
  if (typeof sfxQuest !== 'undefined') sfxQuest();
}

/* ============================================================
   P5 — WALKING BACKGROUND NPCs
   Warga berjalan di jalan-jalan kota biar hidup
============================================================ */
const WALKER_TEMPLATES = [
  { emoji: '🚶', color: '#42a5f5', nameLabel: '' },
  { emoji: '🚶‍♀️', color: '#ec407a', nameLabel: '' },
  { emoji: '🧑', color: '#66bb6a', nameLabel: '' },
  { emoji: '👴', color: '#8d6e63', nameLabel: '' },
  { emoji: '🧒', color: '#ff9800', nameLabel: '' },
  { emoji: '👩', color: '#ab47bc', nameLabel: '' },
  { emoji: '🏃', color: '#26c6da', nameLabel: '' },
];

/* Jalur berjalan (tile coordinates → pixel) */
const WALK_ROUTES = [
  { x: 57, startY: 38 * 32, endY: 78 * 32, dir: 'v' },
  { x: 55, startY: 78 * 32, endY: 38 * 32, dir: 'v' },
  { startX: 15 * 32, endX: 55 * 32, y: 38 * 32, dir: 'h' },
  { startX: 55 * 32, endX: 15 * 32, y: 78 * 32, dir: 'h' },
  { startX: 57 * 32, endX: 90 * 32, y: 40 * 32, dir: 'h' },
  { startX: 90 * 32, endX: 57 * 32, y: 80 * 32, dir: 'h' },
];

function P5_addWalkingNPCs() {
  /* Buat 10 pejalan kaki */
  for (let i = 0; i < 10; i++) {
    const tmpl = WALKER_TEMPLATES[i % WALKER_TEMPLATES.length];
    const route = WALK_ROUTES[i % WALK_ROUTES.length];
    const walker = {
      ...tmpl,
      route,
      wx: route.dir === 'h' ? route.startX : route.x * 32,
      wy: route.dir === 'v' ? route.startY : route.y,
      speed: 0.6 + Math.random() * 0.6,
      animFrame: Math.floor(Math.random() * 8),
      animTimer: 0,
      facing: route.dir === 'h' ? (route.startX < route.endX ? 'right' : 'left') : (route.startY < route.endY ? 'down' : 'up'),
    };
    _patchState.walkNPCs.push(walker);
  }

  /* Hook render game */
  const _origRender2 = window.renderGame;
  if (_origRender2) {
    window.renderGame = function(cx, cy) {
      _origRender2(cx, cy);
      updateAndDrawWalkers(cx, cy);
    };
  }
}

function updateAndDrawWalkers(cx, cy) {
  if (typeof ctx === 'undefined' || typeof GS === 'undefined' || GS.paused) return;

  _patchState.walkNPCs.forEach(w => {
    /* Gerakkan */
    const route = w.route;
    if (route.dir === 'h') {
      const going = route.startX < route.endX ? 1 : -1;
      w.wx += going * w.speed;
      /* Sampai ujung → reset ke awal */
      if (going > 0 && w.wx > route.endX) w.wx = route.startX;
      if (going < 0 && w.wx < route.endX) w.wx = route.startX;
      w.facing = going > 0 ? 'right' : 'left';
    } else {
      const going = route.startY < route.endY ? 1 : -1;
      w.wy += going * w.speed;
      if (going > 0 && w.wy > route.endY) w.wy = route.startY;
      if (going < 0 && w.wy < route.endY) w.wy = route.startY;
      w.facing = going > 0 ? 'down' : 'up';
    }

    /* Animasi */
    w.animTimer++;
    if (w.animTimer > 8) { w.animTimer = 0; w.animFrame++; }

    /* Gambar */
    const px = w.wx - cx, py = w.wy - cy;
    if (px < -40 || py < -40 || px > (canvas ? canvas.width : 800) + 40) return;

    const bob = Math.sin(w.animFrame * 0.9) * 2;
    ctx.save();
    ctx.translate(px, py + bob);
    ctx.globalAlpha = 0.85;

    /* Shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 15, 8, 3, 0, 0, Math.PI * 2); ctx.fill();

    /* Badan */
    const legSwing = Math.sin(w.animFrame * 0.9) * 5;
    ctx.fillStyle = '#546e7a';
    ctx.beginPath(); ctx.roundRect(-5, 8 + legSwing, 4, 8, 1); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 8 - legSwing, 4, 8, 1); ctx.fill();
    ctx.fillStyle = w.color;
    ctx.beginPath(); ctx.roundRect(-7, -2, 14, 12, [2, 2, 3, 3]); ctx.fill();

    /* Kepala */
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath(); ctx.arc(0, -10, 8, 0, Math.PI * 2); ctx.fill();

    /* Emoji */
    ctx.font = '9px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(w.emoji, 0, -10);

    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

/* ============================================================
   P6 — EMOTE WHEEL
   Tekan Z untuk membuka/menutup roda emote
============================================================ */
const EMOTES_LIST = [
  { id: 'wave',   emoji: '👋', label: 'Sapa'    },
  { id: 'thumb',  emoji: '👍', label: 'Oke!'    },
  { id: 'think',  emoji: '🤔', label: 'Mikir'   },
  { id: 'laugh',  emoji: '😄', label: 'Ketawa'  },
  { id: 'sad',    emoji: '😢', label: 'Sedih'   },
  { id: 'angry',  emoji: '😤', label: 'Marah'   },
  { id: 'dance',  emoji: '💃', label: 'Joget'   },
  { id: 'bow',    emoji: '🙇', label: 'Hormat'  },
];

function P6_addEmoteWheel() {
  buildEmoteWheelUI();

  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.key === 'z' || e.key === 'Z') && typeof GS !== 'undefined' && GS.phase === 'game') {
      toggleEmoteWheel();
    }
  });
}

function buildEmoteWheelUI() {
  const div = document.createElement('div');
  div.id = 'emote-wheel';
  div.className = 'hidden';
  div.innerHTML = `
    <div id="emote-wheel-title">Emote (Z)</div>
    <div id="emote-grid">
      ${EMOTES_LIST.map(e => `
        <button class="emote-btn" data-id="${e.id}" title="${e.label}">
          <span class="emote-icon">${e.emoji}</span>
          <span class="emote-label">${e.label}</span>
        </button>
      `).join('')}
    </div>
    <div style="font-size:10px;color:#666;text-align:center;margin-top:6px">Tekan Z atau klik di luar untuk tutup</div>
  `;
  document.body.appendChild(div);

  /* Klik emote */
  div.querySelectorAll('.emote-btn').forEach(btn => {
    btn.onclick = () => {
      const emote = EMOTES_LIST.find(e => e.id === btn.dataset.id);
      if (emote) showPlayerEmote(emote);
      closeEmoteWheel();
    };
  });

  /* Klik di luar */
  document.addEventListener('click', e => {
    const wheel = document.getElementById('emote-wheel');
    if (wheel && !wheel.classList.contains('hidden') && !wheel.contains(e.target)) {
      closeEmoteWheel();
    }
  });
}

function toggleEmoteWheel() {
  const wheel = document.getElementById('emote-wheel');
  if (!wheel) return;
  if (wheel.classList.contains('hidden')) {
    wheel.classList.remove('hidden');
    _patchState.emoteActive = true;
  } else {
    closeEmoteWheel();
  }
}

function closeEmoteWheel() {
  const wheel = document.getElementById('emote-wheel');
  if (wheel) wheel.classList.add('hidden');
  _patchState.emoteActive = false;
}

function showPlayerEmote(emote) {
  _patchState.playerEmote = emote;
  if (_patchState.emoteTimer) clearTimeout(_patchState.emoteTimer);
  _patchState.emoteTimer = setTimeout(() => {
    _patchState.playerEmote = null;
  }, 2500);

  /* Render emote di atas player */
  const _origRenderPlayer = window.drawPlayer;
  /* Tidak bisa override drawPlayer langsung, gunakan hook renderGame */
  if (typeof showToast !== 'undefined') {
    showToast(`${emote.emoji} ${emote.label}`, 'info', 2000);
  }
}

/* ============================================================
   P7 — SUARA NPC (Web Speech API)
   NPC berbicara saat dialog dibuka
============================================================ */
function P7_addNPCVoice() {
  window.speakNPC = function(text, npcName) {
    if (!window.speechSynthesis) return;
    if (!text || text.length < 3) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = getNPCPitch(npcName || '');
      utterance.volume = typeof GS !== 'undefined' ? (GS.sfxVol || 0.8) * 0.6 : 0.5;

      /* Coba gunakan suara Bahasa Indonesia jika ada */
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id'));
      if (idVoice) utterance.voice = idVoice;

      window.speechSynthesis.speak(utterance);
    } catch(e) { /* ignore */ }
  };

  /* Hentikan suara saat dialog tutup */
  const _origCloseDialog = window.closeDialog;
  if (_origCloseDialog) {
    window.closeDialog = function(choices) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      _origCloseDialog(choices);
    };
  }
}

function getNPCPitch(name) {
  const lower = name.toLowerCase();
  if (lower.includes('bu') || lower.includes('ibu') || lower.includes('nenek') || lower.includes('wanita')) return 1.3;
  if (lower.includes('anak') || lower.includes('doni') || lower.includes('siswa')) return 1.5;
  if (lower.includes('kakek') || lower.includes('pak camat') || lower.includes('inspek')) return 0.7;
  return 1.0;
}

/* ============================================================
   P8 — PERBAIKAN SISTEM QUEST
   Quest bisa diselesaikan dengan lebih jelas,
   termasuk quest "hanya ngobrol"
============================================================ */
function P8_improveQuestSystem() {
  /* Quest yang bisa diselesaikan hanya dengan bicara */
  const TALK_QUESTS = new Set([
    'sq18','sq14','sq11','sq1','sq3','sq25','mq1'
  ]);

  /* Override interactWithNPC untuk quest flow lebih baik */
  const _origInteract = window.interactWithNPC;
  if (!_origInteract) return;

  window.interactWithNPC = function(npc) {
    /* Cek apakah ada quest talk-only yang bisa langsung diselesaikan */
    if (typeof ALL_QUESTS !== 'undefined' && typeof GS !== 'undefined') {
      const activeQuestsForNPC = ALL_QUESTS.filter(q =>
        npc.questIds && npc.questIds.includes(q.id) &&
        GS.questsActive.has(q.id) &&
        TALK_QUESTS.has(q.id)
      );

      if (activeQuestsForNPC.length > 0) {
        const q = activeQuestsForNPC[0];
        /* Tampilkan dialog lengkap lalu selesaikan quest */
        if (typeof openDialog !== 'undefined') {
          if (typeof initAudio !== 'undefined') initAudio();
          if (typeof sfxInteract !== 'undefined') sfxInteract();
          if (typeof GS !== 'undefined') GS.paused = true;

          const lines = [...(npc.dialog || []), `✨ [${q.icon} ${q.name}] Berhasil diselesaikan!`];
          const overlay = document.getElementById('dialog-overlay');
          if (overlay) overlay.classList.remove('hidden');
          if (document.getElementById('dialog-portrait'))
            document.getElementById('dialog-portrait');
          drawNPCPortrait(npc);

          if (document.getElementById('dialog-speaker-name'))
            document.getElementById('dialog-speaker-name').textContent = npc.name;

          /* Buka dialog, lalu selesaikan quest di akhir */
          openDialog(npc, lines, [{
            text: '✅ Misi Selesai!',
            type: 'good',
            callback: () => {
              if (typeof completeQuest !== 'undefined') completeQuest(q);
            }
          }]);
          return;
        }
      }
    }

    /* Fallback ke original */
    _origInteract(npc);
    /* Gambar portrait */
    if (npc) drawNPCPortrait(npc);
  };

  /* Tambahkan NPC untuk quest yang belum ada di NPCS_DATA */
  const _origStartGame = window.startGame;
  if (_origStartGame) {
    window.startGame = function() {
      _origStartGame();
      addExtraNPCsForQuests();
    };
  }
}

function addExtraNPCsForQuests() {
  if (typeof npcs === 'undefined' || typeof NPCS_DATA === 'undefined') return;

  /* NPC tambahan agar lebih banyak quest bisa diselesaikan */
  const extraNPCs = [
    {
      id: 'ketua_rt', name: 'Ketua RT', emoji: '🏘️', color: '#1565c0',
      x: 15, y: 42, zone: 'residential',
      dialog: ['Selamat datang, anak muda!', 'Mau ikut rapat RT hari ini?', 'Catat semua notulen ya!'],
      questIds: ['sq14']
    },
    {
      id: 'petugas_kebersihan', name: 'Pak Bersih', emoji: '🗑️', color: '#26a69a',
      x: 30, y: 20, zone: 'park',
      dialog: ['Sampah di taman ini sudah menggunung...', 'Kalau kamu mau bantu bersih-bersih, sangat kami hargai!'],
      questIds: ['sq5']
    },
    {
      id: 'perawat', name: 'Suster Ayu', emoji: '👩‍⚕️', color: '#e91e63',
      x: 63, y: 27, zone: 'office',
      dialog: ['Program donor darah dibuka hari ini!', 'Satu kantong darah bisa menyelamatkan tiga nyawa.'],
      questIds: ['sq27']
    },
    {
      id: 'jurnalis_muda', name: 'Rani (Jurnalis)', emoji: '📷', color: '#ff7043',
      x: 40, y: 18, zone: 'park',
      dialog: ['Hai! Saya sedang meliput kota Nusantara.', 'Bisa bantu ambil foto landmark kota?'],
      questIds: ['sq19']
    },
  ];

  extraNPCs.forEach(npc => {
    if (!npcs.find(n => n.id === npc.id)) {
      npcs.push({ ...npc });
    }
  });
}

/* ============================================================
   P9 — UNIFIKASI UANG
   Uang dari ikan (FS.gold) disinkronkan ke GS.money
============================================================ */
function P9_unifyMoney() {
  if (typeof FS === 'undefined' || typeof GS === 'undefined') return;

  /* Setiap kali FS.gold berubah, sync ke GS.money */
  const _origSellAll = window.sellAllFish;
  if (_origSellAll) {
    window.sellAllFish = function() {
      const before = FS.gold;
      _origSellAll();
      const earned = FS.gold - before;
      GS.money = (GS.money || 0) + earned;
      if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();
    };
  }

  /* Patch catch-sell-btn */
  const _origShowCatch = window.showCatchPopup;
  if (_origShowCatch) {
    window.showCatchPopup = function(fish) {
      _origShowCatch(fish);

      /* Override tombol jual agar sync ke GS.money */
      setTimeout(() => {
        const sellBtn = document.getElementById('catch-sell-btn');
        if (sellBtn) {
          const origOnClick = sellBtn.onclick;
          sellBtn.onclick = function() {
            if (origOnClick) origOnClick.call(this);
            GS.money = (GS.money || 0) + fish.basePrice;
            FS.gold = Math.max(0, FS.gold - fish.basePrice); /* koreksi: sudah ditambah di origOnClick */
            /* Sebenarnya FS.gold sudah += fish.basePrice di origOnClick, 
               jadi kita cukup sync */
            GS.money = (GS.money || 0);
            /* Re-sync: ambil dari FS.gold juga */
            syncFishMoney();
            if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();
          };
        }
      }, 100);
    };
  }

  /* Sync tiap beberapa detik sebagai safety net */
  setInterval(syncFishMoney, 3000);
}

function syncFishMoney() {
  if (typeof FS === 'undefined' || typeof GS === 'undefined') return;
  /* Tambahkan FS.gold ke GS.money jika ada selisih */
  if (FS.gold > 0) {
    GS.money = (GS.money || 0) + FS.gold;
    FS.gold = 0;
    if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();
  }
}

/* ============================================================
   P10 — PANCING LEBIH MUDAH
   Naikkan probabilitas mendapat ikan supaya tidak frustrasi
============================================================ */
function P10_easierFishing() {
  if (typeof rollFish === 'undefined') return;

  /* Override rollFish dengan probabilitas lebih tinggi */
  window.rollFish = function(baitId) {
    const bait = (typeof BAIT_CATALOG !== 'undefined') ? BAIT_CATALOG[baitId] || BAIT_CATALOG.biasa : null;
    const rod  = (typeof ROD_CATALOG   !== 'undefined') ? ROD_CATALOG[FS ? FS.rodId : 'bambu'] || ROD_CATALOG.bambu : null;

    const legendMult = ((bait && bait.legendBonus ? 5 : 1) * (rod && rod.legendBonus ? 2 : 1));
    const rareMult   = (bait && bait.rareBonus) || 1;

    /* ─── PROBABILITAS BARU (lebih mudah) ─── */
    const legendChance = legendMult / 18;   /* was /30 → lebih mudah */
    const rareChance   = rareMult   / 8;    /* was /15 → lebih mudah */
    const commonChance = 3 / 4;             /* was 1/5 = 20% → sekarang 75% */

    const roll = Math.random();

    if (roll < legendChance) {
      const pool = FISH_BY_RARITY.legendaris;
      return FISH_CATALOG[pool[Math.floor(Math.random() * pool.length)]];
    } else if (roll < legendChance + rareChance) {
      const pool = FISH_BY_RARITY.langka;
      return FISH_CATALOG[pool[Math.floor(Math.random() * pool.length)]];
    } else if (roll < legendChance + rareChance + commonChance) {
      const pool = FISH_BY_RARITY.biasa;
      return FISH_CATALOG[pool[Math.floor(Math.random() * pool.length)]];
    }
    /* 25% tidak dapat ikan, dulu 70% */
    return null;
  };

  /* Juga percepat waktu tunggu (dulu 2-6 detik, sekarang 1-3 detik) */
  const _origCastLine = window.castLine;
  if (_origCastLine) {
    window.castLine = function() {
      /* Patch waitTime di dalam castLine dengan monkey-patching setTimeout */
      const _origSetTimeout = window.setTimeout;
      let patched = false;
      const patchedSetTimeout = function(fn, delay) {
        if (!patched && delay >= 2000) {
          patched = true;
          return _origSetTimeout(fn, 1000 + Math.random() * 2000); /* 1-3 detik */
        }
        return _origSetTimeout(fn, delay);
      };
      window.setTimeout = patchedSetTimeout;
      _origCastLine();
      /* Restore setTimeout segera */
      setTimeout(() => { window.setTimeout = _origSetTimeout; }, 100);
    };
  }

  if (typeof showToast !== 'undefined') {
    showToast('🎣 Sistem mancing diperbarui — lebih mudah dapat ikan!', 'info', 3000);
  }
}

/* ============================================================
   P11 — GAMBAR MINIMARKET DI DUNIA GAME
   Menggunakan minimarket.png yang disediakan user
============================================================ */
let _minimarketImg = null;

function P11_minimarketImageAndBuilding() {
  /* Load gambar */
  _minimarketImg = new Image();
  _minimarketImg.src = 'minimarket.png';
  _minimarketImg.onerror = () => { _minimarketImg = null; };

  /* Patch renderGame untuk gambar toko */
  const _origRender3 = window.renderGame;
  if (_origRender3) {
    window.renderGame = function(cx, cy) {
      _origRender3(cx, cy);
      drawMinimarketBuilding(cx, cy);
    };
  }

  /* Tambahkan interaksi toko di dekat pak_rudi_mini */
  patchMinimarketInteraction();
}

function drawMinimarketBuilding(cx, cy) {
  if (!_minimarketImg || !_minimarketImg.complete) return;
  if (typeof ctx === 'undefined') return;

  /* Posisi minimarket: sekitar tile (50, 70) */
  const bx = 48 * 32 - cx;
  const by = 68 * 32 - cy;
  const bw = 6 * 32; /* 6 tiles lebar */
  const bh = 4 * 32; /* 4 tiles tinggi */

  if (bx + bw < 0 || by + bh < 0 || bx > (canvas ? canvas.width : 1000) || by > (canvas ? canvas.height : 800)) return;

  ctx.save();
  /* Gambar toko dengan ukuran proporsional */
  ctx.drawImage(_minimarketImg, bx, by, bw, bh);

  /* Papan nama toko */
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath(); ctx.roundRect(bx + bw/2 - 60, by - 22, 120, 18, 6); ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 10px Press Start 2P, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('MINIMART NUSANTARA', bx + bw/2, by - 13);

  ctx.restore();
}

function patchMinimarketInteraction() {
  const _origInteract2 = window.interactWithNPC;
  if (!_origInteract2) return;

  window.interactWithNPC = function(npc) {
    if (npc && npc.id === 'pak_rudi_mini') {
      if (typeof openDialog !== 'undefined') {
        if (typeof initAudio !== 'undefined') initAudio();
        if (typeof sfxInteract !== 'undefined') sfxInteract();
        if (typeof GS !== 'undefined') GS.paused = true;

        openDialog(npc,
          ['Selamat datang di Minimart Nusantara!', 'Kami menjual berbagai kebutuhan sehari-hari.', 'Uang Anda terpadu dengan sistem game — belanja pakai uang yang sama!'],
          [
            { text: '🛒 Buka Toko', type: 'good', callback: () => {
              if (typeof openShop !== 'undefined') openShop();
            }},
            { text: '🎒 Inventory', callback: () => {
              if (typeof openInventory !== 'undefined') openInventory();
            }},
            { text: '💬 Tanya soal preman', callback: () => {
              /* Quest MQ7 */
              if (typeof ALL_QUESTS !== 'undefined' && typeof GS !== 'undefined') {
                const q = ALL_QUESTS.find(qq => qq.id === 'mq7');
                if (q && !GS.questsActive.has('mq7') && !GS.questsDone.has('mq7')) {
                  if (typeof acceptQuest !== 'undefined') acceptQuest(q);
                } else if (q && GS.questsActive.has('mq7')) {
                  if (typeof completeQuest !== 'undefined') completeQuest(q);
                }
              }
            }},
            { text: 'Tidak, makasih', callback: () => {} },
          ]
        );
        return;
      }
    }
    _origInteract2(npc);
  };
}

/* ============================================================
   P12 — MINIMARKET MINI-GAME SHOP YANG LEBIH BAIK
   Update UI toko agar lebih bagus dengan deskripsi lengkap
============================================================ */
function P12_addMiniGameMinimarket() {
  /* Tambahkan item baru ke toko */
  if (typeof SHOP_ITEMS !== 'undefined') {
    SHOP_ITEMS['kopi'] = { name: 'Kopi', heal: 8, price: 20, emoji: '☕', desc: 'Bikin semangat' };
    SHOP_ITEMS['snack'] = { name: 'Snack', heal: 15, price: 35, emoji: '🍿', desc: 'Camilan enak' };
    SHOP_ITEMS['obat'] = { name: 'Obat', heal: 30, price: 80, emoji: '💊', desc: 'Pulihkan integritas' };
  }

  /* Buat toko yang lebih baik */
  rebuildShopUI();
}

function rebuildShopUI() {
  const shopUI = document.getElementById('shop-ui');
  if (!shopUI) return;

  shopUI.innerHTML = `
    <div id="shop-box">
      <div id="shop-header">
        <div style="display:flex;align-items:center;gap:10px">
          ${_minimarketImg ? `<img src="minimarket.png" style="height:36px;border-radius:6px;"/>` : '🏪'}
          <h2 style="margin:0">Minimart Nusantara</h2>
        </div>
        <button onclick="closeShop()" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">✕</button>
      </div>
      <div id="shop-money">
        💰 Uang Kamu: <span id="shop-money-text">0</span>
      </div>
      <div id="shop-items-grid">
        <div class="shop-item">
          <div>
            <h3>🍞 Roti</h3>
            <p>Heal +10 integritas</p>
            <p style="color:#ffd700;font-size:11px">Rp 25</p>
          </div>
          <button onclick="buyItem('roti',25)" class="shop-buy-btn-new">Beli</button>
        </div>
        <div class="shop-item">
          <div>
            <h3>🥤 Air Minum</h3>
            <p>Heal +5 integritas</p>
            <p style="color:#ffd700;font-size:11px">Rp 15</p>
          </div>
          <button onclick="buyItem('air',15)" class="shop-buy-btn-new">Beli</button>
        </div>
        <div class="shop-item">
          <div>
            <h3>☕ Kopi</h3>
            <p>Heal +8 kepercayaan</p>
            <p style="color:#ffd700;font-size:11px">Rp 20</p>
          </div>
          <button onclick="buyItemEx('kopi',20)" class="shop-buy-btn-new">Beli</button>
        </div>
        <div class="shop-item">
          <div>
            <h3>🍿 Snack</h3>
            <p>Heal +15 integritas</p>
            <p style="color:#ffd700;font-size:11px">Rp 35</p>
          </div>
          <button onclick="buyItemEx('snack',35)" class="shop-buy-btn-new">Beli</button>
        </div>
        <div class="shop-item">
          <div>
            <h3>💊 Obat</h3>
            <p>Pulihkan +30 integritas</p>
            <p style="color:#ffd700;font-size:11px">Rp 80</p>
          </div>
          <button onclick="buyItemEx('obat',80)" class="shop-buy-btn-new">Beli</button>
        </div>
      </div>
      <div id="shop-inv-section">
        <div style="font-size:11px;color:#aaa;margin-top:8px">🎒 Item yang dimiliki:</div>
        <div id="shop-inv-items" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"></div>
      </div>
    </div>
  `;

  /* Tambahkan fungsi beli item extended */
  window.buyItemEx = function(id, price) {
    if (typeof GS === 'undefined') return;
    if (GS.money < price) {
      if (typeof showToast !== 'undefined') showToast('💸 Uang tidak cukup!', 'error');
      return;
    }
    GS.money -= price;

    const itemData = typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS[id] : null;
    if (!itemData) return;

    /* Tambahkan ke inventory */
    if (!GS.inventory) GS.inventory = [];
    const existing = GS.inventory.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      GS.inventory.push({ id, name: itemData.name, heal: itemData.heal, qty: 1 });
    }

    if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();
    if (typeof renderInventory !== 'undefined') renderInventory();
    if (typeof showToast !== 'undefined') showToast(`✅ ${itemData.name} dibeli!`, 'success');
    if (typeof sfxGood !== 'undefined') sfxGood();

    refreshShopInventoryDisplay();
  };

  /* Override openShop untuk update display */
  const _origOpenShop = window.openShop;
  window.openShop = function() {
    document.getElementById('shop-ui').classList.remove('hidden');
    if (typeof updateMoneyUI !== 'undefined') updateMoneyUI();
    refreshShopInventoryDisplay();
  };
}

function refreshShopInventoryDisplay() {
  const el = document.getElementById('shop-inv-items');
  if (!el || typeof GS === 'undefined') return;
  el.innerHTML = '';
  const inv = GS.inventory || [];
  if (inv.length === 0) {
    el.innerHTML = '<span style="color:#555;font-size:11px">Kosong</span>';
    return;
  }
  inv.forEach(item => {
    const span = document.createElement('span');
    span.style.cssText = 'background:rgba(255,255,255,0.1);padding:3px 8px;border-radius:12px;font-size:11px;';
    span.textContent = `${item.name} ×${item.qty}`;
    el.appendChild(span);
  });
}

/* ============================================================
   HELPER FUNCTIONS
============================================================ */
function lighten(hex, amt) {
  return adjustColor(hex, amt);
}
function darken(hex, amt) {
  return adjustColor(hex, -amt);
}
function adjustColor(hex, amt) {
  try {
    let c = parseInt(hex.replace('#',''),16);
    let r = Math.min(255,Math.max(0,((c>>16)&0xff)+amt));
    let g = Math.min(255,Math.max(0,((c>>8)&0xff)+amt));
    let b = Math.min(255,Math.max(0,(c&0xff)+amt));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  } catch(e) { return hex; }
}
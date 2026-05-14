/* ============================================================
   MAGANG QUEST — AKAR BAYANGAN  |  game.js
   Full RPG engine: rendering, world, NPC, quest, time, story
============================================================ */
'use strict';

// ────────────────────────────────────────────────────────────
//  CONSTANTS & CONFIG
// ────────────────────────────────────────────────────────────
const TILE = 32;
const MAP_W = 120;  // tiles
const MAP_H = 100;  // tiles
const CAM_LERP = 0.12;
const PLAYER_SPEED = 1.8;
const PLAYER_RUN = 3.2;

// Tile types
const T = {
  GRASS:0, ROAD:1, SAND:2, WATER:3, DIRT:4,
  WALL_H:10, WALL_V:11, ROOF_R:12, ROOF_B:13, ROOF_G:14, ROOF_Y:15, ROOF_P:16,
  FLOOR_W:20, FLOOR_T:21, FLOOR_G:22, FLOOR_B:23,
  DOOR:30, WINDOW:31,
  TREE:40, BUSH:41, FENCE:42, PATH:43, FLOWER:44, ROCK:45,
  DESK:50, CHAIR:51, BED:52, TABLE:53, SHELF:54, PLANT:55, TV:56, LAMP:57,
  ROAD_MARK:60, SIDEWALK:61, CURB:62,
  SCHOOL_DOOR:70, OFFICE_DOOR:71, SHOP_DOOR:72, WORK_DOOR:73,
  BOARD:80, NOTICE:81,
  VOID:99
};

// ── 8 OUTFIT CHARACTERS — gaya anime sesuai referensi
// Semua karakter berbasis satu base (rambut hitam, kulit terang, wajah manga)
// dibedakan hanya dari outfit & aksesoris sesuai gambar referensi
const CHARACTERS = [
  {
    id:'outfit_shirtless', label:'Tanpa Baju', desc:'Hanya celana hitam ketat',
    gender:'male', emoji:'💪',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_messy',
    outfit:'shirtless',
    shirtColor:'none',  pantsColor:'#111', shoeColor:'none',
    accent:'#e0e0e0', badge:'💪',
    extras: {}
  },
  {
    id:'outfit_kasual', label:'Kasual Gen Z', desc:'Kaos oversized + cargo',
    gender:'male', emoji:'👕',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_messy',
    outfit:'kasual',
    shirtColor:'#1a1a1a', pantsColor:'#1a1a1a', shoeColor:'#f0f0f0',
    accent:'#aaa', badge:'✨',
    extras: { necklace:true, cargo:true, sneaker_white:true }
  },
  {
    id:'outfit_formal', label:'Formal', desc:'Jas hitam elegan',
    gender:'male', emoji:'🧥',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_neat',
    outfit:'formal',
    shirtColor:'#111', pantsColor:'#111', shoeColor:'#111',
    accent:'#c8a870', badge:'🎩',
    extras: { blazer:true, tie:true, dress_shoes:true }
  },
  {
    id:'outfit_pelajar', label:'Pelajar', desc:'Seragam putih + dasi',
    gender:'male', emoji:'🎓',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_neat',
    outfit:'pelajar',
    shirtColor:'#f5f5f5', pantsColor:'#1a1a2e', shoeColor:'#f0f0f0',
    accent:'#2244aa', badge:'📚',
    extras: { school_badge:true, tie_school:true, sneaker_white:true }
  },
  {
    id:'outfit_olahraga', label:'Olahraga', desc:'Compression + shorts',
    gender:'male', emoji:'🏃',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_messy',
    outfit:'olahraga',
    shirtColor:'#111', pantsColor:'#111', shoeColor:'#111',
    accent:'#888', badge:'⚡',
    extras: { compression:true, shorts:true, sport_shoes:true }
  },
  {
    id:'outfit_kantoran', label:'Seragam Kantoran', desc:'Kemeja putih + ID card',
    gender:'male', emoji:'💼',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_neat',
    outfit:'kantoran',
    shirtColor:'#f5f5f5', pantsColor:'#111', shoeColor:'#111',
    accent:'#222', badge:'🪪',
    extras: { id_card:true, tie_black:true, belt:true, rolled_sleeves:true }
  },
  {
    id:'outfit_magang', label:'Seragam Magang', desc:'Kemeja putih + lanyard',
    gender:'male', emoji:'🏢',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_tousled',
    outfit:'magang',
    shirtColor:'#f5f5f5', pantsColor:'#111', shoeColor:'#111',
    accent:'#e04444', badge:'🪪',
    extras: { lanyard:true, tie_black:true, pocket:true }
  },
  {
    id:'outfit_hoodie', label:'Hoodie', desc:'Hoodie hitam oversize',
    gender:'male', emoji:'🧣',
    skin:'#f0c8a0', hair:'#111', hairStyle:'anime_messy',
    outfit:'hoodie',
    shirtColor:'#1a1a1a', pantsColor:'#111', shoeColor:'#111',
    accent:'#555', badge:'🎵',
    extras: { hoodie_draw:true, cargo_hoodie:true }
  },
];

// Legacy compat
const OUTFITS_MALE   = CHARACTERS.map(c=>({id:c.id, emoji:c.emoji, label:c.label, color:c.shirtColor}));
const OUTFITS_FEMALE = OUTFITS_MALE;

// ────────────────────────────────────────────────────────────
//  GAME STATE
// ────────────────────────────────────────────────────────────
const GS = {
  phase: 'intro',       // intro | story | game | pause
  day: 1,
  hour: 8, minute: 0,
  timeSpeed: 1,         // 1 real-sec = 1 game-min
  paused: false,
  integrity: 100,
  trust: 100,
  shadow: 0,            // 0-100%
  playerName: 'Hero',
  gender: 'male',
  outfitId: 'm_budi',
  outfitColor: '#1565c0',
  characterId: 'm_budi',
  items: [],
  news: [],
  storyIndex: 0,
  dialogQueue: [],
  dialogChoiceCallback: null,
  activeNPC: null,
  keys: {},
  mobile: { up:false, down:false, left:false, right:false, run:false },
  questsDone: new Set(),
  questsActive: new Set(),
  dailyDone: new Set(),
  dailyReset: 0,
  nearNPC: null,
  camera: {x:0, y:0},
  camTarget: {x:0, y:0},
  musicVol: 0.7,
  sfxVol: 0.8,
};

// ────────────────────────────────────────────────────────────
//  STORY DATA
// ────────────────────────────────────────────────────────────
const STORY_PANELS = [
  {art:'🌅', title:'Kota Mercu', color:'#f0c040',
   desc:'Kota Nusantara — tempat impian ribuan pemuda mencari pengalaman.'},
  {art:'🏢', title:'Program Magang', color:'#40e0d0',
   desc:'Kamu diterima magang 7 hari di Kantor Dinas Kota. Sebuah kesempatan emas!'},
  {art:'🌑', title:'Akar Bayangan', color:'#8b0000',
   desc:'Namun di balik kota yang indah, sebuah kekuatan gelap tumbuh... kebohongan demi kebohongan.'},
  {art:'⚖️', title:'Pilihanmu Menentukan Segalanya', color:'#e040fb',
   desc:'Apakah kamu akan tetap jujur, atau menyerah pada godaan suap dan korupsi?'},
  {art:'🦸', title:'Hari Pertama Dimulai!', color:'#66bb6a',
   desc:'Bersiaplah. Integritas dan kepercayaan warga ada di tanganmu.'},
];

const STORY_DIALOG = [
  {speaker:'Narator', text:'Matahari bersinar terang di Kota Nusantara pada pagi yang cerah...'},
  {speaker:'Narator', text:'Kamu — seorang mahasiswa muda yang penuh semangat — baru saja mendapatkan kesempatan magang 7 hari di Kantor Dinas Kota.'},
  {speaker:'Bu Sari (Kepala Dinas)', text:'Selamat datang, anak muda! Kamu akan belajar banyak di sini. Tapi ingat — Integritas adalah segalanya!'},
  {speaker:'Bu Sari (Kepala Dinas)', text:'Jam kerja dimulai pukul 08.00 hingga 16.00. Selebihnya waktumu bebas untuk menjelajahi kota.'},
  {speaker:'Narator', text:'Namun ada yang tidak kamu ketahui... Sebuah bayangan gelap bernama AKAR BAYANGAN mulai tumbuh di kota ini.'},
  {speaker:'??? (Suara Misterius)', text:'Hehehe... Satu kebohongan kecil tidak akan merusak segalanya, bukan? Mari bergabung dengan kami...'},
  {speaker:'Narator', text:'Petualanganmu dimulai sekarang. Tegakkan kebenaran dan hentikan Akar Bayangan!'},
];

// ────────────────────────────────────────────────────────────
//  QUEST DATA (50 quests)
// ────────────────────────────────────────────────────────────
const ALL_QUESTS = [
  // MAIN QUESTS (story-driven with shadow mechanic)
  {id:'mq1',  type:'main', name:'Hari Pertama Magang', diff:'easy',
   icon:'🏢', desc:'Laporkan diri ke Bu Sari di Kantor Dinas pukul 08.00.',
   reward:'Integritas +10, Kepercayaan +5', npc:'bu_sari',
   shadow: false},
  {id:'mq2',  type:'main', name:'Berkas Mencurigakan', diff:'med',
   icon:'📁', desc:'Pak Budi memintamu menandatangani berkas tanpa dibaca. Apakah kamu mau menandatanganinya?',
   reward:'Integritas +15 (jika menolak)', npc:'pak_budi',
   shadow: true, bribeText:'Pak Budi memberikan amplop berisi Rp 500.000. Terima atau tolak?'},
  {id:'mq3',  type:'main', name:'Data Yang Dimanipulasi', diff:'med',
   icon:'💻', desc:'Temukan data anggaran yang dimanipulasi di komputer kantor.',
   reward:'Kepercayaan Warga +20', npc:'sistem_komputer',
   shadow: false},
  {id:'mq4',  type:'main', name:'Laporan Fiktif', diff:'hard',
   icon:'📊', desc:'Bu Rina memintamu memasukkan data fiktif dalam laporan bulanan.',
   reward:'Integritas +25 (jika menolak)', npc:'bu_rina',
   shadow: true, bribeText:'Bu Rina menawarkan promosi nilai magang jika kamu mau. Terima atau tolak?'},
  {id:'mq5',  type:'main', name:'Pengadaan Fiktif', diff:'hard',
   icon:'🏗️', desc:'Temukan bukti pengadaan barang fiktif senilai ratusan juta.',
   reward:'Shadow -20, Kepercayaan +30', npc:'gudang_kantor',
   shadow: false},
  {id:'mq6',  type:'main', name:'Laporkan Pak Budi', diff:'hard',
   icon:'⚖️', desc:'Laporkan Pak Budi ke Inspektorat dengan bukti yang kamu temukan.',
   reward:'Shadow -25, Integritas +30', npc:'inspektorat',
   shadow: false},
  {id:'mq7',  type:'main', name:'Suap di Minimarket', diff:'med',
   icon:'🏪', desc:'Pemilik minimarket ditawari "uang damai" oleh preman kota.',
   reward:'Kepercayaan +15 (jika bantu)', npc:'pak_rudi_mini',
   shadow: true, bribeText:'Preman menawarkan bagian jika kamu diam. Terima atau tolak?'},
  {id:'mq8',  type:'main', name:'Ijazah Palsu', diff:'hard',
   icon:'🎓', desc:'Temukan pegawai baru yang menggunakan ijazah palsu.',
   reward:'Shadow -15, Integritas +20', npc:'pegawai_baru',
   shadow: false},
  {id:'mq9',  type:'main', name:'Tanda Tangan Dinas', diff:'hard',
   icon:'✍️', desc:'Pak Camat memintamu memalsukan tanda tangan kepala dinas.',
   reward:'Integritas +35 (jika menolak)', npc:'pak_camat',
   shadow: true, bribeText:'Pak Camat menjanjikan bonus besar. Terima atau tolak?'},
  {id:'mq10', type:'main', name:'Konfrontasi Akar Bayangan', diff:'hard',
   icon:'🌑', desc:'Temukan sarang Akar Bayangan di gudang tua dan ungkap identitasnya.',
   reward:'Shadow -30, Selesaikan Cerita Utama', npc:'gudang_tua',
   shadow: false},

  // SIDE QUESTS
  {id:'sq1',  type:'side', name:'Kucing Hilang Bu Dewi', diff:'easy',
   icon:'🐱', desc:'Bantu Bu Dewi mencari kucingnya yang hilang di taman kota.',
   reward:'Kepercayaan +8', npc:'bu_dewi'},
  {id:'sq2',  type:'side', name:'Paket Terlambat', diff:'easy',
   icon:'📦', desc:'Antarkan paket kiriman ke warga RT 03.',
   reward:'Kepercayaan +5', npc:'pak_pos'},
  {id:'sq3',  type:'side', name:'Bantuan Belanja', diff:'easy',
   icon:'🛒', desc:'Bantu nenek membawa belanjaan dari minimarket.',
   reward:'Kepercayaan +6', npc:'nenek_sari'},
  {id:'sq4',  type:'side', name:'Buku Perpustakaan', diff:'easy',
   icon:'📚', desc:'Kembalikan 3 buku ke perpustakaan sekolah.',
   reward:'Kepercayaan +7', npc:'pustakawan'},
  {id:'sq5',  type:'side', name:'Sampah Berserakan', diff:'easy',
   icon:'🗑️', desc:'Bersihkan sampah di area taman kota.',
   reward:'Kepercayaan +8, Integritas +5', npc:'petugas_kebersihan'},
  {id:'sq6',  type:'side', name:'Guru Butuh Bantuan', diff:'easy',
   icon:'📝', desc:'Bantu Bu Anis menyiapkan bahan ajar di kelas.',
   reward:'Kepercayaan +10', npc:'bu_anis'},
  {id:'sq7',  type:'side', name:'Anak Tersesat', diff:'easy',
   icon:'👦', desc:'Bantu anak kecil menemukan jalan pulang ke rumahnya.',
   reward:'Kepercayaan +12', npc:'anak_hilang'},
  {id:'sq8',  type:'side', name:'Kran Bocor', diff:'med',
   icon:'🔧', desc:'Laporkan kran air bocor di lapangan sekolah ke petugas.',
   reward:'Kepercayaan +8', npc:'kepala_sekolah'},
  {id:'sq9',  type:'side', name:'Bibit Tanaman', diff:'easy',
   icon:'🌱', desc:'Tanam 5 bibit pohon di area lapangan.',
   reward:'Kepercayaan +10, Integritas +3', npc:'pak_taman'},
  {id:'sq10', type:'side', name:'Festival Kota', diff:'med',
   icon:'🎪', desc:'Bantu persiapan festival tahunan kota Nusantara.',
   reward:'Kepercayaan +15', npc:'bu_festival'},
  {id:'sq11', type:'side', name:'Warung Bu Nani', diff:'easy',
   icon:'🍜', desc:'Bantu Bu Nani mengantar pesanan makan siang ke kantor.',
   reward:'Kepercayaan +7', npc:'bu_nani'},
  {id:'sq12', type:'side', name:'Komputer Rusak', diff:'med',
   icon:'💻', desc:'Perbaiki komputer yang rusak di ruang kelas sekolah.',
   reward:'Kepercayaan +12', npc:'guru_tik'},
  {id:'sq13', type:'side', name:'Surat Lamaran', diff:'easy',
   icon:'✉️', desc:'Bantu warga menulis surat lamaran kerja.',
   reward:'Kepercayaan +8', npc:'warga_muda'},
  {id:'sq14', type:'side', name:'Rapat RT', diff:'easy',
   icon:'🏘️', desc:'Hadiri rapat RT dan catat notulen untuk warga.',
   reward:'Kepercayaan +10', npc:'ketua_rt'},
  {id:'sq15', type:'side', name:'Pohon Tumbang', diff:'med',
   icon:'🌳', desc:'Laporkan pohon tumbang di jalan ke dinas kebersihan.',
   reward:'Kepercayaan +10', npc:'dinas_kebersihan'},
  {id:'sq16', type:'side', name:'Turnamen Badminton', diff:'med',
   icon:'🏸', desc:'Ikuti turnamen badminton antar warga di lapangan.',
   reward:'Kepercayaan +12, Integritas +5', npc:'pak_olahraga'},
  {id:'sq17', type:'side', name:'Bazar Amal', diff:'med',
   icon:'🎁', desc:'Kumpulkan 5 item untuk bazar amal kota.',
   reward:'Kepercayaan +18', npc:'bu_bazar'},
  {id:'sq18', type:'side', name:'Cerita Kakek', diff:'easy',
   icon:'👴', desc:'Dengarkan cerita Kakek Hasan tentang sejarah kota.',
   reward:'Kepercayaan +6, Buka Berita Sejarah', npc:'kakek_hasan'},
  {id:'sq19', type:'side', name:'Foto Kota', diff:'easy',
   icon:'📷', desc:'Ambil 3 foto landmark kota untuk papan berita.',
   reward:'Kepercayaan +8, Buka Papan Berita', npc:'jurnalis_muda'},
  {id:'sq20', type:'side', name:'Penjaga Malam', diff:'med',
   icon:'🌙', desc:'Bantu penjaga malam ronda di wilayah perumahan.',
   reward:'Kepercayaan +15', npc:'penjaga_malam'},
  {id:'sq21', type:'side', name:'Promosi Minimarket', diff:'easy',
   icon:'🏷️', desc:'Bantu tempel poster promosi minimarket.',
   reward:'Kepercayaan +5', npc:'pak_rudi_mini'},
  {id:'sq22', type:'side', name:'Kebocoran Data', diff:'hard',
   icon:'🔐', desc:'Temukan pelaku kebocoran data warga di sistem online.',
   reward:'Integritas +20, Kepercayaan +20', npc:'kepala_tik'},
  {id:'sq23', type:'side', name:'Siswa Bolos', diff:'med',
   icon:'🎓', desc:'Ajak siswa yang bolos kembali ke sekolah.',
   reward:'Kepercayaan +10', npc:'siswa_bolos'},
  {id:'sq24', type:'side', name:'Jembatan Rusak', diff:'hard',
   icon:'🌉', desc:'Laporkan dan kawal perbaikan jembatan kecil yang rusak.',
   reward:'Kepercayaan +25', npc:'kepala_desa'},
  {id:'sq25', type:'side', name:'Lomba Menggambar', diff:'easy',
   icon:'🖼️', desc:'Jadilah juri lomba menggambar anak-anak SD.',
   reward:'Kepercayaan +8', npc:'kepala_sd'},
  {id:'sq26', type:'side', name:'Listrik Padam', diff:'med',
   icon:'⚡', desc:'Bantu warga melapor gangguan listrik ke PLN.',
   reward:'Kepercayaan +12', npc:'warga_listrik'},
  {id:'sq27', type:'side', name:'Donor Darah', diff:'easy',
   icon:'🩸', desc:'Ikuti program donor darah di kantor dinas.',
   reward:'Kepercayaan +10, Integritas +5', npc:'perawat'},
  {id:'sq28', type:'side', name:'Warisan Budaya', diff:'med',
   icon:'🎭', desc:'Bantu sanggar seni mempersiapkan pertunjukan budaya.',
   reward:'Kepercayaan +15', npc:'pak_seni'},
  {id:'sq29', type:'side', name:'Pedagang Kaki Lima', diff:'easy',
   icon:'🛺', desc:'Bantu pedagang kaki lima mendapatkan izin resmi.',
   reward:'Kepercayaan +10', npc:'pedagang_pkl'},
  {id:'sq30', type:'side', name:'Majalah Sekolah', diff:'med',
   icon:'📰', desc:'Tulis artikel untuk majalah dinding sekolah.',
   reward:'Kepercayaan +10, Buka Berita', npc:'osis'},
  {id:'sq31', type:'side', name:'Banjir Kecil', diff:'hard',
   icon:'🌊', desc:'Koordinasikan warga membersihkan drainase tersumbat.',
   reward:'Kepercayaan +22', npc:'ketua_rw'},
  {id:'sq32', type:'side', name:'Toko Kelontong', diff:'easy',
   icon:'🏬', desc:'Bantu menghitung stok barang di toko kelontong.',
   reward:'Kepercayaan +6', npc:'pemilik_kelontong'},
  {id:'sq33', type:'side', name:'Pernikahan Warga', diff:'easy',
   icon:'💒', desc:'Bantu persiapan dekorasi pernikahan warga.',
   reward:'Kepercayaan +8', npc:'pengantin'},
  {id:'sq34', type:'side', name:'Laporan Tahunan', diff:'hard',
   icon:'📈', desc:'Bantu menyusun laporan tahunan kantor dinas dengan benar.',
   reward:'Integritas +15, Kepercayaan +15', npc:'bu_sari'},
  {id:'sq35', type:'side', name:'Orasi Wisuda', diff:'med',
   icon:'🎓', desc:'Bantu adik kelas menulis pidato wisuda.',
   reward:'Kepercayaan +12', npc:'mahasiswa_wisuda'},
  {id:'sq36', type:'side', name:'Peta Kota Baru', diff:'med',
   icon:'🗺️', desc:'Bantu pemetaan area baru kota untuk dinas tata kota.',
   reward:'Kepercayaan +14', npc:'surveyor'},
  {id:'sq37', type:'side', name:'Kotak Saran', diff:'easy',
   icon:'📮', desc:'Kumpulkan saran warga dari kotak saran di balai kota.',
   reward:'Kepercayaan +7', npc:'petugas_balai'},
  {id:'sq38', type:'side', name:'Keamanan Sekolah', diff:'med',
   icon:'🔒', desc:'Pasang kamera pengawas baru di area sekolah.',
   reward:'Integritas +10, Kepercayaan +12', npc:'satpam_sekolah'},
  {id:'sq39', type:'side', name:'Proyek Hijau', diff:'hard',
   icon:'♻️', desc:'Galang dana komunitas untuk taman kota baru.',
   reward:'Kepercayaan +25, Integritas +10', npc:'aktivis_lingkungan'},
  {id:'sq40', type:'side', name:'Akhir Magang', diff:'hard',
   icon:'🏆', desc:'Buat presentasi hasil magang 7 hari untuk kepala dinas.',
   reward:'Integritas +30, Kepercayaan +30, Selesaikan Game', npc:'bu_sari'},

  // DAILY QUESTS (3 per day: easy, med, hard)
  {id:'dq1', type:'daily', name:'Absen Tepat Waktu', diff:'easy',
   icon:'⏰', desc:'Tiba di kantor sebelum pukul 08.05.',
   reward:'Integritas +5'},
  {id:'dq2', type:'daily', name:'Bantu 2 Warga', diff:'med',
   icon:'🤝', desc:'Bantu 2 warga kota hari ini.',
   reward:'Kepercayaan +10'},
  {id:'dq3', type:'daily', name:'Temukan Kejanggalan', diff:'hard',
   icon:'🔍', desc:'Temukan 1 kejanggalan atau pelanggaran hari ini.',
   reward:'Integritas +15, Shadow -5'},
];

// ────────────────────────────────────────────────────────────
//  NPC DATA
// ────────────────────────────────────────────────────────────
const NPCS_DATA = [
  // Office
  {id:'bu_sari',    name:'Bu Sari',    emoji:'👩‍💼', color:'#9c27b0',
   x: 68, y: 28, zone:'office',
   dialog:['Selamat datang di Kantor Dinas Kota!','Ingat — Integritas adalah kunci karir yang baik.','Ada yang bisa saya bantu?'],
   questIds:['mq1','mq34','sq40']},
  {id:'pak_budi',   name:'Pak Budi',   emoji:'🧑‍💼', color:'#e74c3c',
   x: 72, y: 30, zone:'office',
   dialog:['Eh, magang baru ya?','Sini sini, tolong tanda tangani berkas ini dulu...','Jangan banyak tanya, ikut perintah saja!'],
   questIds:['mq2']},
  {id:'bu_rina',    name:'Bu Rina',    emoji:'👩‍🔬', color:'#ff5722',
   x: 75, y: 32, zone:'office',
   dialog:['Data itu cuma angka-angka...','Kadang perlu sedikit "penyesuaian" supaya laporan terlihat bagus.','Kamu mengerti maksud saya, kan?'],
   questIds:['mq4']},
  {id:'pak_camat',  name:'Pak Camat',  emoji:'👨‍⚖️', color:'#795548',
   x: 65, y: 26, zone:'office',
   dialog:['Sebagai camat, saya punya kuasa di sini.','Semua bisa diatur asalkan kamu kooperatif.','Pikirkan masa depanmu baik-baik.'],
   questIds:['mq9']},
  {id:'inspektorat',name:'Ibu Inspektur',emoji:'🕵️‍♀️', color:'#009688',
   x: 62, y: 28, zone:'office',
   dialog:['Kantor Inspektorat selalu siap menerima laporan.','Jika kamu menemukan pelanggaran, laporkan ke sini.','Kebenaran harus ditegakkan!'],
   questIds:['mq6']},

  // School
  {id:'bu_anis',    name:'Bu Anis',    emoji:'👩‍🏫', color:'#2196f3',
   x: 30, y: 55, zone:'school',
   dialog:['Selamat datang di SMA Nusantara!','Pendidikan adalah investasi terbaik.','Mau bantu saya menyiapkan bahan ajar?'],
   questIds:['sq6']},
  {id:'kepala_sekolah', name:'Kepala Sekolah', emoji:'🧑‍🏫', color:'#1565c0',
   x: 28, y: 52, zone:'school',
   dialog:['Sekolah ini adalah kebanggaan warga.','Kami terus berupaya meningkatkan kualitas.','Terima kasih sudah membantu!'],
   questIds:['sq8','sq38']},
  {id:'siswa_bolos', name:'Doni (Siswa)', emoji:'🎒', color:'#ff9800',
   x: 35, y: 58, zone:'park',
   dialog:['Belajar itu membosankan...','Siapa yang peduli nilai sekolah?','Hmm, mungkin kamu benar juga...'],
   questIds:['sq23']},
  {id:'osis',        name:'Ketua OSIS', emoji:'🎓', color:'#8bc34a',
   x: 32, y: 57, zone:'school',
   dialog:['Kami sedang persiapan majalah dinding!','Butuh kontributor artikel nih...','Mau nulis sesuatu?'],
   questIds:['sq30']},

  // Market / Shop
  {id:'pak_rudi_mini', name:'Pak Rudi', emoji:'🏪', color:'#ff9800',
   x: 50, y: 72, zone:'minimarket',
   dialog:['Selamat datang di Minimart Nusantara!','Ada yang bisa saya bantu?','Oh soal preman itu... saya takut melapor.'],
   questIds:['mq7','sq21']},
  {id:'nenek_sari',    name:'Nenek Sari', emoji:'👵', color:'#a5d6a7',
   x: 52, y: 74, zone:'market',
   dialog:['Aduh, bawaannya berat sekali...','Terima kasih ya sudah mau bantu nenek!','Semoga kamu dilancarkan rezekinya.'],
   questIds:['sq3']},
  {id:'pedagang_pkl',  name:'Bang Udin', emoji:'🛺', color:'#ff7043',
   x: 48, y: 70, zone:'market',
   dialog:['Dagang di sini susah banget...','Sering diusir satpol PP karena nggak punya izin.','Kalau ada yang bisa bantu urus izin, syukur deh.'],
   questIds:['sq29']},

  // Residential
  {id:'bu_dewi',    name:'Bu Dewi',    emoji:'🏠', color:'#e91e63',
   x: 20, y: 40, zone:'residential',
   dialog:['Mimiiii! Kucing saya hilang!','Namanya Mimii, berwarna putih belang oranye.','Tolong bantu carinya ya...'],
   questIds:['sq1']},
  {id:'kakek_hasan', name:'Kakek Hasan', emoji:'👴', color:'#8d6e63',
   x: 25, y: 42, zone:'residential',
   dialog:['Dulu kota ini kecil sekali...','Saya masih ingat saat jalan utama pertama diaspal.','Mau dengar cerita saya?'],
   questIds:['sq18']},
  {id:'warga_muda',  name:'Eko (Warga)', emoji:'👱', color:'#42a5f5',
   x: 22, y: 44, zone:'residential',
   dialog:['Sudah melamar ke 20 perusahaan tapi belum dapat panggilan.','Surat lamaran saya mungkin kurang menarik...','Bisa tolong bantu?'],
   questIds:['sq13']},
  {id:'ketua_rt',    name:'Pak RT Subur', emoji:'🏘️', color:'#26a69a',
   x: 18, y: 38, zone:'residential',
   dialog:['Ada rapat RT nanti malam.','Mohon kehadiran semua warga.','Banyak hal penting yang perlu dibahas.'],
   questIds:['sq14']},
  {id:'penjaga_malam', name:'Pak Hendra', emoji:'🌙', color:'#37474f',
   x: 15, y: 36, zone:'residential',
   dialog:['Malam ini giliran ronda.','Tolong bantu jaga keamanan lingkungan.','Banyak kejadian mencurigakan belakangan ini.'],
   questIds:['sq20']},

  // Park / Outdoor
  {id:'pak_taman',   name:'Pak Taman',  emoji:'🌳', color:'#4caf50',
   x: 40, y: 45, zone:'park',
   dialog:['Taman kota perlu lebih banyak pohon!','Ayo kita tanam bibit pohon bersama.','Lingkungan sehat, warga sehat!'],
   questIds:['sq9']},
  {id:'jurnalis_muda', name:'Rini (Jurnalis)', emoji:'📷', color:'#ff6f00',
   x: 42, y: 47, zone:'park',
   dialog:['Saya sedang mengumpulkan foto untuk artikel kota.','Butuh foto dari berbagai sudut kota nih.','Mau bantu saya?'],
   questIds:['sq19']},
  {id:'aktivis_lingkungan', name:'Maya (Aktivis)', emoji:'♻️', color:'#66bb6a',
   x: 38, y: 43, zone:'park',
   dialog:['Kita perlu taman kota yang lebih hijau!','Mari galang dana untuk proyek hijau bersama.','Lingkungan adalah tanggung jawab kita semua.'],
   questIds:['sq39']},

  // Special / Mystery
  {id:'calo gudang_tua',  name:'Calo (Gudang Tua)', emoji:'🌑', color:'#8b0000',
   x: 90, y: 85, zone:'ruins',
   dialog:['...','Kamu sudah terlalu dekat dengan kebenaran.','Bergabunglah dengan kami, atau hadapi konsekuensinya!'],
   questIds:['mq10']},
  {id:'pak_pos',     name:'Pak Pos',    emoji:'📬', color:'#1976d2',
   x: 55, y: 68, zone:'road',
   dialog:['Ada paket yang perlu diantar nih.','Kebetulan sekali kamu lewat sini!','Mau bantu antar tidak?'],
   questIds:['sq2']},
];

// ────────────────────────────────────────────────────────────
//  MAP GENERATOR
// ────────────────────────────────────────────────────────────
function createMap() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    map.push(new Uint8Array(MAP_W).fill(T.GRASS));
  }

  function fill(x1,y1,x2,y2,t) {
    for (let y=y1; y<=y2; y++) for (let x=x1; x<=x2; x++) {
      if (y>=0&&y<MAP_H&&x>=0&&x<MAP_W) map[y][x]=t;
    }
  }
  function rect(x1,y1,x2,y2,wall,floor) {
    for (let x=x1; x<=x2; x++) { map[y1][x]=wall; map[y2][x]=wall; }
    for (let y=y1; y<=y2; y++) { map[y][x1]=wall; map[y][x2]=wall; }
    fill(x1+1,y1+1,x2-1,y2-1,floor);
  }

  // Main roads
  fill(0,38,MAP_W-1,40,T.ROAD);  // horizontal main road
  fill(0,78,MAP_W-1,80,T.ROAD);  // horizontal second road
  fill(55,0,57,MAP_H-1,T.ROAD);  // vertical main road
  fill(10,0,12,MAP_H-1,T.ROAD);  // vertical left road
  fill(88,0,90,MAP_H-1,T.ROAD);  // vertical right road

  // Sidewalks
  fill(0,37,MAP_W-1,37,T.SIDEWALK);
  fill(0,41,MAP_W-1,41,T.SIDEWALK);
  fill(0,77,MAP_W-1,77,T.SIDEWALK);
  fill(0,81,MAP_W-1,81,T.SIDEWALK);

  // ── OFFICE DISTRICT (right area)
  fill(60,20,95,50,T.DIRT);
  rect(62,22,85,46,T.WALL_H,T.FLOOR_W);
  // Desks
  for (let dx=0;dx<4;dx++) for (let dy=0;dy<3;dy++) {
    map[24+dy*5][64+dx*5]=T.DESK;
    map[25+dy*5][64+dx*5]=T.CHAIR;
  }
  map[46][72]=T.DOOR; map[46][73]=T.DOOR;
  // Inspektorat
  rect(62,48,78,60,T.WALL_V,T.FLOOR_T);
  map[60][68]=T.DOOR;

  // ── SCHOOL DISTRICT (upper-left)
  fill(14,42,52,72,T.DIRT);
  // Main school building
  rect(16,44,50,68,T.WALL_H,T.FLOOR_G);
  // Classrooms
  fill(17,44,30,56,T.FLOOR_G);
  fill(32,44,49,56,T.FLOOR_G);
  // Gym/Hall
  rect(16,58,50,67,T.WALL_V,T.FLOOR_B);
  map[68][32]=T.DOOR; map[67][32]=T.DOOR;
  map[68][33]=T.DOOR; map[67][33]=T.DOOR;
  // School field
  fill(14,70,52,90,T.GRASS);
  fill(20,72,46,88,T.PATH);
  // Trees around school
  for (let i=0;i<8;i++) map[43][17+i*4]=T.TREE;

  // ── MINIMARKET (center)
  fill(42,58,58,76,T.SIDEWALK);
  rect(44,60,56,74,T.WALL_H,T.FLOOR_W);
  // Shelves
  for (let sx=0;sx<3;sx++) map[62][46+sx*3]=T.SHELF;
  map[74][49]=T.DOOR; map[74][50]=T.DOOR;

  // ── RESIDENTIAL AREA (left)
  fill(0,0,12,37,T.GRASS);
  fill(13,42,12,MAP_H-1,T.GRASS);
  // Houses (multiple)
  const housePositions = [
    [1,2,9,12],[1,14,9,24],[1,26,9,36],
    [0,43,9,53],[0,55,9,65],[0,67,9,77],[0,82,9,92],
  ];
  const roofColors = [T.ROOF_R,T.ROOF_B,T.ROOF_G,T.ROOF_Y,T.ROOF_P,T.ROOF_R,T.ROOF_B];
  housePositions.forEach(([x1,y1,x2,y2],i) => {
    rect(x1,y1,x2,y2,roofColors[i],T.FLOOR_W);
    map[y2][Math.floor((x1+x2)/2)]=T.DOOR;
    // furniture
    map[y1+2][x1+2]=T.BED;
    map[y1+4][x1+2]=T.TABLE;
    map[y2-2][x2-2]=T.TV;
  });

  // ── PARK (center-left)
  fill(14,0,54,37,T.GRASS);
  fill(20,5,48,35,T.GRASS);
  // Park features
  for (let i=0;i<6;i++) map[8+i*4][22+i*3]=T.TREE;
  for (let i=0;i<5;i++) map[10+i*3][45-i*2]=T.BUSH;
  fill(30,15,38,23,T.PATH); // pond area
  fill(32,17,36,21,T.WATER);
  // Benches
  map[14][25]=T.CHAIR; map[14][30]=T.CHAIR; map[20][25]=T.CHAIR;
  // Flowers
  for (let i=0;i<10;i++) map[6+i][20]=T.FLOWER;

  // ── SECOND ROAD DISTRICT (lower)
  fill(58,82,88,99,T.DIRT);
  // More offices
  rect(60,83,80,98,T.WALL_H,T.FLOOR_T);
  // Workplaces
  rect(14,82,52,98,T.WALL_V,T.FLOOR_B);
  for (let wx=0;wx<3;wx++) map[98][20+wx*10]=T.DOOR;

  // ── RUINS / SHADOW HIDEOUT (far right)
  fill(91,82,MAP_W-1,MAP_H-1,T.DIRT);
  rect(92,84,118,98,T.WALL_V,T.FLOOR_W);
  map[98][104]=T.DOOR;

  // ── ROAD MARKINGS & DECOR
  for (let x=0;x<MAP_W;x+=4) { map[39][x]=T.ROAD_MARK; map[79][x]=T.ROAD_MARK; }
  for (let y=0;y<MAP_H;y+=4) { map[y][56]=T.ROAD_MARK; }

  // Rocks and random nature
  const rng = (n) => Math.floor(Math.random()*n);
  for (let i=0;i<30;i++) {
    const rx=2+rng(MAP_W-4), ry=2+rng(MAP_H-4);
    if (map[ry][rx]===T.GRASS) map[ry][rx]=T.ROCK;
  }
  // Extra trees
  for (let i=0;i<40;i++) {
    const rx=2+rng(MAP_W-4), ry=2+rng(MAP_H-4);
    if (map[ry][rx]===T.GRASS) map[ry][rx]=T.TREE;
  }

  // Notice board in park
  map[12][35]=T.BOARD;
  map[12][36]=T.NOTICE;

  return map;
}

// ────────────────────────────────────────────────────────────
//  COLLISION MAP
// ────────────────────────────────────────────────────────────
const SOLID_TILES = new Set([
  T.WALL_H, T.WALL_V, T.TREE, T.WATER, T.DESK,
  T.BED, T.SHELF, T.PLANT, T.TV, T.LAMP,
  T.FENCE, T.ROCK, T.VOID
]);
const SOLID_NPC = true;

// ────────────────────────────────────────────────────────────
//  PLAYER
// ────────────────────────────────────────────────────────────
const player = {
  x: 68 * TILE + 16,
  y: 50 * TILE + 16,
  vx: 0, vy: 0,
  facing: 'down',   // up|down|left|right
  moving: false,
  running: false,
  animFrame: 0,
  animTimer: 0,
  ANIM_SPEED: 8,
};

// ────────────────────────────────────────────────────────────
//  RENDERER COLORS
// ────────────────────────────────────────────────────────────
const TILE_COLOR = {
  [T.GRASS]:    '#3a7d44',
  [T.ROAD]:     '#555566',
  [T.SAND]:     '#c8a96a',
  [T.WATER]:    '#2980b9',
  [T.DIRT]:     '#8d6e63',
  [T.WALL_H]:   '#9e9e9e',
  [T._V]:   '#bdbdbd',
  [T.ROOF_R]:   '#c62828',
  [T.ROOF_B]:   '#1565c0',
  [T.ROOF_G]:   '#2e7d32',
  [T.ROOF_Y]:   '#f9a825',
  [T.ROOF_P]:   '#6a1b9a',
  [T.FLOOR_W]:  '#f5f5f5',
  [T.FLOOR_T]:  '#b2dfdb',
  [T.FLOOR_G]:  '#c8e6c9',
  [T.FLOOR_B]:  '#bbdefb',
  [T.DOOR]:     '#a1887f',
  [T.WINDOW]:   '#80deea',
  [T.TREE]:     '#27ae60',
  [T.BUSH]:     '#388e3c',
  [T.FENCE]:    '#795548',
  [T.PATH]:     '#bcaaa4',
  [T.FLOWER]:   '#e91e63',
  [T.ROCK]:     '#78909c',
  [T.DESK]:     '#8d6e63',
  [T.CHAIR]:    '#a1887f',
  [T.BED]:      '#7986cb',
  [T.TABLE]:    '#8d6e63',
  [T.SHELF]:    '#6d4c41',
  [T.PLANT]:    '#66bb6a',
  [T.TV]:       '#263238',
  [T.LAMP]:     '#ffd54f',
  [T.ROAD_MARK]:'#ffee58',
  [T.SIDEWALK]: '#eeeeee',
  [T.CURB]:     '#9e9e9e',
  [T.BOARD]:    '#795548',
  [T.NOTICE]:   '#f5f5f5',
  [T.VOID]:     '#000',
};

const TILE_EMOJI = {
  [T.TREE]:   '🌳',
  [T.BUSH]:   '🌿',
  [T.FLOWER]: '🌸',
  [T.ROCK]:   '🪨',
  [T.DESK]:   '🖥',
  [T.BED]:    '🛏',
  [T.TABLE]:  '🪑',
  [T.SHELF]:  '📚',
  [T.TV]:     '📺',
  [T.LAMP]:   '💡',
  [T.BOARD]:  '📋',
  [T.NOTICE]: '📰',
  [T.WATER]:  '💧',
  [T.DOOR]:   '🚪',
};

// ────────────────────────────────────────────────────────────
//  ITEMS DATA
// ────────────────────────────────────────────────────────────
const ITEMS_START = [
  {id:'phone',    emoji:'📱', name:'Ponsel',     qty:1},
  {id:'notebook', emoji:'📓', name:'Buku Catatan', qty:1},
  {id:'pen',      emoji:'🖊️', name:'Pena',       qty:3},
  {id:'badge',    emoji:'🪪', name:'ID Magang',  qty:1},
];

// ────────────────────────────────────────────────────────────
//  NEWS DATA
// ────────────────────────────────────────────────────────────
const NEWS_INITIAL = [
  {id:'n1', title:'Selamat Datang di Kota Nusantara!',
   date:'Hari 1', emoji:'🌅', text:'Kota Nusantara menyambut peserta magang baru dengan penuh harapan.',
   unlocked:true},
  {id:'n2', title:'Program Magang Kota Dibuka',
   date:'Hari 1', emoji:'🏢', text:'Pemerintah Kota Nusantara membuka program magang untuk generasi muda.',
   unlocked:true},
  {id:'n3', title:'Warga Laporkan Kejanggalan Anggaran',
   date:'Hari 2', emoji:'💰', text:'[Terkunci — Selesaikan misi untuk membuka berita ini]',
   unlocked:false},
  {id:'n4', title:'Inspektorat Periksa Laporan Berkas',
   date:'Hari 3', emoji:'🔍', text:'[Terkunci]', unlocked:false},
  {id:'n5', title:'Akar Bayangan: Fakta atau Mitos?',
   date:'Hari 4', emoji:'🌑', text:'[Terkunci]', unlocked:false},
  {id:'n6', title:'Warga Berhasil Lawan Preman Kota',
   date:'Hari 5', emoji:'💪', text:'[Terkunci]', unlocked:false},
  {id:'n7', title:'Identitas Akar Bayangan Terungkap!',
   date:'Hari 7', emoji:'🎉', text:'[Terkunci]', unlocked:false},
];

// ────────────────────────────────────────────────────────────
//  AUDIO ENGINE (Web Audio API)
// ────────────────────────────────────────────────────────────
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function playTone(freq, type='sine', dur=0.15, vol=0.15) {
  if (!audioCtx) return;
  const g = audioCtx.createGain();
  const o = audioCtx.createOscillator();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol * GS.sfxVol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function sfxStep()     { playTone(120+Math.random()*40,'triangle',0.05,0.04); }
function sfxInteract() { playTone(440,'sine',0.1,0.12); playTone(660,'sine',0.1,0.12); }
function sfxQuest()    { [440,550,660,880].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.12,0.15),i*80)); }
function sfxGood()     { [330,440,550,660].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',0.1,0.12),i*60)); }
function sfxBad()      { [220,196,165].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.12,0.15),i*80)); }
function sfxShadow()   { [110,98,82,65].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.2,0.2),i*100)); }

let bgmInterval = null;
function startBGM() {
  if (bgmInterval) return;
  const melody = [262,294,330,349,392,440,494,523];
  let idx = 0;
  bgmInterval = setInterval(() => {
    if (!GS.paused && GS.phase==='game') {
      playTone(melody[idx%melody.length],'triangle',0.4,0.06*GS.musicVol);
      idx++;
    }
  }, 400);
}

// ────────────────────────────────────────────────────────────
//  CANVAS & RENDERING
// ────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameMap = null;
let npcs = [];
let particles = [];
let lastTime = 0;
let stepTimer = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawTile(x, y, t, cx, cy) {
  const px = x * TILE - cx;
  const py = y * TILE - cy;
  if (px < -TILE || py < -TILE || px > canvas.width || py > canvas.height) return;

  const color = TILE_COLOR[t] || '#888';
  ctx.fillStyle = color;
  ctx.fillRect(px, py, TILE, TILE);

  switch(t) {
    case T.GRASS: {
      // Lush grass with texture variation
      const gv = ((x*7+y*13)%5);
      ctx.fillStyle = gv>3?'#2d6e38':gv>1?'#3a7d44':'#44944f';
      ctx.fillRect(px,py,TILE,TILE);
      // Grass tufts
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      if ((x+y)%3===0) { ctx.fillRect(px+2,py+2,3,6); ctx.fillRect(px+10,py+8,3,5); }
      if ((x+y)%4===0) { ctx.fillRect(px+18,py+3,2,5); }
      break;
    }
    case T.ROAD: {
      ctx.fillStyle = '#4a4a5a';
      ctx.fillRect(px,py,TILE,TILE);
      // Asphalt texture
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(px,py,TILE,1); ctx.fillRect(px,py+TILE-1,TILE,1);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      if ((x+y)%5===0) ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
      break;
    }
    case T.SIDEWALK: {
      ctx.fillStyle = '#d4d0c8';
      ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      // Pavement cracks
      if ((x*3+y)%8===0){ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.beginPath();ctx.moveTo(px+5,py+2);ctx.lineTo(px+9,py+10);ctx.stroke();}
      break;
    }
    case T.ROAD_MARK: {
      ctx.fillStyle = '#4a4a5a'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(px+10,py+2,12,4);
      break;
    }
    case T.WATER: {
      const wt = Date.now()*0.001;
      const wave = Math.sin(wt + x*0.5 + y*0.3) * 0.1;
      ctx.fillStyle = `hsl(210,70%,${38+wave*5}%)`;
      ctx.fillRect(px,py,TILE,TILE);
      // Shimmer lines
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      const sh = ((Date.now()/400+x+y)%3)|0;
      if(sh===0){ctx.fillRect(px+2,py+4,8,2); ctx.fillRect(px+16,py+20,6,2);}
      if(sh===1){ctx.fillRect(px+14,py+8,7,2); ctx.fillRect(px+4,py+22,8,2);}
      // Ripple
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,8,0,Math.PI*2); ctx.stroke();
      break;
    }
    case T.DIRT: {
      ctx.fillStyle = '#7a5c4a'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.1)';
      if((x*5+y*3)%7<2){ctx.beginPath();ctx.arc(px+8,py+12,4,0,Math.PI*2);ctx.fill();}
      break;
    }
    // ── WALLS (buildings) – rich 3D look
    case T.WALL_H: {
      // Main wall face
      ctx.fillStyle = '#c8bfa8'; ctx.fillRect(px,py,TILE,TILE);
      // Brick pattern
      const row = y%2;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for(let bx=0;bx<4;bx++){
        const boff = row===0?0:TILE/8;
        ctx.fillRect(px+boff+bx*(TILE/4+1),py+1,1,TILE/2-1);
        ctx.fillRect(px+bx*(TILE/4+1),py+TILE/2+1,1,TILE/2-2);
      }
      ctx.fillRect(px,py+TILE/2,TILE,1);
      // Highlight top
      ctx.fillStyle='rgba(255,255,255,0.15)';
      ctx.fillRect(px,py,TILE,3);
      // Shadow bottom
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.fillRect(px,py+TILE-3,TILE,3);
      break;
    }
    case T.WALL_V: {
      ctx.fillStyle = '#bdb0a0'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.08)';
      for(let wy=0;wy<3;wy++) ctx.fillRect(px,py+wy*(TILE/3),TILE,1);
      for(let wx=0;wx<3;wx++) ctx.fillRect(px+wx*(TILE/3),py,1,TILE);
      ctx.fillStyle='rgba(255,255,255,0.12)';
      ctx.fillRect(px,py,3,TILE);
      break;
    }
    // ── ROOFS – vivid colored with ridgeline
    case T.ROOF_R: case T.ROOF_B: case T.ROOF_G: case T.ROOF_Y: case T.ROOF_P: {
      const roofCols = {[T.ROOF_R]:'#d32f2f',[T.ROOF_B]:'#1565c0',[T.ROOF_G]:'#2e7d32',[T.ROOF_Y]:'#f9a825',[T.ROOF_P]:'#6a1b9a'};
      const baseCol = roofCols[t];
      ctx.fillStyle = baseCol; ctx.fillRect(px,py,TILE,TILE);
      // Tile lines
      ctx.fillStyle='rgba(0,0,0,0.15)';
      for(let ry=0;ry<4;ry++) ctx.fillRect(px,py+ry*8,TILE,2);
      // Highlight edge
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(px,py,TILE,3);
      // Dark eave
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(px,py+TILE-4,TILE,4);
      break;
    }
    // ── FLOORS
    case T.FLOOR_W: {
      ctx.fillStyle='#f0ece0'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.05)';
      if(x%2===y%2) ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      break;
    }
    case T.FLOOR_T: {
      ctx.fillStyle='#b0ccc8'; ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      break;
    }
    case T.FLOOR_G: {
      ctx.fillStyle='#c2ddc0'; ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      break;
    }
    case T.FLOOR_B: {
      ctx.fillStyle='#b8d4f0'; ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      break;
    }
    // ── DOOR – detailed
    case T.DOOR: {
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='#8d6e63'; ctx.fillRect(px+3,py+2,TILE-6,TILE-3);
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(px+3,py+2,2,TILE-3);
      // Knob
      ctx.fillStyle='#ffd54f';
      ctx.beginPath(); ctx.arc(px+TILE-6,py+TILE/2,2,0,Math.PI*2); ctx.fill();
      // Window in door
      ctx.fillStyle='rgba(173,216,230,0.5)';
      ctx.fillRect(px+6,py+4,TILE-12,8);
      break;
    }
    case T.WINDOW: {
      ctx.fillStyle = '#80deea'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillRect(px+2,py+2,6,6);
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.fillRect(px+TILE/2-1,py,2,TILE); ctx.fillRect(px,py+TILE/2-1,TILE,2);
      break;
    }
    // ── NATURE – rich 3D trees
    case T.TREE: {
      // Trunk
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(px+12,py+16,8,16);
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(px+12,py+16,3,16);
      // Canopy layers
      const treeCol = ((x*11+y*7)%3===0)?'#2d6e38':((x*11+y*7)%3===1)?'#388e3c':'#43a047';
      ctx.fillStyle=treeCol;
      ctx.beginPath(); ctx.arc(px+16,py+14,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(px+18,py+15,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=treeCol; ctx.beginPath(); ctx.arc(px+14,py+10,10,0,Math.PI*2); ctx.fill();
      // Highlight
      ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(px+12,py+8,5,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.BUSH: {
      ctx.fillStyle='#33691e'; ctx.beginPath(); ctx.arc(px+8,py+18,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#558b2f'; ctx.beginPath(); ctx.arc(px+16,py+16,9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7cb342'; ctx.beginPath(); ctx.arc(px+24,py+18,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(px+14,py+14,4,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.FLOWER: {
      ctx.fillStyle='#4caf50'; ctx.fillRect(px+14,py+12,3,18);
      const fColors=['#e91e63','#ff9800','#ffeb3b','#9c27b0','#f44336'];
      const fc = fColors[(x+y)%fColors.length];
      ctx.fillStyle=fc;
      for(let i=0;i<5;i++){
        const fa=i*(Math.PI*2/5);
        ctx.beginPath(); ctx.arc(px+16+Math.cos(fa)*5,py+12+Math.sin(fa)*5,3.5,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle='#fff176'; ctx.beginPath(); ctx.arc(px+16,py+12,3,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.ROCK: {
      ctx.fillStyle='#78909c';
      ctx.beginPath(); ctx.ellipse(px+16,py+18,13,10,0.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#90a4ae'; ctx.beginPath(); ctx.ellipse(px+14,py+16,10,8,0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(px+11,py+13,5,4,0.3,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.FENCE: {
      ctx.fillStyle='#8d6e63'; ctx.fillRect(px,py+12,TILE,4);
      ctx.fillStyle='#795548';
      ctx.fillRect(px+4,py+4,5,20); ctx.fillRect(px+20,py+4,5,20);
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(px+4,py+4,2,20);
      break;
    }
    case T.PATH: {
      ctx.fillStyle='#c8b89a'; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.08)';
      if((x+y)%3===0) ctx.fillRect(px+2,py+2,TILE-4,TILE-4);
      break;
    }
    // ── FURNITURE – detailed
    case T.DESK: {
      ctx.fillStyle='#6d4c41'; ctx.fillRect(px+2,py+2,TILE-4,TILE-4);
      ctx.fillStyle='#8d6e63'; ctx.fillRect(px+2,py+2,TILE-4,6);
      ctx.fillStyle='#37474f'; ctx.fillRect(px+6,py+6,TILE-12,TILE-12);
      ctx.fillStyle='rgba(100,180,255,0.3)'; ctx.fillRect(px+7,py+7,TILE-14,TILE-14);
      // Screen glow
      ctx.fillStyle='rgba(100,200,255,0.15)'; ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
      break;
    }
    case T.CHAIR: {
      ctx.fillStyle='#a1887f'; ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
      ctx.fillStyle='#6d4c41'; ctx.fillRect(px+4,py+4,TILE-8,5);
      ctx.fillStyle='#8d6e63'; ctx.fillRect(px+5,py+TILE-10,5,8); ctx.fillRect(px+TILE-10,py+TILE-10,5,8);
      break;
    }
    case T.BED: {
      ctx.fillStyle='#7986cb'; ctx.fillRect(px+2,py+2,TILE-4,TILE-4);
      ctx.fillStyle='#5c6bc0'; ctx.fillRect(px+2,py+2,TILE-4,10);
      ctx.fillStyle='#fff'; ctx.fillRect(px+4,py+4,TILE-8,6);
      ctx.fillStyle='#f8bbd9'; ctx.beginPath(); ctx.arc(px+16,py+6,4,0,Math.PI*2); ctx.fill();
      break;
    }
    case T.SHELF: {
      ctx.fillStyle='#5d4037'; ctx.fillRect(px+1,py+1,TILE-2,TILE-2);
      ctx.fillStyle='#6d4c41';
      ctx.fillRect(px+1,py+1,TILE-2,4); ctx.fillRect(px+1,py+13,TILE-2,4); ctx.fillRect(px+1,py+25,TILE-2,4);
      // Books
      const bookCols=['#f44336','#2196f3','#4caf50','#ff9800','#9c27b0'];
      for(let bi=0;bi<4;bi++){ctx.fillStyle=bookCols[bi%bookCols.length]; ctx.fillRect(px+3+bi*6,py+5,5,8);}
      for(let bi=0;bi<3;bi++){ctx.fillStyle=bookCols[(bi+2)%bookCols.length]; ctx.fillRect(px+4+bi*7,py+17,6,8);}
      break;
    }
    case T.TV: {
      ctx.fillStyle='#1a1a2e'; ctx.fillRect(px+1,py+1,TILE-2,TILE-2);
      ctx.fillStyle='#0d1117'; ctx.fillRect(px+3,py+3,TILE-6,TILE-10);
      // Screen content
      ctx.fillStyle='rgba(0,150,255,0.4)'; ctx.fillRect(px+4,py+4,TILE-8,TILE-12);
      ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(px+4,py+4,3,TILE-12);
      // Stand
      ctx.fillStyle='#333'; ctx.fillRect(px+10,py+TILE-8,12,6); ctx.fillRect(px+6,py+TILE-4,20,3);
      break;
    }
    case T.LAMP: {
      ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(px+16,py+8,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,213,79,0.3)'; ctx.beginPath(); ctx.arc(px+16,py+8,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#795548'; ctx.fillRect(px+14,py+10,4,18); ctx.fillRect(px+10,py+26,12,4);
      break;
    }
    case T.BOARD: {
      ctx.fillStyle='#5d3a2e'; ctx.fillRect(px+1,py+2,TILE-2,TILE-4);
      ctx.fillStyle='#2d6a4f'; ctx.fillRect(px+3,py+4,TILE-6,TILE-8);
      ctx.fillStyle='rgba(255,255,255,0.6)';
      ctx.fillRect(px+5,py+7,TILE-10,2); ctx.fillRect(px+5,py+12,14,2); ctx.fillRect(px+5,py+17,18,2);
      break;
    }
    default: {
      // Emoji overlay for special tiles
      const em = TILE_EMOJI[t];
      if (em) {
        ctx.font = `${TILE-6}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(em, px+TILE/2, py+TILE/2);
      }
    }
  }
}

function drawPlayer(cx, cy) {
  const px = player.x - cx;
  const py = player.y - cy;
  const ch = getCurrentCharacter();
  const frame = player.animFrame;
  const t = Date.now() * 0.003;
  const bob = player.moving ? Math.sin(frame * 0.9) * 2.5 : Math.sin(t) * 0.5;
  const breathe = player.moving ? 0 : Math.sin(t * 0.7) * 0.5;

  ctx.save();
  ctx.translate(px, py + bob);

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 11, 4, 0, 0, Math.PI*2);
  ctx.fill();

  // ── LEGS (animated walk cycle)
  const legSwing = player.moving ? Math.sin(frame * 0.9) * 7 : 0;
  // Shoes
  ctx.fillStyle = ch.shoeColor;
  ctx.beginPath(); ctx.roundRect(-7, 18 + legSwing, 6, 5, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1, 18 - legSwing, 6, 5, 2); ctx.fill();
  // Pants/legs
  ctx.fillStyle = ch.pantsColor;
  ctx.beginPath(); ctx.roundRect(-6, 10 + legSwing, 5, 10, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1, 10 - legSwing, 5, 10, 1); ctx.fill();

  // ── BODY / SHIRT
  ctx.fillStyle = ch.shirtColor;
  ctx.beginPath();
  ctx.roundRect(-8, -4, 16, 16, [3,3,4,4]);
  ctx.fill();
  // Collar / shirt detail
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.roundRect(-4, -4, 8, 5, 2); ctx.fill();
  // Badge/icon on shirt
  ctx.font = '7px serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(ch.badge, 0, 4);

  // ── ARMS (swing when moving)
  const armSwing = player.moving ? Math.sin(frame * 0.9) * 10 : breathe;
  ctx.fillStyle = ch.skin;
  // Left arm
  ctx.save();
  ctx.translate(-10, 0);
  ctx.rotate((-0.3 + armSwing * 0.04) * (player.facing==='right'?1:-1));
  ctx.fillStyle = ch.shirtColor;
  ctx.beginPath(); ctx.roundRect(-3, -2, 5, 11, 2); ctx.fill();
  ctx.fillStyle = ch.skin;
  ctx.beginPath(); ctx.roundRect(-2, 8, 4, 5, 2); ctx.fill();
  ctx.restore();
  // Right arm
  ctx.save();
  ctx.translate(10, 0);
  ctx.rotate((0.3 - armSwing * 0.04) * (player.facing==='right'?1:-1));
  ctx.fillStyle = ch.shirtColor;
  ctx.beginPath(); ctx.roundRect(-2, -2, 5, 11, 2); ctx.fill();
  ctx.fillStyle = ch.skin;
  ctx.beginPath(); ctx.roundRect(-2, 8, 4, 5, 2); ctx.fill();
  ctx.restore();

  // ── NECK
  ctx.fillStyle = ch.skin;
  ctx.fillRect(-2, -6, 4, 4);

  // ── HEAD
  ctx.fillStyle = ch.skin;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI*2);
  ctx.fill();
  // Head shading
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath(); ctx.arc(3, -12, 8, 0, Math.PI*2); ctx.fill();

  // ── HAIR (based on hairStyle)
  ctx.fillStyle = ch.hair;
  const hs = ch.hairStyle;
  if (hs === 'short' || hs === 'neat') {
    ctx.beginPath(); ctx.roundRect(-10, -24, 20, 12, [8,8,0,0]); ctx.fill();
    if (hs === 'neat') {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.ellipse(-3, -22, 4, 2, -0.3, 0, Math.PI*2); ctx.fill();
    }
  } else if (hs === 'curly') {
    for (let i=0;i<6;i++) {
      ctx.beginPath();
      ctx.arc(-8+i*3, -22, 4, 0, Math.PI*2);
      ctx.fill();
    }
  } else if (hs === 'spiky') {
    ctx.beginPath();
    ctx.moveTo(-10,-24); ctx.lineTo(-6,-30); ctx.lineTo(-2,-24);
    ctx.lineTo(2,-32); ctx.lineTo(6,-24); ctx.lineTo(10,-28);
    ctx.lineTo(12,-22); ctx.lineTo(-10,-22); ctx.closePath(); ctx.fill();
  } else if (hs === 'long') {
    ctx.beginPath(); ctx.roundRect(-10, -24, 20, 12, [8,8,0,0]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-11, -18, 5, 18, 3); ctx.fill();
    ctx.beginPath(); ctx.roundRect(6, -18, 5, 18, 3); ctx.fill();
  } else if (hs === 'hijab') {
    ctx.fillStyle = ch.shirtColor;
    ctx.beginPath(); ctx.arc(0, -14, 12, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-12, -16, 24, 14, [0,0,6,6]); ctx.fill();
    // Hijab pin dot
    ctx.fillStyle = ch.accent;
    ctx.beginPath(); ctx.arc(0, -4, 2, 0, Math.PI*2); ctx.fill();
  } else if (hs === 'bun') {
    ctx.beginPath(); ctx.roundRect(-10, -24, 20, 12, [8,8,0,0]); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -26, 6, 0, Math.PI*2); ctx.fill();
  } else if (hs === 'ponytail') {
    ctx.beginPath(); ctx.roundRect(-10, -24, 20, 12, [8,8,0,0]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(7, -22, 4, 16, 2); ctx.fill();
    ctx.fillStyle = ch.accent;
    ctx.beginPath(); ctx.arc(9, -22, 3, 0, Math.PI*2); ctx.fill();
  }

  // ── FACE (direction-aware)
  ctx.fillStyle = '#1a1a1a';
  if (player.facing === 'down') {
    // Eyes
    ctx.beginPath(); ctx.arc(-3.5, -14, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, -14, 2, 0, Math.PI*2); ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-2.8, -15, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.2, -15, 0.8, 0, Math.PI*2); ctx.fill();
    // Smile
    ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(0, -12, 3, 0.1, Math.PI-0.1); ctx.stroke();
  } else if (player.facing === 'up') {
    // Back of head visible, no face
  } else {
    const ex = player.facing==='right' ? 4 : -4;
    ctx.beginPath(); ctx.arc(ex, -14, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(ex+(player.facing==='right'?0.7:-0.7), -14.7, 0.8, 0, Math.PI*2); ctx.fill();
  }

  // ── NAME TAG
  ctx.font = 'bold 9px Nunito, sans-serif';
  ctx.textAlign = 'center';
  const nameW = ctx.measureText(GS.playerName).width + 12;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.beginPath(); ctx.roundRect(-nameW/2, -36, nameW, 15, 4); ctx.fill();
  ctx.fillStyle = ch.accent;
  ctx.textBaseline = 'middle';
  ctx.fillText(GS.playerName, 0, -29);

  ctx.restore();
}

function drawNPC(npc, cx, cy) {
  const px = npc.x * TILE + TILE/2 - cx;
  const py = npc.y * TILE + TILE/2 - cy;
  if (px < -TILE*2 || py < -TILE*2 || px > canvas.width+TILE || py > canvas.height+TILE) return;

  const bob = Math.sin(Date.now()*0.0018 + npc.x*0.7) * 2;
  const t = Date.now()*0.002 + npc.x;
  ctx.save();
  ctx.translate(px, py + bob);

  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0,15,11,4,0,0,Math.PI*2); ctx.fill();

  // Legs
  ctx.fillStyle='#455a64';
  ctx.beginPath(); ctx.roundRect(-6,10,5,12,2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1,10,5,12,2); ctx.fill();
  // Shoes
  ctx.fillStyle='#212121';
  ctx.beginPath(); ctx.roundRect(-7,20,7,4,2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(0,20,7,4,2); ctx.fill();

  // Body
  ctx.fillStyle = npc.color;
  ctx.beginPath(); ctx.roundRect(-9,-4,18,16,[3,3,5,5]); ctx.fill();
  // Body highlight
  ctx.fillStyle='rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.roundRect(-9,-4,18,5,[3,3,0,0]); ctx.fill();

  // Arms
  const armSway = Math.sin(t*0.6)*0.15;
  ctx.fillStyle = npc.color;
  ctx.save(); ctx.translate(-11,0); ctx.rotate(-0.3+armSway);
  ctx.beginPath(); ctx.roundRect(-2,-2,5,12,2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(11,0); ctx.rotate(0.3-armSway);
  ctx.beginPath(); ctx.roundRect(-3,-2,5,12,2); ctx.fill(); ctx.restore();

  // Neck
  ctx.fillStyle='#fdbcb4';
  ctx.fillRect(-2,-6,4,4);

  // Head
  ctx.fillStyle='#fdbcb4';
  ctx.beginPath(); ctx.arc(0,-14,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.beginPath(); ctx.arc(2,-12,8,0,Math.PI*2); ctx.fill();

  // Emoji face centered
  ctx.font='12px serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(npc.emoji, 0, -14);

  // Name tag
  ctx.font='bold 8px Nunito,sans-serif';
  const tw = ctx.measureText(npc.name).width + 10;
  ctx.fillStyle='rgba(0,0,0,0.8)';
  ctx.beginPath(); ctx.roundRect(-tw/2,-32,tw,14,4); ctx.fill();
  ctx.fillStyle='#e0e0ff';
  ctx.textBaseline='middle'; ctx.fillText(npc.name, 0, -25);

  // Exclamation bubble for nearby NPC
  if (GS.nearNPC && GS.nearNPC.id === npc.id) {
    const bScale = 1 + Math.sin(Date.now()*0.006)*0.1;
    ctx.save(); ctx.scale(bScale,bScale);
    ctx.fillStyle='#ffd600';
    ctx.beginPath(); ctx.arc(0,-44,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(-2,-46,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a1a1a'; ctx.font='bold 12px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('!', 0, -44);
    ctx.restore();
  }

  ctx.restore();
}

function drawParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life--;
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - GS.camera.x, p.y - GS.camera.y, p.r, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function spawnParticles(wx, wy, color='#f0c040', count=8) {
  for (let i=0;i<count;i++) {
    const angle = (Math.PI*2/count)*i;
    particles.push({
      x:wx, y:wy, vx:Math.cos(angle)*2, vy:Math.sin(angle)*2,
      r:3, life:30, maxLife:30, color
    });
  }
}

function renderGame(cx, cy) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Background
  ctx.fillStyle='#1a2a1a';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Tiles
  const startX = Math.max(0, Math.floor(cx/TILE));
  const startY = Math.max(0, Math.floor(cy/TILE));
  const endX   = Math.min(MAP_W-1, Math.ceil((cx+canvas.width)/TILE));
  const endY   = Math.min(MAP_H-1, Math.ceil((cy+canvas.height)/TILE));

  for (let y=startY; y<=endY; y++) {
    for (let x=startX; x<=endX; x++) {
      drawTile(x, y, gameMap[y][x], cx, cy);
    }
  }

  // Grid overlay (optional debug)
  // NPCs
  npcs.forEach(npc => drawNPC(npc, cx, cy));

  // Player
  drawPlayer(cx, cy);

  // Particles
  drawParticles();

  // Shadow vignette if shadow > 50%
  if (GS.shadow > 50) {
    const a = (GS.shadow - 50) / 100;
    const grad = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, canvas.height/3,
      canvas.width/2, canvas.height/2, canvas.height
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(139,0,0,${a*0.4})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// ────────────────────────────────────────────────────────────
//  CURRENT OUTFIT / CHARACTER
// ────────────────────────────────────────────────────────────
function getCurrentCharacter() {
  return CHARACTERS.find(c=>c.id===GS.characterId) || CHARACTERS[0];
}
function getCurrentOutfit() {
  const ch = getCurrentCharacter();
  return { color: ch.shirtColor, emoji: ch.emoji, label: ch.label, id: ch.id };
}

// ────────────────────────────────────────────────────────────
//  COLLISION
// ────────────────────────────────────────────────────────────
function isSolid(tx, ty) {
  if (tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return true;
  return SOLID_TILES.has(gameMap[ty][tx]);
}
function collidesNPC(nx, ny) {
  for (const npc of npcs) {
    const dx = npc.x*TILE+TILE/2 - nx;
    const dy = npc.y*TILE+TILE/2 - ny;
    if (Math.sqrt(dx*dx+dy*dy) < 24) return true;
  }
  return false;
}
function movePlayer(dx, dy) {
  const speed = (player.running ? PLAYER_RUN : PLAYER_SPEED);
  const nx = player.x + dx * speed;
  const ny = player.y + dy * speed;
  const R = 10;
  // X
  const txL = Math.floor((nx-R)/TILE), txR=Math.floor((nx+R)/TILE);
  const tyT = Math.floor((player.y-R+2)/TILE), tyB=Math.floor((player.y+R-2)/TILE);
  if (!isSolid(txL,tyT)&&!isSolid(txL,tyB)&&!isSolid(txR,tyT)&&!isSolid(txR,tyB)) {
    player.x = nx;
  }
  // Y
  const txL2=Math.floor((player.x-R)/TILE), txR2=Math.floor((player.x+R)/TILE);
  const tyT2=Math.floor((ny-R+2)/TILE), tyB2=Math.floor((ny+R-2)/TILE);
  if (!isSolid(txL2,tyT2)&&!isSolid(txL2,tyB2)&&!isSolid(txR2,tyT2)&&!isSolid(txR2,tyB2)) {
    player.y = ny;
  }
}

// ────────────────────────────────────────────────────────────
//  NPC PROXIMITY
// ────────────────────────────────────────────────────────────
function checkNPCProximity() {
  let nearest = null, nearDist = 50;
  for (const npc of npcs) {
    const dx = npc.x*TILE+TILE/2 - player.x;
    const dy = npc.y*TILE+TILE/2 - player.y;
    const d = Math.sqrt(dx*dx+dy*dy);
    if (d < nearDist) { nearest=npc; nearDist=d; }
  }
  GS.nearNPC = nearest;
  const prompt = document.getElementById('interact-prompt');
  if (nearest) prompt.classList.remove('hidden');
  else prompt.classList.add('hidden');
}

// ────────────────────────────────────────────────────────────
//  TIME SYSTEM
// ────────────────────────────────────────────────────────────
let gameTimerAccum = 0;
function updateGameTime(dt) {
  if (GS.paused) return;
  gameTimerAccum += dt;
  // 1 real minute = 1 game minute (60000ms = 1 game minute)
  if (gameTimerAccum >= 1000) {
    gameTimerAccum -= 1000;
    GS.minute += GS.timeSpeed;
    if (GS.minute >= 60) { GS.minute=0; GS.hour++; }
    if (GS.hour >= 24) { GS.hour=0; endDay(); }
    updateHUD();
  }
}
function updateHUD() {
  const h = String(GS.hour).padStart(2,'0');
  const m = String(GS.minute).padStart(2,'0');
  document.getElementById('clock-display').textContent = `${h}:${m}`;
  document.getElementById('day-display').textContent = GS.day;

  const phase = document.getElementById('hud-phase');
  const isWork = GS.hour >= 8 && GS.hour < 16;
  phase.textContent = isWork ? '⚒ Jam Magang' : '🌙 Waktu Bebas';
  phase.className = isWork ? 'work' : 'free';

  // Bars
  const intPct = GS.integrity;
  const trPct = GS.trust;
  const shPct = GS.shadow;
  document.getElementById('bar-integrity').style.width = intPct+'%';
  document.getElementById('bar-trust').style.width = trPct+'%';
  document.getElementById('bar-shadow').style.width = shPct+'%';
  document.getElementById('val-integrity').textContent = intPct;
  document.getElementById('val-trust').textContent = trPct;
  document.getElementById('val-shadow').textContent = shPct+'%';

  // Avatar
  const outfit = getCurrentOutfit();
  document.getElementById('hud-avatar').textContent = outfit.emoji;
}

function endDay() {
  if (GS.day >= 7) { triggerEnding(); return; }
  GS.day++;
  GS.hour = 7; GS.minute = 55;
  GS.dailyDone.clear();
  showDayEnd();
}

function showDayEnd() {
  const overlay = document.createElement('div');
  overlay.id='dayend-overlay'; overlay.className='';
  overlay.innerHTML=`
    <div id="dayend-box">
      <div class="dayend-title">✦ Hari ${GS.day-1} Selesai ✦</div>
      <div class="dayend-stats">
        <div class="dayend-stat"><span>🛡 Integritas</span><span>${GS.integrity}%</span></div>
        <div class="dayend-stat"><span>🌟 Kepercayaan Warga</span><span>${GS.trust}%</span></div>
        <div class="dayend-stat"><span>🌑 Akar Bayangan</span><span>${GS.shadow}%</span></div>
        <div class="dayend-stat"><span>📋 Misi Selesai</span><span>${GS.questsDone.size}</span></div>
      </div>
      <button class="big-btn" id="dayend-next-btn">▶ Hari ${GS.day} Dimulai</button>
    </div>
  `;
  document.body.appendChild(overlay);
  sfxQuest();
  document.getElementById('dayend-next-btn').onclick = () => {
    overlay.remove();
    showToast(`Selamat pagi! Hari ${GS.day} dimulai 🌅`, 'info');
  };
}

// ────────────────────────────────────────────────────────────
//  TOAST
// ────────────────────────────────────────────────────────────
function showToast(msg, type='info', dur=3000) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.style.opacity='0', dur-400);
  setTimeout(() => t.remove(), dur);
}

// ────────────────────────────────────────────────────────────
//  STAT MODIFICATION
// ────────────────────────────────────────────────────────────
function modIntegrity(v) {
  GS.integrity = Math.max(0, Math.min(100, GS.integrity+v));
  if (v>0) { sfxGood(); showToast(`🛡 Integritas +${v}`, 'success'); }
  else { sfxBad(); showToast(`🛡 Integritas ${v}`, 'error'); }
  updateHUD();
}
function modTrust(v) {
  GS.trust = Math.max(0, Math.min(100, GS.trust+v));
  if (v>0) showToast(`🌟 Kepercayaan Warga +${v}`, 'success');
  else showToast(`🌟 Kepercayaan Warga ${v}`, 'error');
  updateHUD();
}
function modShadow(v) {
  const old = GS.shadow;
  GS.shadow = Math.max(0, Math.min(100, GS.shadow+v));
  updateHUD();
  if (v>0 && GS.shadow > old) {
    sfxShadow();
    showToast(`🌑 Akar Bayangan +${v}%`, 'error');
    if (GS.shadow >= 100) triggerShadowWin();
    else if (GS.shadow > 0 && GS.shadow % 25 === 0) showShadowEvent();
  } else if (v<0) {
    showToast(`🌑 Akar Bayangan ${v}%`, 'success');
  }
}
function showShadowEvent() {
  const el=document.getElementById('shadow-event');
  const msg=document.getElementById('shadow-msg');
  const pct=document.getElementById('shadow-pct-display');
  el.classList.remove('hidden');
  msg.textContent='AKAR BAYANGAN MENGUAT!';
  pct.textContent=GS.shadow+'%';
  sfxShadow();
  setTimeout(()=>el.classList.add('hidden'),3000);
}
function triggerShadowWin() {
  showShadowEvent();
  document.getElementById('shadow-msg').textContent='AKAR BAYANGAN MENGUASAI KOTA!';
  setTimeout(()=>{
    showToast('GAME OVER! Akar Bayangan menguasai kota...','error',5000);
    setTimeout(()=>location.reload(),6000);
  },3500);
}
function triggerEnding() {
  const won = GS.shadow < 50 && GS.integrity > 50;
  const msg = won
    ? '🏆 SELAMAT! Kamu telah menyelamatkan Kota Nusantara dari Akar Bayangan!'
    : '😔 Misi selesai, namun Akar Bayangan masih mengintai kota...';
  showToast(msg, won?'success':'warning', 8000);
  sfxQuest();
}

// ────────────────────────────────────────────────────────────
//  DIALOG SYSTEM
// ────────────────────────────────────────────────────────────
let dialogLines = [];
let dialogIdx = 0;
let typingInterval = null;

function openDialog(npc, lines, choices) {
  initAudio();
  sfxInteract();
  GS.paused = true;
  dialogLines = lines;
  dialogIdx = 0;
  GS.dialogChoiceCallback = null;

  const overlay = document.getElementById('dialog-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('dialog-portrait').textContent = npc.emoji;
  document.getElementById('dialog-speaker-name').textContent = npc.name;
  document.getElementById('dialog-choices').innerHTML='';
  document.getElementById('dialog-next').style.display='block';

  showDialogLine(choices);
}

let typingTarget='';
let typingPos=0;
function showDialogLine(choices) {
  const textEl = document.getElementById('dialog-text');
  const line = dialogLines[dialogIdx];
  if (line===undefined) { closeDialog(choices); return; }

  clearInterval(typingInterval);
  typingTarget = line; typingPos=0; textEl.textContent='';
  typingInterval = setInterval(()=>{
    if (typingPos < typingTarget.length) {
      textEl.textContent += typingTarget[typingPos];
      typingPos++;
      if (typingPos%3===0) playTone(300+Math.random()*100,'triangle',0.03,0.02);
    } else {
      clearInterval(typingInterval);
    }
  },28);
}

function closeDialog(choices) {
  clearInterval(typingInterval);
  if (choices && choices.length) {
    document.getElementById('dialog-next').style.display='none';
    const choicesEl = document.getElementById('dialog-choices');
    choicesEl.innerHTML='';
    choices.forEach(c=>{
      const btn=document.createElement('button');
      btn.className=`dialog-choice ${c.type||''}`;
      btn.textContent=c.text;
      btn.onclick=()=>{
        choicesEl.innerHTML='';
        document.getElementById('dialog-overlay').classList.add('hidden');
        GS.paused=false;
        if (c.callback) c.callback();
      };
      choicesEl.appendChild(btn);
    });
  } else {
    document.getElementById('dialog-overlay').classList.add('hidden');
    GS.paused=false;
  }
}

document.getElementById('dialog-next').onclick = () => {
  if (typingPos < typingTarget.length) {
    clearInterval(typingInterval);
    document.getElementById('dialog-text').textContent = typingTarget;
    typingPos = typingTarget.length;
    return;
  }
  dialogIdx++;
  showDialogLine(null);
};

// ────────────────────────────────────────────────────────────
//  NPC INTERACTION
// ────────────────────────────────────────────────────────────
function interactWithNPC(npc) {
  initAudio();
  // Find relevant quests for this NPC
  const npcQuests = ALL_QUESTS.filter(q=>
    npc.questIds && npc.questIds.includes(q.id) &&
    !GS.questsDone.has(q.id)
  );

  // Build dialog
  const baseLines = [...npc.dialog];

  if (npcQuests.length === 0) {
    openDialog(npc, baseLines.concat(['Terima kasih sudah mampir!']), null);
    return;
  }

  const q = npcQuests[0];
  const isActive = GS.questsActive.has(q.id);

  if (!isActive) {
    // Offer quest
    openDialog(npc, baseLines.concat([`Misi: ${q.name}`, q.desc]), [
      {text:'✅ Terima Misi', type:'good', callback:()=>{
        acceptQuest(q); interactPostQuest(npc, q);
      }},
      {text:'❌ Nanti Saja', callback:()=>{}},
    ]);
  } else {
    // Quest active — check if shadow quest (bribe mechanic)
    if (q.shadow && q.bribeText) {
      openDialog(npc, baseLines.concat([q.bribeText]), [
        {text:'💰 Terima (Suap)', type:'danger', callback:()=>{ acceptBribe(q); }},
        {text:'🚫 Tolak dengan Tegas', type:'good', callback:()=>{ rejectBribe(q); }},
      ]);
    } else {
      openDialog(npc, ['Misi sedang berjalan: '+q.name, 'Selesaikan misi ini untuk melanjutkan.', '(Quest dianggap selesai otomatis)'], [
        {text:'✅ Selesaikan Misi', type:'good', callback:()=>{ completeQuest(q); }},
        {text:'Nanti', callback:()=>{}},
      ]);
    }
  }
}

function acceptQuest(q) {
  GS.questsActive.add(q.id);
  sfxQuest();
  showToast(`📋 Misi Baru: ${q.name}`, 'warning');
  updateQuestUI();
}

function acceptBribe(q) {
  sfxBad();
  modShadow(+15);
  modIntegrity(-20);
  GS.questsDone.add(q.id);
  GS.questsActive.delete(q.id);
  showToast(`💰 Suap diterima... Akar Bayangan menguat!`, 'error');
  unlockNews('n3');
  updateQuestUI();
}

function rejectBribe(q) {
  sfxGood();
  modShadow(-10);
  modIntegrity(+20);
  GS.questsDone.add(q.id);
  GS.questsActive.delete(q.id);
  showToast(`🚫 Suap ditolak! Integritas terjaga!`, 'success');
  spawnParticles(player.x, player.y, '#66bb6a', 12);
  updateQuestUI();
}

function completeQuest(q) {
  if (GS.questsDone.has(q.id)) return;
  GS.questsDone.add(q.id);
  GS.questsActive.delete(q.id);
  sfxQuest();
  showToast(`✅ Misi Selesai: ${q.name}!`, 'success');
  spawnParticles(player.x, player.y, '#f0c040', 15);

  // Apply rewards from reward string
  const r = q.reward||'';
  const intMatch = r.match(/Integritas [+\-](\d+)/);
  const trMatch  = r.match(/Kepercayaan[^+\-]*([+\-]\d+)/);
  const shMatch  = r.match(/Shadow ([+\-]\d+)/);
  if (intMatch) modIntegrity(parseInt(intMatch[1]));
  if (trMatch)  modTrust(parseInt(trMatch[1]));
  if (shMatch)  modShadow(parseInt(shMatch[1]));

  updateQuestUI();
  updateNewsBoard();
}

function interactPostQuest(npc, q) {
  // Immediately mark active so next click shows quest dialog
}

// ────────────────────────────────────────────────────────────
//  QUEST UI
// ────────────────────────────────────────────────────────────
function updateQuestUI() {
  const list = document.getElementById('quest-list');
  const activeTab = document.querySelector('.qtab.active').dataset.tab;
  list.innerHTML='';

  let filtered = [];
  if (activeTab==='main')  filtered = ALL_QUESTS.filter(q=>q.type==='main');
  if (activeTab==='side')  filtered = ALL_QUESTS.filter(q=>q.type==='side');
  if (activeTab==='daily') filtered = ALL_QUESTS.filter(q=>q.type==='daily');
  if (activeTab==='done')  filtered = ALL_QUESTS.filter(q=>GS.questsDone.has(q.id));

  filtered.forEach(q=>{
    const done = GS.questsDone.has(q.id);
    const active = GS.questsActive.has(q.id);
    const div=document.createElement('div');
    div.className=`quest-item ${active?'active-q':''} ${done?'done-q':''}`;
    div.innerHTML=`
      <div class="quest-header">
        <span class="quest-icon">${q.icon}</span>
        <span class="quest-name">${q.name}</span>
        <span class="quest-diff diff-${q.diff}">${q.diff==='easy'?'Mudah':q.diff==='med'?'Sedang':'Sulit'}</span>
      </div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-reward">🎁 ${q.reward}</div>
      ${active?'<div class="quest-progress">🔵 Sedang Berjalan</div>':''}
      ${done?'<div class="quest-progress" style="color:#66bb6a">✅ Selesai</div>':''}
    `;
    list.appendChild(div);
  });
}

document.querySelectorAll('.qtab').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.qtab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    updateQuestUI();
  };
});

// ────────────────────────────────────────────────────────────
//  NEWS BOARD
// ────────────────────────────────────────────────────────────
function unlockNews(id) {
  const item = GS.news.find(n=>n.id===id);
  if (item && !item.unlocked) {
    item.unlocked=true;
    showToast('📰 Berita Baru Tersedia!','info');
  }
}
function updateNewsBoard() {
  const list=document.getElementById('news-list');
  list.innerHTML='';
  GS.news.forEach(n=>{
    const div=document.createElement('div');
    div.className='news-item';
    div.innerHTML=`
      <div class="news-photo">${n.emoji}</div>
      <div class="news-body">
        <div class="news-title">${n.title}${n.unlocked?'':'🔒'}</div>
        <div class="news-date">${n.date}</div>
        <div class="news-text">${n.unlocked?n.text:'[Terkunci — Selesaikan misi untuk membuka]'}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

// ────────────────────────────────────────────────────────────
//  BACKPACK UI
// ────────────────────────────────────────────────────────────
function updateBackpackUI() {
  const grid=document.getElementById('items-grid');
  grid.innerHTML='';
  const slots=12;
  for (let i=0;i<slots;i++) {
    const div=document.createElement('div');
    div.className='item-slot';
    const item=GS.items[i];
    if (item) {
      div.textContent=item.emoji;
      div.title=item.name;
      if (item.qty>1) {
        const q=document.createElement('div');
        q.className='item-qty'; q.textContent=item.qty;
        div.appendChild(q);
      }
    }
    grid.appendChild(div);
  }
  // Draw preview
  drawCharPreview();
  // Outfit selector ingame
  buildOutfitSelectorIngame();
}

function drawCharPreview() {
  const pc=document.getElementById('char-preview-canvas');
  if (!pc) return;
  const ch=getCurrentCharacter();
  drawCharMini(pc, ch);
}

// ────────────────────────────────────────────────────────────
//  OUTFIT / CHARACTER SELECTOR
// ────────────────────────────────────────────────────────────
function buildOutfitSelector(containerId, onSelect) {
  const el=document.getElementById(containerId);
  if (!el) return;
  el.innerHTML='';

  // Show all 8 characters regardless of gender filter
  const list = CHARACTERS;
  list.forEach(ch=>{
    const div=document.createElement('div');
    div.className=`outfit-choice char-card ${ch.id===GS.characterId?'selected':''}`;
    div.style.setProperty('--c', ch.shirtColor);
    div.style.setProperty('--a', ch.accent);

    // Mini canvas preview
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width=44; miniCanvas.height=52;
    miniCanvas.className='char-mini-canvas';
    drawCharMini(miniCanvas, ch);

    const label=document.createElement('div');
    label.className='outfit-label';
    label.textContent=ch.label;
    const desc=document.createElement('div');
    desc.className='outfit-desc';
    desc.textContent=ch.desc;

    div.appendChild(miniCanvas);
    div.appendChild(label);
    div.appendChild(desc);

    div.onclick=()=>{
      GS.characterId=ch.id;
      GS.outfitId=ch.id;
      GS.gender=ch.gender;
      GS.outfitColor=ch.shirtColor;
      el.querySelectorAll('.outfit-choice').forEach(d=>d.classList.remove('selected'));
      div.classList.add('selected');
      if (onSelect) onSelect(ch);
    };
    el.appendChild(div);
  });
}

function drawCharMini(canvas, ch) {
  const c = canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;
  c.clearRect(0,0,w,h);
  const cx=w/2, cy=h*0.65;

  // Shadow
  c.fillStyle='rgba(0,0,0,0.2)';
  c.beginPath(); c.ellipse(cx,cy+8,10,3,0,0,Math.PI*2); c.fill();

  // Legs
  c.fillStyle=ch.pantsColor;
  c.beginPath(); c.roundRect(cx-8,cy,6,12,1); c.fill();
  c.beginPath(); c.roundRect(cx+2,cy,6,12,1); c.fill();
  // Shoes
  c.fillStyle=ch.shoeColor;
  c.beginPath(); c.roundRect(cx-9,cy+10,8,4,2); c.fill();
  c.beginPath(); c.roundRect(cx+1,cy+10,8,4,2); c.fill();

  // Body
  c.fillStyle=ch.shirtColor;
  c.beginPath(); c.roundRect(cx-9,cy-14,18,16,[2,2,4,4]); c.fill();
  c.fillStyle='rgba(255,255,255,0.15)';
  c.beginPath(); c.roundRect(cx-9,cy-14,18,5,[2,2,0,0]); c.fill();
  // Badge
  c.font='8px serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(ch.badge, cx, cy-6);

  // Arms
  c.fillStyle=ch.shirtColor;
  c.beginPath(); c.roundRect(cx-14,cy-13,5,13,2); c.fill();
  c.beginPath(); c.roundRect(cx+9,cy-13,5,13,2); c.fill();

  // Head
  c.fillStyle=ch.skin;
  c.beginPath(); c.arc(cx, cy-22, 11, 0, Math.PI*2); c.fill();
  c.fillStyle='rgba(0,0,0,0.06)'; c.beginPath(); c.arc(cx+2,cy-21,9,0,Math.PI*2); c.fill();

  // Hair
  c.fillStyle=ch.hair;
  const hs=ch.hairStyle;
  if(hs==='hijab'){
    c.fillStyle=ch.shirtColor;
    c.beginPath(); c.arc(cx,cy-22,13,Math.PI,0); c.fill();
    c.beginPath(); c.roundRect(cx-13,cy-24,26,14,[0,0,6,6]); c.fill();
  } else if(hs==='spiky'){
    c.beginPath();c.moveTo(cx-11,cy-25);c.lineTo(cx-7,cy-32);c.lineTo(cx-2,cy-25);
    c.lineTo(cx+2,cy-34);c.lineTo(cx+7,cy-25);c.lineTo(cx+11,cy-29);c.lineTo(cx+13,cy-23);c.lineTo(cx-11,cy-23);c.closePath();c.fill();
  } else if(hs==='curly'){
    for(let i=0;i<5;i++){c.beginPath();c.arc(cx-9+i*4,cy-28,4,0,Math.PI*2);c.fill();}
  } else if(hs==='long'){
    c.beginPath(); c.roundRect(cx-11,cy-32,22,12,[8,8,0,0]); c.fill();
    c.beginPath(); c.roundRect(cx-12,cy-24,5,18,2); c.fill();
    c.beginPath(); c.roundRect(cx+7,cy-24,5,18,2); c.fill();
  } else if(hs==='bun'){
    c.beginPath(); c.roundRect(cx-11,cy-32,22,11,[8,8,0,0]); c.fill();
    c.beginPath(); c.arc(cx,cy-33,6,0,Math.PI*2); c.fill();
  } else if(hs==='ponytail'){
    c.beginPath(); c.roundRect(cx-11,cy-32,22,11,[8,8,0,0]); c.fill();
    c.beginPath(); c.roundRect(cx+8,cy-30,4,18,2); c.fill();
    c.fillStyle=ch.accent; c.beginPath(); c.arc(cx+10,cy-30,3,0,Math.PI*2); c.fill();
  } else {
    c.beginPath(); c.roundRect(cx-11,cy-32,22,12,[8,8,0,0]); c.fill();
  }

  // Eyes (front-facing)
  c.fillStyle='#1a1a1a';
  c.beginPath(); c.arc(cx-4,cy-22,2,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+4,cy-22,2,0,Math.PI*2); c.fill();
  c.fillStyle='#fff';
  c.beginPath(); c.arc(cx-3,cy-23,0.8,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+5,cy-23,0.8,0,Math.PI*2); c.fill();
}

function buildOutfitSelectorIngame() {
  buildOutfitSelector('outfit-selector-ingame',()=>drawCharPreview());
}

// ────────────────────────────────────────────────────────────
//  PANELS TOGGLE
// ────────────────────────────────────────────────────────────
function togglePanel(id) {
  const el=document.getElementById(id);
  const isHidden=el.classList.contains('hidden');
  // Close all
  document.querySelectorAll('.panel-overlay').forEach(p=>p.classList.add('hidden'));
  if (isHidden) {
    el.classList.remove('hidden');
    if (id==='quest-overlay') updateQuestUI();
    if (id==='news-overlay') updateNewsBoard();
    if (id==='backpack-overlay') updateBackpackUI();
  }
}

document.querySelectorAll('.close-panel').forEach(btn=>{
  btn.onclick=()=>{
    btn.closest('.panel-overlay').classList.add('hidden');
  };
});

// HUD buttons
document.getElementById('btn-backpack').onclick=()=>togglePanel('backpack-overlay');
document.getElementById('btn-quest').onclick=()=>togglePanel('quest-overlay');
document.getElementById('btn-news').onclick=()=>{ togglePanel('news-overlay'); updateNewsBoard(); };
document.getElementById('btn-settings').onclick=()=>togglePanel('settings-overlay');
document.getElementById('btn-pause').onclick=()=>togglePause();

// Settings
document.getElementById('music-vol').oninput=e=>{ GS.musicVol=e.target.value/100; };
document.getElementById('sfx-vol').oninput=e=>{ GS.sfxVol=e.target.value/100; };
document.getElementById('btn-fullscreen').onclick=()=>{
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
document.getElementById('btn-reset').onclick=()=>{
  if (confirm('Reset semua data game?')) location.reload();
};

// Pause
function togglePause() {
  GS.paused=!GS.paused;
  document.getElementById('pause-overlay').classList.toggle('hidden',!GS.paused);
}
document.getElementById('pause-resume').onclick=()=>{ GS.paused=false; document.getElementById('pause-overlay').classList.add('hidden'); };
document.getElementById('pause-settings').onclick=()=>{ togglePanel('settings-overlay'); };
document.getElementById('pause-quit').onclick=()=>{ if(confirm('Kembali ke menu utama?')) location.reload(); };

// ────────────────────────────────────────────────────────────
//  KEYBOARD INPUT
// ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e=>{
  // Allow typing in text inputs without hijacking keys
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  GS.keys[e.key.toLowerCase()]=true;
  if (e.key==='e'||e.key==='E') { if(GS.nearNPC&&!GS.paused) { interactWithNPC(GS.nearNPC); } }
  if (e.key==='b'||e.key==='B') togglePanel('backpack-overlay');
  if (e.key==='q'||e.key==='Q') togglePanel('quest-overlay');
  if (e.key==='n'||e.key==='N') { togglePanel('news-overlay'); updateNewsBoard(); }
  if (e.key==='p'||e.key==='Escape') togglePause();
  if (e.key==='Shift') player.running=true;

  // Only prevent default for game keys, not browser shortcuts
  const gameKeys = new Set(['w','a','s','d','e','b','q','n','p','Escape','Shift',
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  if (gameKeys.has(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e=>{
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  GS.keys[e.key.toLowerCase()]=false;
  if (e.key==='Shift') player.running=false;
});

// ────────────────────────────────────────────────────────────
//  MOBILE CONTROLS
// ────────────────────────────────────────────────────────────
function bindMobileBtn(id, key) {
  const el=document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart',e=>{ e.preventDefault(); GS.mobile[key]=true; initAudio(); });
  el.addEventListener('touchend',e=>{ e.preventDefault(); GS.mobile[key]=false; });
  el.addEventListener('touchcancel',e=>{ e.preventDefault(); GS.mobile[key]=false; });
  el.addEventListener('mousedown',e=>{ e.stopPropagation(); GS.mobile[key]=true; initAudio(); });
  el.addEventListener('mouseup',e=>{ e.stopPropagation(); GS.mobile[key]=false; });
  el.addEventListener('mouseleave',e=>{ GS.mobile[key]=false; });
}
bindMobileBtn('btn-up','up');
bindMobileBtn('btn-down','down');
bindMobileBtn('btn-left','left');
bindMobileBtn('btn-right','right');
bindMobileBtn('btn-run','run');

// Prevent right-click context menu from causing input issues
document.addEventListener('contextmenu', e => e.preventDefault());

// Release all movement keys when window loses focus or mouse leaves game area
window.addEventListener('blur', ()=>{
  GS.keys={};
  GS.mobile={up:false,down:false,left:false,right:false,run:false};
  player.running=false;
});

// When mouse button is released anywhere, stop mobile movement
document.addEventListener('mouseup', ()=>{
  GS.mobile={up:false,down:false,left:false,right:false,run:false};
});

document.getElementById('btn-interact').addEventListener('touchstart',e=>{
  e.preventDefault(); initAudio();
  if (GS.nearNPC&&!GS.paused) interactWithNPC(GS.nearNPC);
});
document.getElementById('btn-interact').addEventListener('click',e=>{
  e.stopPropagation();
  initAudio();
  if (GS.nearNPC&&!GS.paused) interactWithNPC(GS.nearNPC);
});

// HUD buttons should not propagate mousedown to cause movement
document.getElementById('hud-top').addEventListener('mousedown', e=>e.stopPropagation());
document.querySelectorAll('.panel-overlay').forEach(p=>{
  p.addEventListener('mousedown', e=>e.stopPropagation());
});
document.getElementById('dialog-overlay').addEventListener('mousedown', e=>e.stopPropagation());

// ────────────────────────────────────────────────────────────
//  STORY SCREEN
// ────────────────────────────────────────────────────────────
let storyPanelIdx=0;
let storyDialogIdx=0;

function buildStoryPanels() {
  const wrap=document.getElementById('story-panels');
  STORY_PANELS.forEach((p,i)=>{
    const div=document.createElement('div');
    div.className=`story-panel ${i===0?'active':''}`;
    div.style.background=`radial-gradient(circle at 50% 40%, ${p.color}22, transparent 70%)`;
    div.innerHTML=`
      <div class="story-panel-art" style="color:${p.color}">${p.art}</div>
      <div class="story-panel-title" style="color:${p.color}">${p.title}</div>
      <div class="story-panel-desc">${p.desc}</div>
    `;
    wrap.appendChild(div);
  });
}

function showStoryDialog() {
  const d=STORY_DIALOG[storyDialogIdx];
  if (!d) { startGame(); return; }
  document.getElementById('story-speaker').textContent=d.speaker;
  const t=document.getElementById('story-text');
  t.textContent='';
  let i=0;
  const ti=setInterval(()=>{
    if(i<d.text.length){t.textContent+=d.text[i];i++;}
    else clearInterval(ti);
  },30);

  // Progress
  const pct=(storyDialogIdx/STORY_DIALOG.length)*100;
  document.getElementById('story-progress-fill').style.width=pct+'%';

  // Panel sync
  const pi=Math.floor(storyDialogIdx/(STORY_DIALOG.length/STORY_PANELS.length));
  document.querySelectorAll('.story-panel').forEach((p,idx)=>{
    p.classList.toggle('active', idx===Math.min(pi, STORY_PANELS.length-1));
  });
}

document.getElementById('story-next-btn').onclick=()=>{
  storyDialogIdx++;
  showStoryDialog();
};

// ────────────────────────────────────────────────────────────
//  INTRO SCREEN
// ────────────────────────────────────────────────────────────
function buildIntroOutfitSelector() {
  buildOutfitSelector('outfit-selector', null);
}

document.querySelectorAll('.gender-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.gender-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    GS.gender=btn.dataset.gender;
    // Auto-select first character of that gender
    const firstChar = CHARACTERS.find(c=>c.gender===GS.gender);
    if (firstChar) {
      GS.characterId=firstChar.id;
      GS.outfitId=firstChar.id;
      GS.outfitColor=firstChar.shirtColor;
    }
    buildIntroOutfitSelector();
  };
});

document.getElementById('start-story-btn').onclick=()=>{
  initAudio();
  const name=document.getElementById('char-name').value.trim();
  GS.playerName = name||'Mahasiswa';
  // Ensure gender synced with chosen character
  const ch = getCurrentCharacter();
  GS.gender = ch.gender;
  // Transition to story
  document.getElementById('intro-screen').classList.remove('active');
  const ss=document.getElementById('story-screen');
  ss.style.display='flex';
  buildStoryPanels();
  showStoryDialog();
  sfxQuest();
};

// ────────────────────────────────────────────────────────────
//  START GAME
// ────────────────────────────────────────────────────────────
function startGame() {
  document.getElementById('story-screen').style.display='none';
  const gs=document.getElementById('game-screen');
  gs.style.display='flex';
  GS.phase='game';

  // Init map
  gameMap = createMap();

  // Init NPCs
  npcs = NPCS_DATA.map(n=>({...n}));

  // Init items
  GS.items = [...ITEMS_START];

  // Init news
  GS.news = NEWS_INITIAL.map(n=>({...n}));

  // Init daily quests
  ALL_QUESTS.filter(q=>q.type==='daily').forEach(q=>GS.questsActive.add(q.id));

  // Resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Camera init
  GS.camera.x = player.x - canvas.width/2;
  GS.camera.y = player.y - canvas.height/2;

  // Start loops
  startBGM();
  updateHUD();
  requestAnimationFrame(gameLoop);

  // Welcome
  setTimeout(()=>{
    showToast(`Selamat datang, ${GS.playerName}! Petualanganmu dimulai!`, 'success', 4000);
    showToast('Tekan E atau 💬 untuk berinteraksi dengan NPC', 'info', 5000);
  }, 500);

  // Auto-offer first quest
  setTimeout(()=>{
    const buSari = npcs.find(n=>n.id==='bu_sari');
    if (buSari) {
      openDialog(buSari,
        [`Halo ${GS.playerName}!`,'Selamat datang di hari pertama magangmu!','Kamu memiliki misi pertama yang perlu diselesaikan.'],
        [{text:'Siap, Bu!', type:'good', callback:()=>{
          acceptQuest(ALL_QUESTS.find(q=>q.id==='mq1'));
        }}]
      );
    }
  }, 2000);
}

// ────────────────────────────────────────────────────────────
//  GAME LOOP
// ────────────────────────────────────────────────────────────
function gameLoop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;

  if (GS.phase !== 'game') { requestAnimationFrame(gameLoop); return; }
  if (GS.paused) { requestAnimationFrame(gameLoop); return; }

  // Input
  let dx=0, dy=0;
  if (GS.keys['w'] || GS.mobile.up)    { dy=-1; player.facing='up'; }
  if (GS.keys['s'] || GS.mobile.down)  { dy=+1; player.facing='down'; }
  if (GS.keys['a'] || GS.mobile.left)  { dx=-1; player.facing='left'; }
  if (GS.keys['d'] || GS.mobile.right) { dx=+1; player.facing='right'; }
  if (GS.mobile.run) player.running=true; else if (!GS.keys['shift']) player.running=false;

  player.moving = dx!==0||dy!==0;

  if (player.moving) {
    // Normalize diagonal
    if (dx!==0&&dy!==0) { dx*=0.707; dy*=0.707; }
    movePlayer(dx, dy);

    // Animation
    player.animTimer++;
    if (player.animTimer>=player.ANIM_SPEED) {
      player.animTimer=0;
      player.animFrame++;
    }

    // Step sound
    stepTimer+=dt;
    if (stepTimer>350) { stepTimer=0; sfxStep(); }
  } else { player.animFrame=0; }

  // Camera smooth follow
  GS.camTarget.x = player.x - canvas.width/2;
  GS.camTarget.y = player.y - canvas.height/2;
  GS.camera.x += (GS.camTarget.x - GS.camera.x) * CAM_LERP;
  GS.camera.y += (GS.camTarget.y - GS.camera.y) * CAM_LERP;

  // Clamp camera
  GS.camera.x = Math.max(0, Math.min(MAP_W*TILE - canvas.width,  GS.camera.x));
  GS.camera.y = Math.max(0, Math.min(MAP_H*TILE - canvas.height, GS.camera.y));

  // NPC proximity
  checkNPCProximity();

  // Time
  updateGameTime(dt);

  // Render
  renderGame(GS.camera.x, GS.camera.y);

  requestAnimationFrame(gameLoop);
}

// ────────────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────────────
buildIntroOutfitSelector();

GS.money = 500;

GS.inventory = [];

const SHOP_ITEMS = {

  roti:{
    name:'Roti',
    heal:10,
    price:25
  },

  air:{
    name:'Air',
    heal:5,
    price:15
  }
};

function updateMoneyUI(){

  document.getElementById(
    'money-text'
  ).textContent = GS.money;

  document.getElementById(
    'shop-money-text'
  ).textContent = GS.money;
}

function openShop(){

  document.getElementById(
    'shop-ui'
  ).classList.remove('hidden');

  updateMoneyUI();
}

function closeShop(){

  document.getElementById(
    'shop-ui'
  ).classList.add('hidden');
}

function buyItem(id,price){

  if(GS.money < price){

    alert('Uang tidak cukup!');
    return;
  }

  GS.money -= price;

  let item =
    GS.inventory.find(
      i=>i.id===id
    );

  if(item){

    item.qty++;

  }else{

    GS.inventory.push({
      id:id,
      name:SHOP_ITEMS[id].name,
      heal:SHOP_ITEMS[id].heal,
      qty:1
    });
  }

  updateMoneyUI();

  renderInventory();

  alert('Item dibeli!');
}

function openInventory(){

  document.getElementById(
    'inventory-ui'
  ).classList.remove('hidden');

  renderInventory();
}

function closeInventory(){

  document.getElementById(
    'inventory-ui'
  ).classList.add('hidden');
}

function renderInventory(){

  const wrap =
    document.getElementById(
      'inventory-items'
    );

  wrap.innerHTML='';

  GS.inventory.forEach(item=>{

    const div =
      document.createElement('div');

    div.className='inv-item';

    div.innerHTML=`
      <div>
        ${item.name} x${item.qty}
      </div>

      <button onclick="
        useItem('${item.id}')
      ">
        Pakai
      </button>
    `;

    wrap.appendChild(div);
  });
}

function useItem(id){

  let item =
    GS.inventory.find(
      i=>i.id===id
    );

  if(!item) return;

  item.qty--;

  if(item.qty <= 0){

    GS.inventory =
      GS.inventory.filter(
        i=>i.id!==id
      );
  }

  renderInventory();

  alert(item.name + ' dipakai');
}

window.addEventListener(
  'keydown',
  e=>{

    if(e.key==='b'){

      openInventory();
    }

    if(e.key==='o'){

      openShop();
    }

    if(e.key==='Escape'){

      closeShop();
      closeInventory();
    }
  }
);

updateMoneyUI();
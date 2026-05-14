/* ============================================================
   MAGANG QUEST — quest_system.js
   7 Main Quests, Full NPC Dialog, Item Investigation System
   Overrides ALL_QUESTS and interactWithNPC for main quests
============================================================ */
'use strict';

// ────────────────────────────────────────────────────────────
//  7 MAIN QUESTS — DATA LENGKAP
// ────────────────────────────────────────────────────────────
const MAIN_QUESTS_7 = [
  {
    id: 'mq1',
    day: 1,
    name: 'Hari Pertama Magang',
    icon: '🏢',
    desc: 'Laporkan diri ke Bu Sari di Kantor Dinas. Pelajari lingkungan kantor dan temukan ID Card yang tertinggal.',
    reward: { integrity: 10, trust: 5, money: 100 },
    npc: 'bu_sari',
    investigationItems: [
      { id: 'id_card_hilang', name: 'ID Card Magang Hilang', emoji: '🪪', hint: 'Coba cek meja resepsionis kantor!', zone: 'office', tx: 63, ty: 23 }
    ],
    shadow: false,
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Pagi cerah. Hari pertama magangmu di Kantor Dinas Kota Nusantara. Jantungmu berdegup kencang penuh harap.' },
      { speaker: 'Narator', portrait: '📖', text: 'Kamu mengenakan seragam baru, tas ransel berat di punggung. Ini adalah awal dari perjalanan 7 hari yang menentukan.' },
    ],
    dialogs: [
      {
        speaker: 'Bu Sari',
        playerSpeaker: true,
        lines: [
          { who: 'bu_sari', text: `Ah, kamu pasti magang baru ya? Selamat datang di Kantor Dinas Kota Nusantara! Aku Bu Sari, Kepala Dinas.` },
          { who: 'player', text: `Selamat pagi Bu Sari! Saya ${()=>window.GS?.playerName||'Hero'}, senang bisa bergabung!` },
          { who: 'bu_sari', text: `Bagus! Semangat seperti itu yang kita butuhkan. Tapi ada satu masalah kecil — ID Card magangmu sepertinya tertinggal di meja resepsionis.` },
          { who: 'player', text: `Oh tidak! Wah, baik Bu, saya cari sekarang.` },
          { who: 'bu_sari', text: `Hati-hati ya. Kantor ini luas, dan ada beberapa orang yang... tidak selalu jujur soal barang temuan. Integritas dimulai dari hal-hal kecil.` },
          { who: 'player', text: `Saya mengerti, Bu. Integritas adalah segalanya!` },
          { who: 'bu_sari', text: `Tepat sekali! Sekarang pergi temukan ID Card-mu. Tanpa itu kamu tidak bisa mengakses area penting kantor.` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'bu_sari', text: `Hebat! Kamu sudah temukan ID Card-mu. Sekarang kamu resmi menjadi peserta magang kami!` },
      { who: 'player', text: `Terima kasih, Bu Sari! Saya siap belajar dan bekerja keras!` },
      { who: 'bu_sari', text: `Ingat satu hal: di kantor ini, kamu akan menemukan banyak godaan. Tetap pegang teguh integritasmu.` },
    ]
  },

  {
    id: 'mq2',
    day: 2,
    name: 'Dokumen Mencurigakan',
    icon: '📁',
    desc: 'Pak Budi memintamu mencari "Dokumen Rahasia" di gudang arsip. Tapi ada yang janggal dengan permintaannya...',
    reward: { integrity: 20, trust: 10, money: 200 },
    npc: 'pak_budi',
    investigationItems: [
      { id: 'dokumen_palsu', name: 'Dokumen Anggaran Palsu', emoji: '📋', hint: 'Tersembunyi di dalam lemari arsip tua di sudut gudang.', zone: 'office', tx: 74, ty: 44 },
      { id: 'stempel_palsu', name: 'Stempel Dinas Palsu', emoji: '🔴', hint: 'Di laci meja Pak Budi yang tidak terkunci...', zone: 'office', tx: 71, ty: 30 }
    ],
    shadow: true,
    bribeText: 'Pak Budi menggeser amplop berisi Rp 500.000 ke arahmu. "Cukup tanda tangani saja, tidak perlu banyak tanya..."',
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Hari kedua. Kamu menemukan ritme kerja mulai terasa. Tapi pagi ini, Pak Budi — rekan senior — mendekatimu dengan pandangan tidak biasa.' },
    ],
    dialogs: [
      {
        speaker: 'Pak Budi',
        playerSpeaker: true,
        lines: [
          { who: 'pak_budi', text: `Eh, magang. Sini sebentar. Ada tugas penting yang perlu bantuan kamu.` },
          { who: 'player', text: `Tugas apa, Pak Budi? Saya siap membantu.` },
          { who: 'pak_budi', text: `Sederhana saja. Pergi ke gudang arsip, ambilkan dokumen anggaran Q3. Nanti kamu tandatangani sebagai saksi. Cepat, jangan tanya-tanya.` },
          { who: 'player', text: `(Kenapa harus saya yang tanda tangan? Dan kenapa begitu terburu-buru?) Baik Pak, tapi boleh saya lihat dulu dokumennya?` },
          { who: 'pak_budi', text: `Tidak perlu lihat detail! Kamu magang baru, tugas kamu ikut perintah. Ini nanti ada... imbalan kecil untukmu.` },
          { who: 'player', text: `(Imbalan? Ini mencurigakan sekali. Saya harus cari tahu lebih dulu...)` },
          { who: 'pak_budi', text: `Pergi sekarang! Dokumennya di gudang arsip. Dan kalau kamu temukan stempel dinas di sana, bawa juga ke sini.` },
        ]
      }
    ],
    brideDialogs: [
      { who: 'pak_budi', text: `Sudahlah, ambil saja uangnya. Tidak ada yang akan tahu. Kamu butuh uang, kan?` },
      { who: 'player', text: `(Godaan besar... tapi jika saya terima, saya menjadi bagian dari korupsi ini.)` },
    ],
    completionDialogs: [
      { who: 'player', text: `Pak Budi, saya sudah temukan dokumennya. Dan juga stempel palsu ini. Ini... bukti pemalsuan anggaran!` },
      { who: 'pak_budi', text: `H-hei, kamu tidak tahu apa-apa! Jangan macam-macam!` },
      { who: 'player', text: `Maaf Pak, tapi saya tidak bisa diam. Ini harus dilaporkan!` },
    ]
  },

  {
    id: 'mq3',
    day: 3,
    name: 'Data Yang Dimanipulasi',
    icon: '💻',
    desc: 'Bu Rina memintamu memasukkan "penyesuaian" data ke laporan. Temukan bukti manipulasi yang tersembunyi di sistem.',
    reward: { integrity: 15, trust: 20, money: 250 },
    npc: 'bu_rina',
    investigationItems: [
      { id: 'laporan_asli', name: 'Laporan Anggaran Asli', emoji: '📊', hint: 'File backup tersimpan di komputer sudut ruang kerja.', zone: 'office', tx: 67, ty: 28 },
      { id: 'flashdisk_bukti', name: 'Flashdisk Bukti Data', emoji: '💾', hint: 'Jatuh di balik printer kantor yang jarang dipakai.', zone: 'office', tx: 80, ty: 32 }
    ],
    shadow: true,
    bribeText: 'Bu Rina berbisik: "Nilai magang kamu akan sempurna jika kamu mau... bantu kecilkan angkanya. Tidak ada yang tahu."',
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Hari ketiga. Kamu mulai melihat pola yang tidak wajar dalam laporan-laporan kantor. Angkanya tidak cocok.' },
    ],
    dialogs: [
      {
        speaker: 'Bu Rina',
        playerSpeaker: true,
        lines: [
          { who: 'bu_rina', text: `Oh, kamu yang magang baru itu ya? Kebetulan sekali. Aku perlu bantuanmu dengan laporan bulanan.` },
          { who: 'player', text: `Tentu, Bu Rina. Laporan apa yang perlu dibantu?` },
          { who: 'bu_rina', text: `Sederhana saja. Data pengeluaran proyek ini... terlalu besar. Perlu sedikit "penyesuaian" supaya terlihat wajar.` },
          { who: 'player', text: `Penyesuaian? Maksudnya mengubah data yang ada?` },
          { who: 'bu_rina', text: `Jangan terlalu kaku begitu. Ini sudah biasa di sini. Semua orang melakukannya. Ini realita dunia kerja, nak.` },
          { who: 'player', text: `(Ini bukan "penyesuaian" — ini manipulasi data! Tapi saya perlu bukti dulu sebelum melapor.)` },
          { who: 'bu_rina', text: `Pergi cek komputer di sudut sana. Ada file backup laporan aslinya. Bandingkan sendiri kalau tidak percaya.` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'player', text: `Bu Rina, saya sudah cek laporannya. Ada selisih ratusan juta yang disembunyikan. Ini tidak bisa dibiarkan!` },
      { who: 'bu_rina', text: `Kamu terlalu idealis! Kamu masih muda, belum mengerti cara dunia bekerja.` },
      { who: 'player', text: `Saya mungkin muda, tapi saya tahu mana yang benar dan salah. Saya akan laporkan ini ke inspektorat.` },
    ]
  },

  {
    id: 'mq4',
    day: 4,
    name: 'Jejak Akar Bayangan',
    icon: '🌑',
    desc: 'Warga melaporkan aktivitas mencurigakan di malam hari. Selidiki dan temukan petunjuk tentang identitas pemimpin Akar Bayangan.',
    reward: { integrity: 20, trust: 25, shadow: -15, money: 300 },
    npc: 'kakek_hasan',
    investigationItems: [
      { id: 'surat_ancaman', name: 'Surat Ancaman Anonim', emoji: '✉️', hint: 'Terjatuh di dekat papan pengumuman taman kota.', zone: 'park', tx: 34, ty: 12 },
      { id: 'foto_pertemuan', name: 'Foto Pertemuan Rahasia', emoji: '📷', hint: 'Tersembunyi di bawah bangku taman yang rusak.', zone: 'park', tx: 29, ty: 20 },
      { id: 'badge_bayangan', name: 'Lencana Akar Bayangan', emoji: '🔰', hint: 'Tergeletak di sudut gelap gudang tua.', zone: 'ruins', tx: 95, ty: 90 }
    ],
    shadow: false,
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Hari keempat. Berita tentang "Akar Bayangan" mulai beredar di antara warga. Kakek Hasan — sesepuh kota — ingin bicara denganmu.' },
      { speaker: 'Narator', portrait: '📖', text: 'Matanya penuh kekhawatiran. Ini bukan pertama kali kota ini menghadapi ancaman seperti ini.' },
    ],
    dialogs: [
      {
        speaker: 'Kakek Hasan',
        playerSpeaker: true,
        lines: [
          { who: 'kakek_hasan', text: `Anak muda, aku sudah 70 tahun hidup di kota ini. Dan aku belum pernah melihat ancaman seperti sekarang.` },
          { who: 'player', text: `Apa yang terjadi, Kek? Tentang "Akar Bayangan" itu?` },
          { who: 'kakek_hasan', text: `Dulu ada kelompok korup yang hampir menghancurkan kota ini 30 tahun lalu. Sekarang... mereka bangkit lagi. Lebih kuat dari sebelumnya.` },
          { who: 'player', text: `Kek tahu siapa pemimpinnya?` },
          { who: 'kakek_hasan', text: `Belum pasti. Tapi aku melihat pertemuan mencurigakan di taman malam kemarin. Ada surat dan foto yang jatuh. Coba cari di sekitar taman.` },
          { who: 'player', text: `Baik Kek, saya akan selidiki!` },
          { who: 'kakek_hasan', text: `Hati-hati anak muda. Mereka tidak suka orang yang terlalu tahu. Dan jangan lupa periksa juga gudang tua di timur — ada aktivitas aneh di sana.` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'player', text: `Kek! Saya menemukan surat ancaman, foto pertemuan rahasia, dan lencana Akar Bayangan. Ini bukti yang cukup!` },
      { who: 'kakek_hasan', text: `Astaga... Ini lebih serius dari yang kukira. Kamu harus berhati-hati sekarang. Mereka pasti sudah tahu kamu menyelidiki mereka.` },
      { who: 'player', text: `Saya tidak akan berhenti. Kota ini harus diselamatkan!` },
    ]
  },

  {
    id: 'mq5',
    day: 5,
    name: 'Pengadaan Fiktif',
    icon: '🏗️',
    desc: 'Temukan bukti pengadaan barang fiktif senilai ratusan juta yang disembunyikan di gudang kantor.',
    reward: { integrity: 25, trust: 30, shadow: -20, money: 400 },
    npc: 'inspektorat',
    investigationItems: [
      { id: 'faktur_palsu', name: 'Faktur Pengadaan Palsu', emoji: '🧾', hint: 'Disembunyikan di dalam kardus di gudang kantor belakang.', zone: 'office', tx: 77, ty: 55 },
      { id: 'kwitansi_fiktif', name: 'Kwitansi Pembayaran Fiktif', emoji: '💰', hint: 'Terlipat di dalam buku tua di lemari inspektorat.', zone: 'office', tx: 63, ty: 50 },
      { id: 'cap_perusahaan', name: 'Cap Perusahaan Fiktif', emoji: '🔵', hint: 'Di laci tersembunyi meja inspektorat.', zone: 'office', tx: 65, ty: 52 }
    ],
    shadow: false,
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Hari kelima. Ibu Inspektur menghubungimu secara rahasia. Ia punya informasi penting.' },
      { speaker: 'Narator', portrait: '📖', text: 'Pengadaan barang fiktif senilai ratusan juta. Uang rakyat yang dicuri di siang bolong.' },
    ],
    dialogs: [
      {
        speaker: 'Ibu Inspektur',
        playerSpeaker: true,
        lines: [
          { who: 'inspektorat', text: `Ssst, tutup pintunya. Aku sudah amati kamu sejak hari pertama. Kamu anak yang jujur.` },
          { who: 'player', text: `Ada yang bisa saya bantu, Bu?` },
          { who: 'inspektorat', text: `Kami mendapat laporan aduan pengadaan barang fiktif. Tapi kami perlu bukti fisik. Seseorang memindahkan semua dokumennya.` },
          { who: 'player', text: `Dokumen itu disembunyikan di mana, Bu?` },
          { who: 'inspektorat', text: `Berdasarkan informasi internal, ada faktur palsu di gudang belakang. Ada juga kwitansi dan cap perusahaan fiktif yang disembunyikan di beberapa tempat.` },
          { who: 'player', text: `Biarkan saya yang cari. Saya bisa masuk tanpa menimbulkan kecurigaan.` },
          { who: 'inspektorat', text: `Tepat. Kamu adalah mata dan telinga kami. Hati-hati — ada pengawas yang loyal kepada Pak Budi di sekitar sana.` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'player', text: `Bu Inspektur! Saya berhasil menemukan semua buktinya. Faktur palsu, kwitansi fiktif, dan cap perusahaan yang dibuat-buat!` },
      { who: 'inspektorat', text: `Luar biasa! Ini cukup untuk membuka penyelidikan resmi. Nilai pengadaan fiktif ini mencapai Rp 2,3 miliar!` },
      { who: 'player', text: `Uang rakyat sebanyak itu... Harus dikembalikan!` },
      { who: 'inspektorat', text: `Kami akan tindaklanjuti. Tapi Akar Bayangan pasti sudah tahu tentang ini. Bersiaplah.` },
    ]
  },

  {
    id: 'mq6',
    day: 6,
    name: 'Konspirasi Terkuak',
    icon: '⚖️',
    desc: 'Temukan bukti terakhir yang mengungkap identitas pemimpin Akar Bayangan dan hancurkan jaringan korupsinya.',
    reward: { integrity: 30, trust: 35, shadow: -30, money: 500 },
    npc: 'pak_camat',
    investigationItems: [
      { id: 'buku_kode', name: 'Buku Kode Akar Bayangan', emoji: '📓', hint: 'Tersembunyi di balik lukisan di ruang camat.', zone: 'office', tx: 66, ty: 27 },
      { id: 'daftar_anggota', name: 'Daftar Anggota Organisasi', emoji: '📝', hint: 'Di dalam brankas yang terbuka di kantor camat.', zone: 'office', tx: 64, ty: 29 },
      { id: 'rekening_gelap', name: 'Bukti Rekening Gelap', emoji: '🏦', hint: 'Diselipkan di balik pigura foto di lobi kantor.', zone: 'office', tx: 70, ty: 23 }
    ],
    shadow: true,
    bribeText: 'Pak Camat mendekatimu dengan senyum licik: "Bergabunglah dengan kami. Kami akan berikan posisi bagus dan uang yang lebih dari cukup untuk hidupmu."',
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'Hari keenam. Situasi memuncak. Pak Camat — yang ternyata adalah pemimpin Akar Bayangan — mulai panik.' },
      { speaker: 'Narator', portrait: '📖', text: 'Ia mencoba satu cara terakhir untuk menghentikanmu: menawarkan tawaran yang sulit ditolak.' },
    ],
    dialogs: [
      {
        speaker: 'Pak Camat',
        playerSpeaker: true,
        lines: [
          { who: 'pak_camat', text: `Ah, si anak magang yang terlalu rajin. Kamu sudah terlalu jauh menyelidiki hal yang bukan urusanmu.` },
          { who: 'player', text: `Korupsi adalah urusan semua warga, Pak Camat. Termasuk saya.` },
          { who: 'pak_camat', text: `Ha! Idealis sekali. Dunia tidak bekerja seperti itu, anak muda. Semua orang punya harga. Berapa hargamu?` },
          { who: 'player', text: `Integritas saya tidak punya harga.` },
          { who: 'pak_camat', text: `(menghela napas panjang) Sayang sekali. Tapi aku masih memberi kesempatan. Bergabunglah dengan kami. Posisi bagus, gaji besar, masa depan cerah.` },
          { who: 'player', text: `Saya tidak tertarik. Dan saya tahu kamu yang memimpin Akar Bayangan. Saya akan cari bukti terakhirnya sekarang.` },
          { who: 'pak_camat', text: `Kamu... berani sekali. Baik. Tapi jangan salahkan aku kalau kamu menyesal.` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'player', text: `Pak Camat! Buku kode, daftar anggota, rekening gelap — semua ada di tangan saya sekarang!` },
      { who: 'pak_camat', text: `TIDAK MUNGKIN! Bagaimana kamu bisa...` },
      { who: 'player', text: `Game over, Pak Camat. Besok, hari terakhir magang saya, saya akan umumkan semua ini kepada warga kota!` },
    ]
  },

  {
    id: 'mq7',
    day: 7,
    name: 'Kejatuhan Akar Bayangan',
    icon: '🏆',
    desc: 'Hari terakhir! Hadapi Pak Camat dalam pertarungan final. Kalahkan pemimpin Akar Bayangan dan selamatkan Kota Nusantara!',
    reward: { integrity: 50, trust: 50, shadow: -100, money: 1000 },
    npc: 'pak_camat',
    investigationItems: [],
    shadow: false,
    isFinal: true,
    storyBefore: [
      { speaker: 'Narator', portrait: '📖', text: 'HARI TERAKHIR. Seluruh kota tahu kebenaran. Warga berkumpul. Semua mata tertuju padamu.' },
      { speaker: 'Narator', portrait: '📖', text: 'Pak Camat — dikelilingi anggota Akar Bayangan yang tersisa — berdiri di alun-alun kota. Inilah konfrontasi terakhir.' },
      { speaker: 'Narator', portrait: '📖', text: 'Kamu melangkah maju. Di tanganmu, semua bukti yang sudah dikumpulkan selama 6 hari. Di hatimu, tekad yang tak tergoyahkan.' },
    ],
    dialogs: [
      {
        speaker: 'Pak Camat',
        playerSpeaker: true,
        lines: [
          { who: 'pak_camat', text: `Jadi kamu benar-benar datang. Aku kira kamu sudah kabur.` },
          { who: 'player', text: `Aku tidak akan pernah kabur dari kebenaran. Ini untukmu, Pak Camat — semua bukti kejahatanmu ada di sini!` },
          { who: 'pak_camat', text: `Kamu pikir bukti-bukti itu cukup?! Aku punya kuasa di seluruh kota ini! Tidak ada yang berani melawanku!` },
          { who: 'player', text: `Lihat sekelilingmu. Warga sudah tahu semuanya. Kamu tidak punya tempat bersembunyi lagi.` },
          { who: 'pak_camat', text: `ARGH! Kalau begitu, kita selesaikan ini dengan cara lain. LAWAN AKU kalau kamu berani!` },
          { who: 'player', text: `Dengan senang hati. Untuk seluruh warga Kota Nusantara!` },
        ]
      }
    ],
    completionDialogs: [
      { who: 'pak_camat', text: `Ti... tidak mungkin. Aku kalah dari seorang magang muda?!` },
      { who: 'player', text: `Bukan karena aku yang kuat — tapi karena kebenaran selalu lebih kuat dari kejahatan.` },
      { who: 'bu_sari', text: `Luar biasa! Atas nama seluruh warga Kota Nusantara, kami berterima kasih padamu!` },
      { who: 'player', text: `Ini bukan akhir. Ini adalah awal. Kita semua harus menjaga kota ini bersama-sama!` },
      { who: 'narator', text: 'Akar Bayangan telah dihancurkan. Kota Nusantara merayakan kemenangan. Dan kamu — sang magang muda — telah membuktikan bahwa satu orang yang berani berbuat benar bisa mengubah segalanya.' },
    ]
  }
];

// ────────────────────────────────────────────────────────────
//  INVESTIGATION ITEM STATE
// ────────────────────────────────────────────────────────────
const QS = {
  foundItems: new Set(),        // item ids yang sudah ditemukan
  activeQuestId: null,
  questItemMarkers: [],         // marker yang ditampilkan di map
  questPhase: 'dialog',         // dialog | investigate | complete | battle
};

// ────────────────────────────────────────────────────────────
//  NPC PORTRAIT RENDERER (canvas-based)
// ────────────────────────────────────────────────────────────
const NPC_PORTRAITS = {
  bu_sari: { emoji: '👩‍💼', color: '#9c27b0', bgColor: '#f3e5f5', label: 'Bu Sari', title: 'Kepala Dinas' },
  pak_budi: { emoji: '🧑‍💼', color: '#e74c3c', bgColor: '#ffebee', label: 'Pak Budi', title: 'Staff Senior' },
  bu_rina: { emoji: '👩‍🔬', color: '#ff5722', bgColor: '#fbe9e7', label: 'Bu Rina', title: 'Analis Data' },
  pak_camat: { emoji: '👨‍⚖️', color: '#795548', bgColor: '#efebe9', label: 'Pak Camat', title: '⚠️ Pemimpin Koruptor' },
  inspektorat: { emoji: '🕵️‍♀️', color: '#009688', bgColor: '#e0f2f1', label: 'Ibu Inspektur', title: 'Kepala Inspektorat' },
  kakek_hasan: { emoji: '👴', color: '#8d6e63', bgColor: '#efebe9', label: 'Kakek Hasan', title: 'Sesepuh Kota' },
  player: { emoji: '🎓', color: '#1565c0', bgColor: '#e3f2fd', label: () => window.GS?.playerName || 'Kamu', title: 'Peserta Magang' },
  narator: { emoji: '📖', color: '#424242', bgColor: '#f5f5f5', label: 'Narator', title: '' },
};

// ────────────────────────────────────────────────────────────
//  ENHANCED QUEST DIALOG SYSTEM
// ────────────────────────────────────────────────────────────
function openQuestDialog(quest, dialogGroup, onFinish, choices) {
  // Build the enhanced dialog UI
  const overlay = document.createElement('div');
  overlay.id = 'quest-dialog-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:600;
    background:rgba(0,0,0,0.85);
    display:flex;align-items:flex-end;justify-content:center;
    padding-bottom:20px;
    animation:fadeIn 0.3s ease;
  `;

  const lines = dialogGroup.lines;
  let lineIdx = 0;
  let typing = false;
  let typingTimer = null;

  function getPortrait(who) {
    return NPC_PORTRAITS[who] || { emoji: '❓', color: '#666', bgColor: '#f5f5f5', label: who, title: '' };
  }

  function buildLine(line) {
    const p = getPortrait(line.who);
    const isPlayer = line.who === 'player';
    const label = typeof p.label === 'function' ? p.label() : p.label;

    overlay.innerHTML = `
      <div style="
        width:min(700px,96vw);
        background:linear-gradient(160deg,#0d1b2a,#1a1a3a);
        border:2px solid rgba(240,192,64,0.4);
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 0 60px rgba(240,192,64,0.15);
      ">
        <!-- Quest header -->
        <div style="
          background:linear-gradient(90deg,rgba(240,192,64,0.2),transparent);
          padding:10px 20px;
          display:flex;align-items:center;gap:10px;
          border-bottom:1px solid rgba(255,255,255,0.08);
        ">
          <span style="font-size:20px">${quest.icon}</span>
          <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:#f0c040;">
            MISI ${getCurrentQuestNumber(quest.id)} / 7
          </span>
          <span style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.5);">
            ${quest.name}
          </span>
        </div>

        <!-- Two-portrait layout -->
        <div style="display:flex;gap:0;min-height:200px;">
          <!-- Left: NPC -->
          <div style="
            width:120px;flex-shrink:0;
            display:flex;flex-direction:column;align-items:center;
            justify-content:flex-end;padding:20px 12px;
            background:${isPlayer ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.04)'};
            border-right:1px solid rgba(255,255,255,0.06);
            transition:all 0.3s;
            ${!isPlayer ? 'box-shadow:inset 0 0 20px rgba(240,192,64,0.05)' : ''}
          ">
            <div style="
              width:70px;height:70px;
              background:${p.bgColor};
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:36px;
              border:3px solid ${!isPlayer ? p.color : 'rgba(255,255,255,0.1)'};
              box-shadow:${!isPlayer ? '0 0 16px '+p.color+'66' : 'none'};
              filter:${isPlayer ? 'grayscale(0.4) brightness(0.7)' : 'none'};
              transition:all 0.3s;
            ">${p.emoji}</div>
            <div style="
              margin-top:8px;font-size:9px;font-weight:700;color:${!isPlayer ? p.color : 'rgba(255,255,255,0.3)'};
              text-align:center;font-family:'Press Start 2P',monospace;
            ">${label}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.35);text-align:center;margin-top:3px;">${p.title}</div>
          </div>

          <!-- Right: Player portrait (opposite side) -->
          <div style="flex:1;display:flex;flex-direction:column;padding:20px;">
            <!-- Speaker indicator -->
            <div style="
              font-size:9px;font-family:'Press Start 2P',monospace;
              color:${isPlayer ? '#64b5f6' : '#f0c040'};
              margin-bottom:10px;
              display:flex;align-items:center;gap:6px;
            ">
              <span style="
                width:6px;height:6px;border-radius:50%;
                background:${isPlayer ? '#64b5f6' : '#f0c040'};
                animation:pulse 1s infinite;
              "></span>
              ${isPlayer ? (typeof NPC_PORTRAITS.player.label === 'function' ? NPC_PORTRAITS.player.label() : 'Kamu') : label} berkata:
            </div>

            <!-- Dialog text -->
            <div id="qdialog-text" style="
              flex:1;
              font-family:'VT323',monospace;font-size:20px;
              color:#e8e8ff;line-height:1.5;
              min-height:80px;
            "></div>

            <!-- Choices or Continue -->
            <div id="qdialog-choices" style="margin-top:16px;"></div>
          </div>

          <!-- Right portrait (player) -->
          <div style="
            width:100px;flex-shrink:0;
            display:flex;flex-direction:column;align-items:center;
            justify-content:flex-end;padding:20px 12px;
            background:${isPlayer ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.1)'};
            border-left:1px solid rgba(255,255,255,0.06);
            ${isPlayer ? 'box-shadow:inset 0 0 20px rgba(100,181,246,0.05)' : ''}
          ">
            <div style="
              width:60px;height:60px;
              background:#e3f2fd;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:28px;
              border:3px solid ${isPlayer ? '#64b5f6' : 'rgba(255,255,255,0.1)'};
              box-shadow:${isPlayer ? '0 0 14px #64b5f680' : 'none'};
              filter:${!isPlayer ? 'grayscale(0.4) brightness(0.7)' : 'none'};
              transition:all 0.3s;
            ">🎓</div>
            <div style="
              margin-top:6px;font-size:8px;font-weight:700;
              color:${isPlayer ? '#64b5f6' : 'rgba(255,255,255,0.3)'};
              text-align:center;font-family:'Press Start 2P',monospace;
            ">${typeof NPC_PORTRAITS.player.label === 'function' ? NPC_PORTRAITS.player.label() : 'Kamu'}</div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div style="
          padding:12px 20px;
          border-top:1px solid rgba(255,255,255,0.06);
          display:flex;justify-content:space-between;align-items:center;
        ">
          <div style="font-size:9px;color:rgba(255,255,255,0.3);">
            ${lineIdx+1} / ${lines.length}
          </div>
          <div id="qdialog-hint" style="font-size:10px;color:rgba(255,255,255,0.4);">
            Klik atau tekan SPASI untuk lanjut ▶
          </div>
        </div>
      </div>
    `;

    // Typing animation
    const textEl = overlay.querySelector('#qdialog-text');
    typing = true;
    let pos = 0;
    const fullText = line.text;
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = setInterval(() => {
      if (pos < fullText.length) {
        textEl.textContent = fullText.substring(0, pos + 1);
        pos++;
      } else {
        typing = false;
        clearInterval(typingTimer);
        // If last line and has choices, show choices
        if (lineIdx >= lines.length - 1 && choices && choices.length) {
          showChoices();
        }
      }
    }, 22);
  }

  function showChoices() {
    const el = overlay.querySelector('#qdialog-choices');
    if (!el) return;
    const hintEl = overlay.querySelector('#qdialog-hint');
    if (hintEl) hintEl.style.display = 'none';
    el.innerHTML = '';
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        display:block;width:100%;margin-bottom:8px;padding:10px 16px;
        background:${c.type==='danger'?'linear-gradient(90deg,#c62828,#b71c1c)':c.type==='good'?'linear-gradient(90deg,#2e7d32,#1b5e20)':'rgba(255,255,255,0.08)'};
        border:1px solid ${c.type==='danger'?'#ef5350':c.type==='good'?'#66bb6a':'rgba(255,255,255,0.15)'};
        border-radius:8px;color:#fff;font-size:13px;cursor:pointer;
        font-family:'Nunito',sans-serif;font-weight:700;text-align:left;
        transition:all 0.2s;
      `;
      btn.onmouseover = () => btn.style.transform = 'translateX(4px)';
      btn.onmouseout = () => btn.style.transform = '';
      btn.textContent = c.text;
      btn.onclick = () => {
        document.body.removeChild(overlay);
        if (window.GS) window.GS.paused = false;
        if (c.callback) c.callback();
      };
      el.appendChild(btn);
    });
  }

  function advance() {
    if (typing) {
      // Skip typing
      if (typingTimer) clearInterval(typingTimer);
      typing = false;
      const textEl = overlay.querySelector('#qdialog-text');
      if (textEl) textEl.textContent = lines[lineIdx].text;
      if (lineIdx >= lines.length - 1 && choices && choices.length) {
        showChoices();
      }
      return;
    }
    lineIdx++;
    if (lineIdx >= lines.length) {
      // All lines done
      if (choices && choices.length) return; // choices already shown
      if (typingTimer) clearInterval(typingTimer);
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
      if (window.GS) window.GS.paused = false;
      if (onFinish) onFinish();
    } else {
      buildLine(lines[lineIdx]);
    }
  }

  overlay.onclick = advance;
  document.addEventListener('keydown', function onKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      advance();
      if (!document.body.contains(overlay)) {
        document.removeEventListener('keydown', onKey);
      }
    }
  });

  document.body.appendChild(overlay);
  if (window.GS) window.GS.paused = true;
  buildLine(lines[0]);

  // Add CSS animation
  if (!document.getElementById('qs-style')) {
    const style = document.createElement('style');
    style.id = 'qs-style';
    style.textContent = `
      @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      #quest-dialog-overlay { animation: fadeIn 0.3s ease; }
    `;
    document.head.appendChild(style);
  }
}

// ────────────────────────────────────────────────────────────
//  INVESTIGATION UI — Item Hunt System
// ────────────────────────────────────────────────────────────
function startInvestigation(quest) {
  QS.activeQuestId = quest.id;
  QS.questPhase = 'investigate';

  // Clear old markers
  QS.questItemMarkers = quest.investigationItems.map(item => ({
    ...item,
    found: QS.foundItems.has(item.id)
  }));

  // Show investigation HUD
  showInvestigationHUD(quest);

  // Place item pickups in world
  placeItemPickups(quest);

  if (window.showToast) {
    window.showToast(`🔍 Investigasi Dimulai! Cari ${quest.investigationItems.length} item petunjuk.`, 'warning', 4000);
  }
}

let investigationHUD = null;
function showInvestigationHUD(quest) {
  if (investigationHUD) investigationHUD.remove();

  investigationHUD = document.createElement('div');
  investigationHUD.id = 'investigation-hud';
  investigationHUD.style.cssText = `
    position:fixed;top:80px;left:50%;transform:translateX(-50%);
    z-index:200;
    background:linear-gradient(135deg,rgba(13,27,42,0.95),rgba(26,26,58,0.95));
    border:1.5px solid rgba(240,192,64,0.5);
    border-radius:12px;padding:12px 20px;
    min-width:300px;max-width:90vw;
    box-shadow:0 0 30px rgba(240,192,64,0.2);
    font-family:'Nunito',sans-serif;
  `;
  updateInvestigationHUD(quest);
  document.body.appendChild(investigationHUD);
}

function updateInvestigationHUD(quest) {
  if (!investigationHUD) return;
  const total = quest.investigationItems.length;
  const found = quest.investigationItems.filter(i => QS.foundItems.has(i.id)).length;

  investigationHUD.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:18px">${quest.icon}</span>
      <div>
        <div style="font-family:'Press Start 2P',monospace;font-size:8px;color:#f0c040;">
          MISI: ${quest.name}
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:3px;">
          🔍 Investigasi: ${found}/${total} item ditemukan
        </div>
      </div>
    </div>
    <div style="background:rgba(0,0,0,0.3);border-radius:6px;overflow:hidden;height:6px;margin-bottom:10px;">
      <div style="height:100%;background:linear-gradient(90deg,#f0c040,#ff9800);width:${(found/total*100)||0}%;transition:width 0.5s;"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${quest.investigationItems.map(item => `
        <div style="
          display:flex;align-items:center;gap:8px;
          padding:6px 10px;border-radius:6px;
          background:${QS.foundItems.has(item.id) ? 'rgba(46,125,50,0.3)' : 'rgba(255,255,255,0.04)'};
          border:1px solid ${QS.foundItems.has(item.id) ? 'rgba(102,187,106,0.4)' : 'rgba(255,255,255,0.08)'};
        ">
          <span style="font-size:16px;${QS.foundItems.has(item.id)?'filter:none':'filter:grayscale(1)'}">${item.emoji}</span>
          <div style="flex:1;">
            <div style="font-size:11px;font-weight:700;color:${QS.foundItems.has(item.id)?'#66bb6a':'rgba(255,255,255,0.7)'}">
              ${QS.foundItems.has(item.id) ? '✅ ' : '⬜ '}${item.name}
            </div>
            ${!QS.foundItems.has(item.id) ? `<div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:2px;">💡 ${item.hint}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Place invisible "pickup zones" on the map (checked each frame)
let itemPickupZones = [];
function placeItemPickups(quest) {
  itemPickupZones = quest.investigationItems
    .filter(item => !QS.foundItems.has(item.id))
    .map(item => ({ ...item }));
}

// Called from game loop integration
function checkItemPickups() {
  if (!window.player || itemPickupZones.length === 0) return;
  const TILE = window.TILE || 32;
  const px = window.player.x;
  const py = window.player.y;

  itemPickupZones = itemPickupZones.filter(zone => {
    const zx = zone.tx * TILE + TILE / 2;
    const zy = zone.ty * TILE + TILE / 2;
    const dist = Math.sqrt((px - zx) ** 2 + (py - zy) ** 2);
    if (dist < 48) {
      // Found!
      QS.foundItems.add(zone.id);
      if (window.showToast) window.showToast(`🔍 Ditemukan: ${zone.name}!`, 'success', 3000);
      if (window.sfxGood) window.sfxGood();
      if (window.spawnParticles) window.spawnParticles(px, py, '#f0c040', 12);

      // Update HUD
      const quest = MAIN_QUESTS_7.find(q => q.id === QS.activeQuestId);
      if (quest) {
        updateInvestigationHUD(quest);
        // Check if all found
        const allFound = quest.investigationItems.every(i => QS.foundItems.has(i.id));
        if (allFound) {
          setTimeout(() => onAllItemsFound(quest), 500);
        }
      }
      return false;
    }
    return true;
  });
}

function onAllItemsFound(quest) {
  QS.questPhase = 'complete';
  if (investigationHUD) {
    investigationHUD.style.borderColor = '#66bb6a';
    investigationHUD.style.boxShadow = '0 0 30px rgba(102,187,106,0.4)';
  }
  if (window.showToast) window.showToast('✅ Semua item ditemukan! Kembali ke NPC!', 'success', 4000);
  if (window.sfxQuest) window.sfxQuest();
}

// ────────────────────────────────────────────────────────────
//  DRAW ITEM MARKERS ON CANVAS
// ────────────────────────────────────────────────────────────
function drawItemMarkers(ctx, cx, cy) {
  if (!itemPickupZones || itemPickupZones.length === 0) return;
  const TILE = window.TILE || 32;
  const t = Date.now() * 0.003;

  itemPickupZones.forEach(zone => {
    const px = zone.tx * TILE + TILE / 2 - cx;
    const py = zone.ty * TILE + TILE / 2 - cy;
    if (px < -100 || py < -100 || px > (window.innerWidth || 800) + 100 || py > (window.innerHeight || 600) + 100) return;

    const bob = Math.sin(t + zone.tx) * 4;

    // Glow ring
    const grd = ctx.createRadialGradient(px, py + bob, 0, px, py + bob, 28);
    grd.addColorStop(0, 'rgba(240,192,64,0.4)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py + bob, 28, 0, Math.PI * 2);
    ctx.fill();

    // Item emoji
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.emoji, px, py + bob);

    // Label
    ctx.font = 'bold 9px Nunito,sans-serif';
    ctx.fillStyle = '#f0c040';
    ctx.textBaseline = 'top';
    ctx.fillText(zone.name, px, py + bob + 16);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ────────────────────────────────────────────────────────────
//  MAIN QUEST INTERACTION OVERRIDE
// ────────────────────────────────────────────────────────────
function getCurrentQuestNumber(questId) {
  return MAIN_QUESTS_7.findIndex(q => q.id === questId) + 1;
}

function getActiveMainQuest() {
  return MAIN_QUESTS_7.find(q =>
    window.GS?.questsActive?.has(q.id) && !window.GS?.questsDone?.has(q.id)
  ) || null;
}

function handleMainQuestNPC(npc) {
  const GS = window.GS;
  if (!GS) return false;

  // Find quest for this NPC
  const quest = MAIN_QUESTS_7.find(q =>
    q.npc === npc.id && !GS.questsDone.has(q.id)
  );
  if (!quest) return false;

  const isActive = GS.questsActive.has(quest.id);
  const isInvestigating = isActive && QS.activeQuestId === quest.id && QS.questPhase === 'investigate';
  const isComplete = isActive && QS.questPhase === 'complete' && QS.activeQuestId === quest.id;

  if (!isActive) {
    // Story before + offer quest
    if (quest.storyBefore && quest.storyBefore.length > 0) {
      showStorySlides(quest.storyBefore, () => {
        offerMainQuest(quest, npc);
      });
    } else {
      offerMainQuest(quest, npc);
    }
    return true;
  }

  if (isInvestigating) {
    // Show investigation progress
    const found = quest.investigationItems.filter(i => QS.foundItems.has(i.id)).length;
    const total = quest.investigationItems.length;
    const lines = [
      { who: npc.id in NPC_PORTRAITS ? npc.id : 'bu_sari', text: `Kamu sudah menemukan ${found} dari ${total} item. Terus cari ya!` }
    ];
    openQuestDialog(quest, { lines }, null, null);
    return true;
  }

  if (isComplete || quest.investigationItems.length === 0 && isActive) {
    // Completion dialog
    if (quest.completionDialogs) {
      openQuestDialog(quest, { lines: quest.completionDialogs }, () => {
        finalizeQuest(quest);
        if (quest.isFinal) triggerFinalEnding(quest);
      }, null);
    } else {
      finalizeQuest(quest);
      if (quest.isFinal) triggerFinalEnding(quest);
    }
    return true;
  }

  // pak_camat on final quest + active → go straight to battle dialog
  if (quest.isFinal && isActive && npc.id === 'pak_camat') {
    openQuestDialog(quest, quest.dialogs[0], () => {
      triggerFinalEnding(quest);
    }, null);
    return true;
  }

  return false;
}

function offerMainQuest(quest, npc) {
  const GS = window.GS;
  openQuestDialog(quest, quest.dialogs[0], () => {
    // After dialog, check if shadow quest
    if (quest.shadow) {
      // Offer bribe choice
      setTimeout(() => {
        showBribeChoice(quest, npc);
      }, 300);
    } else {
      // Start investigation
      GS.questsActive.add(quest.id);
      if (window.sfxQuest) window.sfxQuest();
      if (window.showToast) window.showToast(`📋 Misi Diterima: ${quest.name}`, 'warning', 3000);
      updateNewQuestUI();
      if (quest.investigationItems.length > 0) {
        setTimeout(() => startInvestigation(quest), 500);
      } else {
        QS.activeQuestId = quest.id;
        QS.questPhase = 'complete';
      }
    }
  }, null);
}

function showBribeChoice(quest, npc) {
  const GS = window.GS;
  const bribeLines = [
    { who: npc.id, text: quest.bribeText },
    ...(quest.brideDialogs || [])
  ];

  openQuestDialog(quest, { lines: bribeLines }, null, [
    {
      type: 'danger',
      text: '💰 Terima Tawaran (Korup)',
      callback: () => {
        if (window.modShadow) window.modShadow(+20);
        if (window.modIntegrity) window.modIntegrity(-25);
        GS.questsDone.add(quest.id);
        GS.questsActive.delete(quest.id);
        if (window.showToast) window.showToast('😔 Kamu menerima suap... Akar Bayangan menguat!', 'error', 4000);
        updateNewQuestUI();
        if (investigationHUD) investigationHUD.remove();
      }
    },
    {
      type: 'good',
      text: '🚫 Tolak dengan Tegas!',
      callback: () => {
        if (window.modShadow) window.modShadow(-10);
        if (window.modIntegrity) window.modIntegrity(+15);
        GS.questsActive.add(quest.id);
        if (window.sfxGood) window.sfxGood();
        if (window.showToast) window.showToast('✊ Tawaran ditolak! Integritasmu terjaga!', 'success', 3000);
        if (window.spawnParticles) window.spawnParticles(window.player.x, window.player.y, '#66bb6a', 16);
        updateNewQuestUI();
        if (quest.investigationItems.length > 0) {
          setTimeout(() => startInvestigation(quest), 500);
        } else {
          QS.activeQuestId = quest.id;
          QS.questPhase = 'complete';
        }
      }
    }
  ]);
}

function finalizeQuest(quest) {
  const GS = window.GS;
  GS.questsDone.add(quest.id);
  GS.questsActive.delete(quest.id);
  QS.activeQuestId = null;
  QS.questPhase = 'dialog';
  itemPickupZones = [];
  if (investigationHUD) { investigationHUD.remove(); investigationHUD = null; }

  if (window.sfxQuest) window.sfxQuest();
  if (window.spawnParticles) window.spawnParticles(window.player?.x || 0, window.player?.y || 0, '#f0c040', 20);

  const r = quest.reward;
  if (r.integrity && window.modIntegrity) window.modIntegrity(r.integrity);
  if (r.trust && window.modTrust) window.modTrust(r.trust);
  if (r.shadow && window.modShadow) window.modShadow(r.shadow);
  if (r.money && GS.money !== undefined) {
    GS.money += r.money;
    if (window.updateMoneyUI) window.updateMoneyUI();
  }

  if (window.showToast) window.showToast(`✅ Misi Selesai: ${quest.name}! +${r.money} Rp`, 'success', 4000);
  updateNewQuestUI();
}

// ────────────────────────────────────────────────────────────
//  STORY SLIDES (before quest)
// ────────────────────────────────────────────────────────────
function showStorySlides(slides, onDone) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:700;
    background:#000;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:20px;
    padding:40px;
  `;

  let idx = 0;
  function showSlide() {
    if (idx >= slides.length) {
      overlay.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        if (onDone) onDone();
      }, 500);
      return;
    }
    const s = slides[idx];
    overlay.innerHTML = `
      <div style="
        font-size:48px;text-align:center;
        animation:fadeIn 0.5s ease;
      ">${s.portrait || '📖'}</div>
      <div style="
        font-size:9px;font-family:'Press Start 2P',monospace;
        color:rgba(255,255,255,0.5);letter-spacing:2px;
        animation:fadeIn 0.5s ease;
      ">${s.speaker}</div>
      <div style="
        font-family:'VT323',monospace;font-size:26px;
        color:#e8e8ff;text-align:center;max-width:600px;
        line-height:1.5;
        animation:fadeIn 0.5s ease;
      ">${s.text}</div>
      <div style="
        margin-top:20px;font-size:11px;color:rgba(255,255,255,0.3);
        animation:pulse 2s infinite;
      ">Klik untuk lanjut ▶</div>
    `;
  }

  overlay.onclick = () => { idx++; showSlide(); };
  document.body.appendChild(overlay);
  if (window.GS) window.GS.paused = true;
  showSlide();
}

// ────────────────────────────────────────────────────────────
//  NEW QUEST UI (replaces old tabs - only 7 main quests)
// ────────────────────────────────────────────────────────────
function updateNewQuestUI() {
  const GS = window.GS;
  const list = document.getElementById('quest-list');
  if (!list) return;
  list.innerHTML = '';

  MAIN_QUESTS_7.forEach((quest, i) => {
    const done = GS?.questsDone.has(quest.id);
    const active = GS?.questsActive.has(quest.id);
    const locked = !done && !active && i > 0 && !GS?.questsDone.has(MAIN_QUESTS_7[i-1].id);

    const div = document.createElement('div');
    div.style.cssText = `
      padding:14px 16px;margin-bottom:10px;
      background:${done ? 'rgba(46,125,50,0.15)' : active ? 'rgba(240,192,64,0.1)' : 'rgba(255,255,255,0.03)'};
      border:1.5px solid ${done ? 'rgba(102,187,106,0.4)' : active ? 'rgba(240,192,64,0.5)' : 'rgba(255,255,255,0.07)'};
      border-radius:10px;
      ${locked ? 'opacity:0.4;' : ''}
      transition:all 0.3s;
      cursor:${locked ? 'not-allowed' : 'pointer'};
    `;

    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:${done?'#2e7d32':active?'#f57f17':'rgba(255,255,255,0.08)'};
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
        ">${done ? '✅' : active ? quest.icon : locked ? '🔒' : quest.icon}</div>
        <div style="flex:1;">
          <div style="
            font-family:'Press Start 2P',monospace;font-size:8px;
            color:${done?'#66bb6a':active?'#f0c040':'rgba(255,255,255,0.6)'};
          ">
            HARI ${quest.day} — ${quest.name}
          </div>
        </div>
        <div style="
          font-size:9px;padding:3px 8px;border-radius:12px;
          background:${done?'rgba(46,125,50,0.3)':active?'rgba(240,192,64,0.2)':'rgba(255,255,255,0.05)'};
          color:${done?'#66bb6a':active?'#f0c040':'rgba(255,255,255,0.3)'};
          font-weight:700;
        ">${done?'✓ Selesai':active?'▶ Aktif':'Menunggu'}</div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:8px;padding-left:46px;">${quest.desc}</div>
      ${active && quest.investigationItems.length > 0 ? `
        <div style="padding-left:46px;">
          <div style="font-size:10px;color:#64b5f6;margin-bottom:4px;">🔍 Item yang dicari:</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${quest.investigationItems.map(item => `
              <span style="
                font-size:10px;padding:2px 8px;border-radius:10px;
                background:${QS.foundItems.has(item.id)?'rgba(46,125,50,0.3)':'rgba(255,255,255,0.05)'};
                color:${QS.foundItems.has(item.id)?'#66bb6a':'rgba(255,255,255,0.4)'};
                border:1px solid ${QS.foundItems.has(item.id)?'rgba(102,187,106,0.3)':'rgba(255,255,255,0.08)'};
              ">${item.emoji} ${QS.foundItems.has(item.id)?'✓ ':''} ${item.name}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div style="padding-left:46px;margin-top:6px;">
        <span style="font-size:10px;color:rgba(255,255,255,0.3);">
          🎁 Reward: +${quest.reward.integrity||0} Integritas | +${quest.reward.trust||0} Kepercayaan | +Rp${quest.reward.money||0}
          ${quest.reward.shadow ? ` | 🌑 Bayangan ${quest.reward.shadow}` : ''}
        </span>
      </div>
    `;

    list.appendChild(div);
  });

  // Day progress bar at top
  const doneCount = MAIN_QUESTS_7.filter(q => GS?.questsDone.has(q.id)).length;
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    padding:12px 16px;margin-bottom:16px;
    background:rgba(240,192,64,0.08);
    border:1px solid rgba(240,192,64,0.2);
    border-radius:10px;
  `;
  progressDiv.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-family:'Press Start 2P',monospace;font-size:8px;color:#f0c040;">KEMAJUAN MISI UTAMA</span>
      <span style="font-size:12px;font-weight:700;color:#f0c040;">${doneCount}/7</span>
    </div>
    <div style="height:8px;background:rgba(0,0,0,0.3);border-radius:4px;overflow:hidden;">
      <div style="height:100%;width:${(doneCount/7)*100}%;background:linear-gradient(90deg,#f0c040,#ff9800);border-radius:4px;transition:width 0.5s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;">
      ${MAIN_QUESTS_7.map(q => `
        <div style="
          width:24px;height:24px;border-radius:50%;
          background:${GS?.questsDone.has(q.id)?'#2e7d32':GS?.questsActive.has(q.id)?'#f57f17':'rgba(255,255,255,0.1)'};
          display:flex;align-items:center;justify-content:center;
          font-size:11px;
          border:2px solid ${GS?.questsDone.has(q.id)?'#66bb6a':GS?.questsActive.has(q.id)?'#f0c040':'rgba(255,255,255,0.1)'};
        " title="Hari ${q.day}: ${q.name}">${GS?.questsDone.has(q.id)?'✓':q.icon}</div>
      `).join('')}
    </div>
  `;
  list.insertBefore(progressDiv, list.firstChild);
}

// ────────────────────────────────────────────────────────────
//  FINAL ENDING TRIGGER
// ────────────────────────────────────────────────────────────
function triggerFinalEnding(quest) {
  setTimeout(() => {
    // Simpan state lalu redirect ke halaman battle
    try {
      sessionStorage.setItem('battleVillainId',   'pak_camat');
      sessionStorage.setItem('battleVillainName', '😈 Pak Camat — Pemimpin Akar Bayangan');
      sessionStorage.setItem('battlePlayerName',  window.GS?.playerName || 'Mahasiswa');
      sessionStorage.setItem('battleIntegrity',   window.GS?.integrity || 100);
      sessionStorage.setItem('battleTrust',       window.GS?.trust || 80);
      sessionStorage.setItem('battleShadow',      window.GS?.shadow || 0);
      sessionStorage.setItem('battleIsFinal',     '1');
      sessionStorage.setItem('battleReturnUrl',   window.location.href);
    } catch(e) {}
    window.location.href = 'indonesia-battle.html';
  }, 1200);
}

function showFinalCutscene() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:999;
    background:#000;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    font-family:'Press Start 2P',monospace;
  `;

  const won = (window.GS?.shadow || 0) < 70;

  const scenes = [
    { bg: '#0a0a0a', text: won ? '✨ KEMENANGAN ✨' : '🌑 KEGAGALAN 🌑', color: won ? '#f0c040' : '#8b0000', delay: 0 },
    { bg: won ? '#0d2a0d' : '#1a0000', text: won ? 'Akar Bayangan telah dikalahkan!' : 'Akar Bayangan menguasai kota...', color: won ? '#66bb6a' : '#ef5350', delay: 2000 },
    { bg: won ? '#0a1a2a' : '#0d0d0d', text: won ? `${window.GS?.playerName||'Hero'} menjadi pahlawan Kota Nusantara!` : 'Masih ada harapan... coba lagi.', color: won ? '#64b5f6' : '#ff7043', delay: 4000 },
  ];

  overlay.innerHTML = `
    <canvas id="ending-canvas" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
    <div id="ending-text" style="position:relative;z-index:10;text-align:center;padding:40px;"></div>
    <button id="ending-btn" style="
      position:relative;z-index:10;
      margin-top:40px;padding:16px 40px;
      background:linear-gradient(90deg,#f0c040,#ff9800);
      border:none;border-radius:8px;
      font-family:'Press Start 2P',monospace;font-size:12px;
      cursor:pointer;color:#000;
      animation:pulse 1.5s infinite;
      display:none;
    ">▶ Main Lagi</button>
  `;
  document.body.appendChild(overlay);

  // Particle ending animation
  const endCanvas = document.getElementById('ending-canvas');
  if (endCanvas) {
    endCanvas.width = window.innerWidth;
    endCanvas.height = window.innerHeight;
    const ec = endCanvas.getContext('2d');
    const particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * endCanvas.width,
        y: Math.random() * endCanvas.height + endCanvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -(1 + Math.random() * 3),
        r: 2 + Math.random() * 4,
        color: won ? `hsl(${40+Math.random()*40},100%,${50+Math.random()*30}%)` : `hsl(${350+Math.random()*20},80%,30%)`,
        life: 1,
        decay: 0.004 + Math.random() * 0.006
      });
    }
    function animateEnding() {
      ec.fillStyle = 'rgba(0,0,0,0.08)';
      ec.fillRect(0, 0, endCanvas.width, endCanvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.y < -10) { p.y = endCanvas.height + 10; p.life = 1; }
        ec.globalAlpha = p.life;
        ec.fillStyle = p.color;
        ec.beginPath(); ec.arc(p.x, p.y, p.r, 0, Math.PI * 2); ec.fill();
      });
      ec.globalAlpha = 1;
      if (document.body.contains(overlay)) requestAnimationFrame(animateEnding);
    }
    animateEnding();
  }

  // Show scenes sequentially
  const textEl = document.getElementById('ending-text');
  scenes.forEach((scene, i) => {
    setTimeout(() => {
      if (!document.body.contains(overlay)) return;
      overlay.style.background = scene.bg;
      textEl.innerHTML = `
        <div style="
          font-size:clamp(16px,4vw,36px);
          color:${scene.color};
          text-shadow:0 0 30px ${scene.color};
          animation:fadeIn 1s ease;
          line-height:1.8;
        ">${scene.text}</div>
      `;
    }, scene.delay);
  });

  // Show final stats
  setTimeout(() => {
    if (!document.body.contains(overlay)) return;
    textEl.innerHTML += `
      <div style="
        margin-top:30px;padding:20px 30px;
        background:rgba(255,255,255,0.05);border-radius:12px;
        border:1px solid rgba(255,255,255,0.1);
        animation:fadeIn 1s ease;
      ">
        <div style="margin-bottom:10px;font-size:8px;color:rgba(255,255,255,0.5);">STATISTIK AKHIR</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:10px;">
          <div style="color:#66bb6a;">🛡 Integritas: ${window.GS?.integrity||0}%</div>
          <div style="color:#64b5f6;">🌟 Kepercayaan: ${window.GS?.trust||0}%</div>
          <div style="color:#ef5350;">🌑 Akar Bayangan: ${window.GS?.shadow||0}%</div>
          <div style="color:#f0c040;">✅ Misi Selesai: ${window.GS?.questsDone?.size||0}</div>
        </div>
      </div>
    `;
    document.getElementById('ending-btn').style.display = 'block';
  }, 6000);

  document.getElementById('ending-btn').onclick = () => location.reload();
}

// ────────────────────────────────────────────────────────────
//  INTEGRATION — Hook into game engine
// ────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    hookGameEngine();
  }, 800);
});

function hookGameEngine() {
  // Override quest tabs to show only 7 quests
  const tabs = document.querySelectorAll('.qtab');
  tabs.forEach(tab => {
    if (tab.dataset.tab !== 'main') {
      tab.style.display = 'none';
    }
  });
  const mainTab = document.querySelector('.qtab[data-tab="main"]');
  if (mainTab) mainTab.classList.add('active');

  // Override updateQuestUI globally
  window.updateQuestUI = updateNewQuestUI;

  // Hook into renderGame to draw item markers
  const origRender = window.renderGame;
  if (origRender) {
    window.renderGame = function(cx, cy) {
      origRender(cx, cy);
      // Draw item markers after everything else
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawItemMarkers(ctx, cx, cy);
      }
    };
  }

  // Hook into game loop for pickup detection
  const origLoop = window.gameLoop;
  if (origLoop) {
    window.gameLoop = function(ts) {
      if (window.GS?.phase === 'game' && !window.GS?.paused) {
        checkItemPickups();
      }
      origLoop(ts);
    };
  }

  // Hook into interactWithNPC
  const origInteract = window.interactWithNPC;
  if (origInteract) {
    window.interactWithNPC = function(npc) {
      // Try main quest first
      if (handleMainQuestNPC(npc)) return;
      // Fall back to original
      origInteract(npc);
    };
  }

  // Initial quest UI update
  updateNewQuestUI();

  console.log('✅ [QuestSystem] Loaded — 7 Main Quests active');
}
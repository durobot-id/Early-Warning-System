'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  AlertTriangle,
  HeartPulse,
  HelpCircle,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  category: 'pengetahuan' | 'pra' | 'tanggap' | 'pasca';
  categoryLabel: string;
  summary: string;
  keyPoints: string[];
}

const VIDEOS: VideoItem[] = [
  // 1. Pengetahuan tentang Bencana
  {
    id: 'vid-1',
    youtubeId: 'b5wjvTA4ao4',
    title: 'Mengenal Bencana Banjir & Siklus Air',
    category: 'pengetahuan',
    categoryLabel: 'Pengetahuan Bencana',
    summary:
      'Video ini menjelaskan proses mendasar terjadinya banjir ketika volume air hujan yang jatuh ke permukaan tanah melampaui kapasitas serapan tanah dan daya tampung saluran drainase maupun sungai. Memahami siklus hidrologi membantu masyarakat menyadari pentingnya menjaga keseimbangan ekosistem tangkapan air.',
    keyPoints: [
      'Penyebab utama banjir akibat ketidakseimbangan antara debit hujan dan kapasitas resapan.',
      'Perbedaan banjir genangan perlahan dengan banjir bandang berkecepatan tinggi.',
      'Pentingnya daerah resapan air di wilayah hulu untuk mencegah aliran permukaan berlebih.',
    ],
  },
  {
    id: 'vid-2',
    youtubeId: 'nJeNMDZvcrQ',
    title: 'Faktor Penyebab Banjir & Kerusakan Lingkungan',
    category: 'pengetahuan',
    categoryLabel: 'Pengetahuan Bencana',
    summary:
      'Mengulas kombinasi faktor alam dan campur tangan manusia dalam memicu banjir. Alih fungsi lahan terbuka hijau, pemukiman di bantaran sungai, serta kebiasaan membuang sampah ke aliran air mempersempit palung sungai dan memicu luapan air saat hujan deras melanda.',
    keyPoints: [
      'Penyempitan dan sedimentasi sungai mengurangi volume tampung aliran air hujan.',
      'Dampak penggundulan lereng perbukitan yang mempercepat limpasan air hujan ke hilir.',
      'Solusi kolektif melalui normalisasi sungai, pembuatan sumur resapan, dan penataan ruang.',
    ],
  },
  {
    id: 'vid-3',
    youtubeId: '_Xmv33bedtI',
    title: 'Karakteristik dan Bahaya Banjir Bandang',
    category: 'pengetahuan',
    categoryLabel: 'Pengetahuan Bencana',
    summary:
      'Membahas ancaman banjir bandang yang terjadi secara mendadak dengan energi kinetik tinggi. Video ini menguraikan bagaimana bendung alami di hulu yang jebol dapat menghempaskan air bercampur lumpur, kayu, dan bebatuan besar yang sangat merusak fasilitas dan membahayakan keselamatan jiwa.',
    keyPoints: [
      'Tanda-tanda awal: air sungai hulu mendadak keruh pekat dan debit sempat menurun sesaat sebelum gelombang tiba.',
      'Kecepatan arus banjir bandang mampu menyeret kendaraan dan meruntuhkan struktur bangunan.',
      'Segera evakuasi ke tempat yang lebih tinggi begitu tanda-tanda banjir bandang terdeteksi.',
    ],
  },
  {
    id: 'vid-4',
    youtubeId: 'q_zBo9RWZ1A',
    title: 'Pentingnya Sistem Peringatan Dini (EWS)',
    category: 'pengetahuan',
    categoryLabel: 'Pengetahuan Bencana',
    summary:
      'Penjelasan tentang peran teknologi Early Warning System (EWS) dalam mitigasi banjir. Sensor pemantau level air dan curah hujan mengirimkan data realtime ke posko siaga sehingga masyarakat dapat memperoleh peringatan dini beberapa jam sebelum air meluap ke pemukiman.',
    keyPoints: [
      'Peringatan dini memberi waktu tanggap (lead time) bagi warga untuk evakuasi mandiri.',
      'Integrasi data sensor IoT dengan informasi BMKG meningkatkan akurasi prakiraan banjir.',
      'Diseminasi peringatan melalui aplikasi dan sirene meminimalisir risiko korban jiwa.',
    ],
  },

  // 2. Pra Bencana
  {
    id: 'vid-5',
    youtubeId: 'atbeX2bQtj4',
    title: 'Kesiapsiagaan Pra-Bencana (Sebelum Terjadi Banjir)',
    category: 'pra',
    categoryLabel: 'Pra Bencana',
    summary:
      'Panduan komprehensif bagi keluarga untuk mempersiapkan diri sebelum musim penghujan tiba. Menitikberatkan pada penyusunan rencana evakuasi keluarga, pengenalan titik kumpul aman, serta penyiapan Tas Siaga Bencana (TSB) yang selalu siap dibawa kapan saja.',
    keyPoints: [
      'Siapkan Tas Siaga Bencana (TSB) berisi surat berharga, obat pribadi, makanan siap santap, air minum, dan senter.',
      'Simpan dokumen penting dan barang elektronik di tempat yang tinggi dan kedap air.',
      'Ketahui jalur evakuasi resmi dan simpan nomor kontak darurat posko BPBD serta RT/RW.',
    ],
  },

  // 3. Tanggap Bencana
  {
    id: 'vid-6',
    youtubeId: 'IJFVib4YiXA',
    title: 'Prosedur Tanggap Darurat Saat Banjir Terjadi',
    category: 'tanggap',
    categoryLabel: 'Tanggap Bencana',
    summary:
      'Langkah-langkah kritis yang wajib diambil saat air mulai memasuki rumah atau lingkungan. Keselamatan jiwa adalah prioritas utama: segera matikan sumber aliran listrik, hindari berjalan di dekat kabel atau arus deras, dan prioritaskan evakuasi kelompok rentan.',
    keyPoints: [
      'Segera matikan saklar listrik utama (MCB) dan cabut regulator tabung gas untuk mencegah kebakaran.',
      'Jangan menerobos arus air deras yang lebih dari 15 cm karena berisiko terpeleset atau hanyut.',
      'Utamakan evakuasi balita, lansia, ibu hamil, dan penyandang disabilitas ke posko pengungsian aman.',
    ],
  },

  // 4. Pasca Bencana
  {
    id: 'vid-7',
    youtubeId: 'rPUw8Er5JX8',
    title: 'Pemulihan dan Sanitasi Pasca Bencana Banjir',
    category: 'pasca',
    categoryLabel: 'Pasca Bencana',
    summary:
      'Instruksi penting saat kembali ke rumah setelah banjir dinyatakan surut oleh otoritas terkait. Fokus pada pencegahan sengatan listrik sisa, kewaspadaan terhadap hewan liar berbisa yang terbawa arus, serta pembersihan endapan lumpur menggunakan disinfektan untuk mencegah wabah penyakit.',
    keyPoints: [
      'Pastikan instalasi listrik sudah diperiksa oleh teknisi sebelum dinyalakan kembali.',
      'Waspadai keberadaan hewan liar di sela-sela perabotan rumah.',
      'Bersihkan rumah dengan cairan disinfektan untuk mencegah penyakit leptospirosis dan diare.',
      'Konsumsi air bersih yang telah dimasak hingga mendidih sempurna.',
    ],
  },
];

export default function EdukasiPage() {
  const [activeTab, setActiveTab] = useState<string>('semua');

  const filteredVideos =
    activeTab === 'semua'
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === activeTab);

  const categories = [
    { id: 'semua', label: 'Semua Video', icon: BookOpen },
    { id: 'pengetahuan', label: 'Pengetahuan Bencana', icon: HelpCircle },
    { id: 'pra', label: 'Pra Bencana', icon: Shield },
    { id: 'tanggap', label: 'Tanggap Darurat', icon: AlertTriangle },
    { id: 'pasca', label: 'Pasca Bencana', icon: HeartPulse },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Halaman */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Edukasi & Mitigasi
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Video Edukasi dan Panduan Penyelamatan Bencana
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            {VIDEOS.length} Video
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Banner Edukasi Mobile */}
        <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-sm">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Shield className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100 break-words">
              Kesiapsiagaan Menyelamatkan Jiwa
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold leading-snug break-words">
            Ketahui Risiko, Kurangi Dampak
          </h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed break-words">
            Pelajari siklus mitigasi bencana mulai dari tindakan sebelum banjir, saat debit air meluap, hingga pemulihan pasca bencana.
          </p>
        </div>

        {/* Filter Kategori Tab Bebas Emoji dengan Icon Lucide */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Daftar Video & Penjelasan */}
        <div className="space-y-4">
          {filteredVideos.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Embed YouTube Player Responsif 16:9 */}
              <div className="relative w-full aspect-video bg-slate-900">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {/* Konten & Penjelasan di Bawah Video */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    {item.categoryLabel}
                  </span>
                  <a
                    href={`https://youtu.be/${item.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>Buka di YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                {/* Deskripsi Penjelasan Video */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Penjelasan Isi Video:
                  </p>
                  <p>{item.summary}</p>
                </div>

                {/* Poin-poin Tindakan Kunci */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Poin Penting untuk Warga:
                  </p>
                  {item.keyPoints.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

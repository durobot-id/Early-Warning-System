'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  ShieldAlert,
  HeartPulse,
  Flame,
  Shield,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
} from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';
import { CalibrationModal } from '@/components/CalibrationModal';
import { DeviceInfoCard } from '@/components/DeviceInfoCard';
import { NotificationPermissionCard } from '@/components/NotificationPermission';

export default function DaruratPage() {
  const { appData, isDangerCondition, dangerReason, activeStatus, currentWaterLevel, deviceState } = useEWS();

  // State Kalibrasi
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<
    'idle' | 'processing' | 'success' | 'failed' | 'timeout'
  >('idle');
  const [calibrationMsg, setCalibrationMsg] = useState<string>('');

  const handleTriggerCalibration = async () => {
    setCalibrationStatus('processing');
    try {
      const res = await fetch('/api/calibration', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCalibrationStatus('success');
        setCalibrationMsg(data.message || 'Sensor berhasil dikalibrasi!');
      } else {
        setCalibrationStatus('failed');
        setCalibrationMsg(data.message || 'Sensor gagal merespons');
      }
    } catch (err: any) {
      setCalibrationStatus('failed');
      setCalibrationMsg('Gagal menghubungkan ke server kalibrasi');
    }
  };

  // Kontak Darurat Resmi Skala Nasional Indonesia (Berlaku di Semua Wilayah)
  const nationalEmergencyContacts = [
    {
      name: 'Panggilan Darurat Terpadu Nasional',
      number: '112',
      telHref: 'tel:112',
      desc: 'Bebas pulsa 24 jam untuk segala jenis bencana darurat dan penanganan evakuasi BPBD.',
      icon: AlertOctagon,
      badge: 'Bebas Pulsa',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    {
      name: 'BASARNAS (Pencarian & Pertolongan)',
      number: '115',
      telHref: 'tel:115',
      desc: 'Badan SAR Nasional untuk evakuasi darurat korban hanyut atau terjebak banjir.',
      icon: ShieldAlert,
      badge: 'SAR Nasional',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      name: 'Layanan Darurat Medis & Ambulans',
      number: '119',
      telHref: 'tel:119',
      desc: 'PSC 119 Kementerian Kesehatan untuk bantuan gawat darurat medis dan ambulans.',
      icon: HeartPulse,
      badge: 'Medis Kemenkes',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      name: 'Pemadam Kebakaran & Penyelamatan',
      number: '113',
      telHref: 'tel:113',
      desc: 'Penyelamatan darurat evakuasi genangan air deras dan potensi korsleting listrik.',
      icon: Flame,
      badge: 'Evakuasi',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      btnColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    {
      name: 'Kepolisian Republik Indonesia',
      number: '110',
      telHref: 'tel:110',
      desc: 'Pengamanan lingkungan jalur evakuasi dan koordinasi keselamatan warga.',
      icon: Shield,
      badge: 'Polri',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Penyelamatan & Darurat
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Kontak Nasional BPBD, Panduan Evakuasi, & Kalibrasi
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Status Darurat Saat Ini */}
        {isDangerCondition ? (
          <div className="w-full max-w-full overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md space-y-2 animate-alert-pulse">
            <div className="flex items-center gap-1.5 flex-wrap">
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                Kondisi Kritis Aktif
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black leading-tight break-words">
              Status: {activeStatus.name} ({currentWaterLevel} cm)
            </h2>
            <p className="text-xs text-white/95 font-medium leading-relaxed break-words">
              {dangerReason || 'Segera lakukan evakuasi barang berharga dan hubungi posko siaga jika air terus meluap ke pemukiman.'}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-hidden p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-start gap-2.5 sm:gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-extrabold text-slate-900 break-words">
                Status Pemantauan: {activeStatus.name || 'Terkendali'}
              </p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed break-words">
                Ketinggian air terpantau pada level normal ({currentWaterLevel} cm). Simpan nomor darurat nasional di bawah ini untuk kesiapsiagaan sewaktu-waktu.
              </p>
            </div>
          </div>
        )}

        {/* Daftar Kontak Panggilan Darurat Nasional Indonesia */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
            Panggilan Darurat Nasional Indonesia (Bebas Pulsa)
          </h2>

          <div className="space-y-2.5">
            {nationalEmergencyContacts.map((contact, idx) => {
              const Icon = contact.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${contact.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {contact.name}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.2 bg-slate-100 text-slate-600 rounded-md">
                          {contact.badge}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-blue-600 mt-0.5">
                        {contact.number}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {contact.desc}
                      </p>
                    </div>
                  </div>

                  <a
                    href={contact.telHref}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0 ${contact.btnColor}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Panggil</span>
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Panduan Cepat Penyelamatan Mandiri */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            Langkah Cepat Penyelamatan Saat Air Naik
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <span><strong>Putuskan Arus Listrik:</strong> Turunkan saklar MCB utama untuk mencegah bahaya korsleting dan sengatan listrik di dalam air.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <span><strong>Amankan Dokumen & Tas Siaga:</strong> Bawa dokumen berharga ke lantai atas atau titik pengungsian aman.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <span><strong>Evakuasi Kelompok Rentan:</strong> Prioritaskan anak-anak, lansia, dan ibu hamil sebelum debit air menghalangi jalur jalan.</span>
            </div>
          </div>
        </section>

        {/* Pengaturan & Token Peringatan Siaga FCM */}
        <section className="space-y-2">
          <NotificationPermissionCard />
        </section>

        {/* Informasi Alat & Sensor */}
        {appData && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Status Perangkat & Sensor
            </h2>

            <DeviceInfoCard
              info={appData.info}
              live={appData.live}
              config={appData.config}
              deviceState={deviceState}
            />
          </section>
        )}

        {/* Tombol Kalibrasi Sensor Ketinggian */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Kalibrasi Sensor Ketinggian
              </h4>
              <p className="text-xs text-slate-500">
                Kirim perintah <code>/config/calibrate = true</code> ke sensor di lapangan untuk penyesuaian titik nol.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCalibrationStatus('idle');
              setCalibrationMsg('');
              setIsCalibrationModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          >
            Kalibrasi Sensor
          </button>
        </section>
      </main>

      {/* Modal Kalibrasi */}
      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        onConfirm={handleTriggerCalibration}
        status={calibrationStatus}
        statusMessage={calibrationMsg}
      />
    </div>
  );
}

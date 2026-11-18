import React, { useRef } from 'react';
import { Upload, Trash2, Check } from 'lucide-react';
import {
  AllAttachmentKey,
  LoanFormData,
  REQUIREMENT_DOCUMENTS,
  formatRupiah,
  getAttachmentByKey,
} from '../types/form';
import { SignaturePad } from './SignaturePad';

interface FormEditorProps {
  data: LoanFormData;
  onChange: <K extends keyof LoanFormData>(field: K, value: LoanFormData[K]) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ data, onChange }) => {
  const fileInputRefs = useRef<Partial<Record<AllAttachmentKey, HTMLInputElement | null>>>({});

  const handleLoanInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    onChange('jumlahPinjaman', digits);
  };

  const handleAttachmentUpload = (
    key: AllAttachmentKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (key === 'fotoCopyKtp') {
          onChange('fotoCopyKtp', reader.result);
          onChange('fotoCopyKtpNama', file.name);
        } else {
          onChange('lampiranTambahan', {
            ...data.lampiranTambahan,
            [key]: { dataUrl: reader.result, fileName: file.name },
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAttachmentRemove = (key: AllAttachmentKey) => {
    if (key === 'fotoCopyKtp') {
      onChange('fotoCopyKtp', null);
      onChange('fotoCopyKtpNama', '');
    } else {
      onChange('lampiranTambahan', {
        ...data.lampiranTambahan,
        [key]: null,
      });
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15 transition-colors';

  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';

  return (
    <div className="space-y-8 pb-10">
      {/* Section 01: Identitas Pemohon */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">01. Data Identitas Pemohon</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuai urutan parameter 1 sampai 6 pada formulir resmi KOPKARTRANS.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div id="field-namaLengkap">
            <label htmlFor="input-namaLengkap" className={labelClass}>
              1. Nama Lengkap
            </label>
            <input
              id="input-namaLengkap"
              type="text"
              value={data.namaLengkap}
              onChange={(e) => onChange('namaLengkap', e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-noNikPegawai">
              <label htmlFor="input-noNikPegawai" className={labelClass}>
                2. No. NIK Pegawai
              </label>
              <input
                id="input-noNikPegawai"
                type="text"
                value={data.noNikPegawai}
                onChange={(e) => onChange('noNikPegawai', e.target.value)}
                placeholder="Nomor Induk Karyawan"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div id="field-noKtp">
              <label htmlFor="input-noKtp" className={labelClass}>
                3. No. KTP
              </label>
              <input
                id="input-noKtp"
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={data.noKtp}
                onChange={(e) => onChange('noKtp', e.target.value.replace(/\D/g, ''))}
                placeholder="16 digit NIK KTP"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-departement">
              <label htmlFor="input-departement" className={labelClass}>
                4. Departement
              </label>
              <input
                id="input-departement"
                type="text"
                value={data.departement}
                onChange={(e) => onChange('departement', e.target.value)}
                placeholder="Contoh: Operasional"
                className={inputClass}
              />
            </div>

            <div id="field-jabatan">
              <label htmlFor="input-jabatan" className={labelClass}>
                5. Jabatan
              </label>
              <input
                id="input-jabatan"
                type="text"
                value={data.jabatan}
                onChange={(e) => onChange('jabatan', e.target.value)}
                placeholder="Contoh: Staf Evaluasi"
                className={inputClass}
              />
            </div>
          </div>

          <div id="field-masaKerja">
            <label htmlFor="input-masaKerja" className={labelClass}>
              6. Masa Kerja
            </label>
            <input
              id="input-masaKerja"
              type="text"
              value={data.masaKerja}
              onChange={(e) => onChange('masaKerja', e.target.value)}
              placeholder="Contoh: 4 Tahun 3 Bulan"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Section 02: Status Kepegawaian */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">02. Status Kepegawaian</h2>
        </div>

        <div id="field-status" className="space-y-3">
          <span className={labelClass}>7. STATUS</span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onChange('status', 'TETAP')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                data.status === 'TETAP'
                  ? 'border-blue-800 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {data.status === 'TETAP' && <Check className="w-4 h-4" />}
              TETAP
            </button>

            <button
              type="button"
              onClick={() => onChange('status', 'KONTRAK')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                data.status === 'KONTRAK'
                  ? 'border-blue-800 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {data.status === 'KONTRAK' && <Check className="w-4 h-4" />}
              KONTRAK
            </button>
          </div>

          {data.status === 'KONTRAK' && (
            <div id="field-kontrakBerakhir" className="pt-1">
              <label htmlFor="input-kontrakBerakhir" className={labelClass}>
                Berakhir (Tanggal Selesai Kontrak)
              </label>
              <input
                id="input-kontrakBerakhir"
                type="text"
                value={data.kontrakBerakhir}
                onChange={(e) => onChange('kontrakBerakhir', e.target.value)}
                placeholder="Contoh: 31 Desember 2027"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </section>

      {/* Section 03: Kontak & Alamat */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">03. Kontak & Alamat</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-noTeleponHp">
              <label htmlFor="input-noTeleponHp" className={labelClass}>
                8. No. Telepon/HP
              </label>
              <input
                id="input-noTeleponHp"
                type="tel"
                value={data.noTeleponHp}
                onChange={(e) => onChange('noTeleponHp', e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div id="field-email">
              <label htmlFor="input-email" className={labelClass}>
                10. Email (@)
              </label>
              <input
                id="input-email"
                type="email"
                value={data.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="nama@transjakarta.co.id"
                className={inputClass}
              />
            </div>
          </div>

          <div id="field-alamatLengkapBaris1">
            <label htmlFor="input-alamat1" className={labelClass}>
              9. Alamat lengkap (Baris 1)
            </label>
            <input
              id="input-alamat1"
              type="text"
              value={data.alamatLengkapBaris1}
              onChange={(e) => onChange('alamatLengkapBaris1', e.target.value)}
              placeholder="Jalan, Nomor Rumah, RT/RW"
              className={inputClass}
            />
          </div>

          <div id="field-alamatLengkapBaris2">
            <label htmlFor="input-alamat2" className={labelClass}>
              Alamat lengkap (Baris 2 — Kelurahan / Kecamatan / Kota)
            </label>
            <input
              id="input-alamat2"
              type="text"
              value={data.alamatLengkapBaris2}
              onChange={(e) => onChange('alamatLengkapBaris2', e.target.value)}
              placeholder="Kelurahan, Kecamatan, Kota, Kode Pos"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Section 04: Pinjaman & Pendebetan Bank DKI */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            04. Rincian Pinjaman & Rekening Bank DKI
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div id="field-jumlahPinjaman">
            <label htmlFor="input-jumlahPinjaman" className={labelClass}>
              11. Jumlah Pinjaman
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-500">
                Rp
              </span>
              <input
                id="input-jumlahPinjaman"
                type="text"
                inputMode="numeric"
                value={formatRupiah(data.jumlahPinjaman)}
                onChange={(e) => handleLoanInput(e.target.value)}
                placeholder="0"
                className={`${inputClass} pl-10 font-mono font-semibold tabular-nums`}
              />
            </div>
          </div>

          <div id="field-referensiPenjamin">
            <label htmlFor="input-referensiPenjamin" className={labelClass}>
              12. Referensi/Penjamin
            </label>
            <input
              id="input-referensiPenjamin"
              type="text"
              value={data.referensiPenjamin}
              onChange={(e) => onChange('referensiPenjamin', e.target.value)}
              placeholder="Nama lengkap referensi/penjamin"
              className={inputClass}
            />
          </div>

          <div id="field-noRekeningBankDki">
            <label htmlFor="input-noRekeningBankDki" className={labelClass}>
              No. Rekening Bank DKI (Pendebetan Gaji)
            </label>
            <input
              id="input-noRekeningBankDki"
              type="text"
              inputMode="numeric"
              value={data.noRekeningBankDki}
              onChange={(e) => onChange('noRekeningBankDki', e.target.value)}
              placeholder="Nomor rekening Bank DKI"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
        </div>
      </section>

      {/* Section 05: Persyaratan & Persetujuan Pernyataan */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            05. Persyaratan & Persetujuan Pernyataan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah seluruh dokumen persyaratan pendukung (JPG, PNG, atau WebP).
          </p>
        </div>

        <div className="space-y-2.5">
          {REQUIREMENT_DOCUMENTS.map((doc, idx) => {
            const attached = getAttachmentByKey(data, doc.key);
            return (
              <div
                key={doc.key}
                className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between gap-3"
              >
                <input
                  ref={(el) => {
                    fileInputRefs.current[doc.key] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleAttachmentUpload(doc.key, e)}
                  className="hidden"
                />

                <div className="flex items-center gap-3 min-w-0">
                  {attached ? (
                    <img
                      src={attached.dataUrl}
                      alt={`Pratinjau ${doc.label}`}
                      referrerPolicy="no-referrer"
                      className="w-12 h-9 rounded object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold tabular-nums shrink-0">
                      {idx + 1}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{doc.label}</p>
                    {attached ? (
                      <p className="text-xs text-emerald-700 truncate">
                        Terlampir · {attached.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 truncate">{doc.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[doc.key]?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {attached ? 'Ganti' : 'Unggah'}
                  </button>
                  {attached && (
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(doc.key)}
                      className="p-1.5 text-slate-400 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label={`Hapus ${doc.label}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agreement Checkboxes */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.setujuPernyataan}
              onChange={(e) => onChange('setujuPernyataan', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Saya telah membaca dan menyetujui seluruh 3 butir pernyataan pinjaman (biaya
              administrasi, denda 0,025% per hari, dan pemotongan pesangon/konpensasi apabila
              berhenti/diberhentikan).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.anggotaKoperasi}
              onChange={(e) => onChange('anggotaKoperasi', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Saya menyatakan bahwa saya sudah terdaftar sebagai{' '}
              <strong className="font-semibold text-slate-900">Anggota Koperasi</strong> (Note:
              Hanya berlaku untuk yang sudah Anggota Koperasi).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.setujuKelengkapanDokumen}
              onChange={(e) => onChange('setujuKelengkapanDokumen', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Saya menyatakan bahwa seluruh dokumen persyaratan yang dilampirkan (Foto Copy KTP, ID
              Card, NPWP, Kartu Keluarga, Foto Selfie dengan KTP, dan Slip Gaji) adalah asli,
              benar, dan milik saya pribadi.
            </span>
          </label>
        </div>
      </section>

      {/* Section 06: Tanggal & Tanda Tangan Digital */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            06. Tanggal & Tanda Tangan Digital
          </h2>
        </div>

        <div id="field-tanggalPengajuan">
          <label htmlFor="input-tanggalPengajuan" className={labelClass}>
            Tanggal Pengajuan (Jakarta, ...)
          </label>
          <input
            id="input-tanggalPengajuan"
            type="text"
            value={data.tanggalPengajuan}
            onChange={(e) => onChange('tanggalPengajuan', e.target.value)}
            placeholder="Contoh: 18 November 2026"
            className={inputClass}
          />
        </div>

        <div id="field-ttdPemohon">
          <SignaturePad
            label="Tanda Tangan Pemohon"
            value={data.ttdPemohon}
            onChange={(val) => onChange('ttdPemohon', val)}
          />
        </div>

        <div id="field-ttdPenjamin">
          <SignaturePad
            label="Tanda Tangan Referensi/Penjamin"
            value={data.ttdPenjamin}
            onChange={(val) => onChange('ttdPenjamin', val)}
          />
        </div>
      </section>
    </div>
  );
};

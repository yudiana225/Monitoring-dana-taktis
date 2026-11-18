import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ArrowLeft,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  LoanFormData,
  REQUIREMENT_DOCUMENTS,
  SubmittedApplication,
  formatRupiah,
  getAttachmentByKey,
  getAttachmentStats,
  getCompletionStats,
  generateRegistrationNumber,
} from '../types/form';
import { KopkartransLogo } from './KopkartransLogo';
import { FormEditor } from './FormEditor';
import { OfficialDocumentA4 } from './OfficialDocumentA4';

interface SubmissionPortalProps {
  data: LoanFormData;
  onChange: <K extends keyof LoanFormData>(field: K, value: LoanFormData[K]) => void;
  onSubmitSuccess: (submission: SubmittedApplication) => void;
  onResetForNew: () => void;
  onExitPortal: () => void;
  onPrint: () => void;
}

export const SubmissionPortal: React.FC<SubmissionPortalProps> = ({
  data,
  onChange,
  onSubmitSuccess,
  onResetForNew,
  onExitPortal,
  onPrint,
}) => {
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedApplication | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const stats = getCompletionStats(data);
  const isComplete = stats.missingFields.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setShowValidationError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const record: SubmittedApplication = {
      id: `${Date.now()}`,
      registrationNumber: generateRegistrationNumber(),
      submittedAt: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      data: { ...data },
    };

    setSubmittedRecord(record);
    setShowValidationError(false);
    onSubmitSuccess(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopySummary = async () => {
    if (!submittedRecord) return;
    const d = submittedRecord.data;
    const text = [
      `PENGAJUAN PINJAMAN DANA DARURAT KOPKARTRANS`,
      `No. Registrasi: ${submittedRecord.registrationNumber}`,
      `Tanggal: ${submittedRecord.submittedAt}`,
      `---`,
      `1. Nama Lengkap: ${d.namaLengkap}`,
      `2. No. NIK Pegawai: ${d.noNikPegawai}`,
      `3. No. KTP: ${d.noKtp}`,
      `4. Departement: ${d.departement}`,
      `5. Jabatan: ${d.jabatan}`,
      `6. Masa Kerja: ${d.masaKerja}`,
      `7. STATUS: ${d.status}${d.status === 'KONTRAK' && d.kontrakBerakhir ? ` (Berakhir: ${d.kontrakBerakhir})` : ''}`,
      `8. No. Telepon/HP: ${d.noTeleponHp}`,
      `9. Alamat lengkap: ${[d.alamatLengkapBaris1, d.alamatLengkapBaris2].filter(Boolean).join(', ')}`,
      `10. Email (@): ${d.email}`,
      `11. Jumlah Pinjaman: Rp ${formatRupiah(d.jumlahPinjaman)},-`,
      `12. Referensi/Penjamin: ${d.referensiPenjamin}`,
      `No. Rekening Bank DKI: ${d.noRekeningBankDki}`,
      `---`,
      `Lampiran Persyaratan:`,
      ...REQUIREMENT_DOCUMENTS.map(
        (doc, idx) =>
          `${idx + 1}. ${doc.label}: ${getAttachmentByKey(d, doc.key) ? 'Terlampir' : 'Belum diunggah'}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // fallback ignored
    }
  };

  if (submittedRecord) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4 border-b border-slate-200 pb-6">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Pengajuan Pinjaman Dana Darurat Siap Diproses
                </h1>
                <p className="text-sm text-slate-600">
                  Formulir Anda telah tercatat lengkap sesuai ketentuan Koperasi Konsumen Karyawan
                  PT Transportasi Jakarta.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    No. Registrasi: {submittedRecord.registrationNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{submittedRecord.submittedAt}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Pemohon</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {submittedRecord.data.namaLengkap}
                </p>
                <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                  NIK: {submittedRecord.data.noNikPegawai}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jumlah Pinjaman</p>
                <p className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                  Rp {formatRupiah(submittedRecord.data.jumlahPinjaman)},-
                </p>
                <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                  Bank DKI: {submittedRecord.data.noRekeningBankDki}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan Formulir A4 (PDF)
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Ringkasan Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin Ringkasan Pengajuan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowFullPreview((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {showFullPreview ? 'Sembunyikan Dokumen A4' : 'Lihat Dokumen A4'}
              </button>
            </div>
          </div>

          {showFullPreview && (
            <div className="overflow-x-auto pb-4">
              <OfficialDocumentA4 data={submittedRecord.data} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <button
              type="button"
              onClick={() => {
                setSubmittedRecord(null);
                onResetForNew();
              }}
              className="font-medium text-blue-900 hover:underline cursor-pointer"
            >
              Buat Pengajuan Baru
            </button>
            <button
              type="button"
              onClick={onExitPortal}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Kembali ke Workspace Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Clean Institutional Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between gap-6">
        <span className="text-base font-bold tracking-tight text-blue-950 whitespace-nowrap shrink-0">
          KOPKARTRANS
        </span>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
          <span>Portal Pengajuan Pinjaman Dana Darurat</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums font-medium text-slate-900">
            {stats.filled}/{stats.total} terisi
          </span>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Cetak A4
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Official Letterhead Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-200 pb-5">
            <KopkartransLogo className="w-16 h-16 shrink-0" />
            <div className="text-center sm:text-left">
              <h1 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                KOPERASI KONSUMEN KARYAWAN PT TRANSPORTASI JAKARTA
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Representatif Office : Jl.Mayjen Sutoyo No.1, Cawang , Jakarta Timur ·
                PT.Transportasi Jakarta Head Office
              </p>
              <p className="text-xs font-semibold text-blue-900 mt-1.5">
                FORMULIR PINJAMAN — DANA DARURAT KOPERASI TRANSPORTASI JAKARTA
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <span>
              <strong>Note:</strong> Hanya berlaku untuk yang sudah Anggota Koperasi
            </span>
            <span className="tabular-nums">
              Lampiran Persyaratan: {getAttachmentStats(data).uploaded}/
              {getAttachmentStats(data).total} terunggah
            </span>
          </div>
        </div>

        {/* Validation Alert if submitted incomplete */}
        {showValidationError && !isComplete && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 space-y-1">
              <p className="font-semibold">
                Mohon lengkapi {stats.missingFields.length} parameter berikut sebelum mengirim
                pengajuan:
              </p>
              <p className="leading-relaxed">{stats.missingFields.join(', ')}.</p>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <FormEditor data={data} onChange={onChange} />

            {/* Verbatim Declaration Summary Box */}
            <div className="mt-2 pt-6 border-t border-slate-200 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 text-xs text-slate-800 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Ketentuan & Pernyataan Resmi (Sesuai Formulir):
                </p>
                <p>
                  Adapun pembayarannya saya bersedia dipotong dari gaji saya melalui pendebetan
                  Rekening Bank DKI No{' '}
                  <strong className="font-mono tabular-nums">
                    {data.noRekeningBankDki || '........................'}
                  </strong>
                </p>
                <p className="font-semibold">Dengan ini saya menyatakan bahwa :</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>
                    Saya bersedia membayar pinjaman tersebut sekaligus ditambah biaya
                    Administrasinya
                  </li>
                  <li>
                    Apabila saya lalai/tidak membayar cicilan tersebut maka saya bersedia dikenakan
                    denda oleh koperasi 0,025% per hari dari hutang saya
                  </li>
                  <li>
                    Apabila satu dan lain hal sehingga saya berhenti atau diberhentikan oleh PT.
                    Transportasi Jakarta maka saya bersedia hak-hak saya berupa
                    pesangon/konpensasi dipotong oleh koperasi melalui PT. Transportasi Jakarta
                    sejumlah sisa hutang saya.
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-600 tabular-nums">
                  Kelengkapan formulir: <strong>{stats.filled}/{stats.total}</strong> parameter wajib
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Kirim Pengajuan Pinjaman
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Quiet Footer */}
        <footer className="mt-8 pb-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Koperasi Konsumen Karyawan PT Transportasi Jakarta (KOPKARTRANS)</span>
          <button
            type="button"
            onClick={onExitPortal}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Buka Mode Editor & Pratinjau A4
          </button>
        </footer>
      </main>
    </div>
  );
};

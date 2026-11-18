import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Save,
  FolderOpen,
  RotateCcw,
  Upload,
  Trash2,
  X,
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';
import {
  AllAttachmentKey,
  INITIAL_FORM_DATA,
  LoanFormData,
  REQUIREMENT_DOCUMENTS,
  SavedDraft,
  SubmittedApplication,
  formatIndonesianDate,
  formatRupiah,
  getAttachmentByKey,
  getAttachmentStats,
  getCompletionStats,
  normalizeFormData,
} from './types/form';
import { FormEditor } from './components/FormEditor';
import { OfficialDocumentA4 } from './components/OfficialDocumentA4';
import { SubmissionPortal } from './components/SubmissionPortal';
import { ShareLinkModal } from './components/ShareLinkModal';

type ActiveView = 'editor' | 'preview' | 'ktp' | 'original';

const STORAGE_CURRENT_KEY = 'kopkartrans_dana_darurat_current_v1';
const STORAGE_DRAFTS_KEY = 'kopkartrans_dana_darurat_drafts_v1';
const STORAGE_SUBMISSIONS_KEY = 'kopkartrans_dana_darurat_submissions_v1';

function isSubmissionLinkLocation(): boolean {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('mode') === 'pengajuan' ||
    window.location.pathname.replace(/\/+$/, '').endsWith('/pengajuan')
  );
}

const SAMPLE_FORM_DATA: LoanFormData = {
  ...INITIAL_FORM_DATA,
  namaLengkap: 'Ahmad Fauzi Pratama',
  noNikPegawai: 'TJ-2019-04821',
  noKtp: '3175041205920004',
  departement: 'Operasional & Evaluasi Layanan',
  jabatan: 'Analis Evaluasi Operasi',
  masaKerja: '7 Tahun 4 Bulan',
  status: 'TETAP',
  kontrakBerakhir: '',
  noTeleponHp: '0812-8841-2905',
  alamatLengkapBaris1: 'Jl. Dewi Sartika No. 42, RT 004/RW 007',
  alamatLengkapBaris2: 'Kel. Cawang, Kec. Kramat Jati, Jakarta Timur 13630',
  email: 'ahmad.fauzi@transjakarta.co.id',
  jumlahPinjaman: '5000000',
  referensiPenjamin: 'Hendra Wijaya',
  noRekeningBankDki: '101230498761',
  tanggalPengajuan: formatIndonesianDate(new Date()),
  setujuPernyataan: true,
  anggotaKoperasi: true,
  setujuKelengkapanDokumen: true,
};

export default function App() {
  const [isSubmissionMode, setIsSubmissionMode] = useState<boolean>(() =>
    isSubmissionLinkLocation()
  );
  const [activeView, setActiveView] = useState<ActiveView>('editor');
  const [formData, setFormData] = useState<LoanFormData>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlDept = urlParams.get('dept');
    const urlPenjamin = urlParams.get('penjamin');

    let base: LoanFormData = INITIAL_FORM_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_KEY);
      if (saved) {
        base = normalizeFormData(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }

    if (urlDept || urlPenjamin) {
      return {
        ...base,
        ...(urlDept ? { departement: urlDept } : {}),
        ...(urlPenjamin ? { referensiPenjamin: urlPenjamin } : {}),
      };
    }

    return base;
  });

  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [submissions, setSubmissions] = useState<SubmittedApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'drafts' | 'submissions'>('drafts');
  const [showShareModal, setShowShareModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<number>(0.78);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const attachmentInputRefs = useRef<Partial<Record<AllAttachmentKey, HTMLInputElement | null>>>({});

  useEffect(() => {
    const handlePopState = () => {
      setIsSubmissionMode(isSubmissionLinkLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch {
      // ignore quota errors
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(formData));
    } catch {
      // ignore quota errors
    }
  }, [formData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
    } catch {
      // ignore quota errors
    }
  }, [drafts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const handleFieldChange = <K extends keyof LoanFormData>(field: K, value: LoanFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (confirmReset) setConfirmReset(false);
  };

  const handlePreviewFieldClick = (fieldId: string) => {
    const container = document.getElementById(fieldId);
    if (!container) return;
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = container.querySelector('input, button') as HTMLElement | null;
    if (input) {
      window.setTimeout(() => input.focus(), 250);
    }
  };

  const handleSaveDraft = () => {
    const label = formData.namaLengkap.trim() || 'Draf Tanpa Nama';
    const newDraft: SavedDraft = {
      id: `${Date.now()}`,
      savedAt: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      label,
      data: formData,
    };
    setDrafts((prev) => [newDraft, ...prev].slice(0, 20));
    showToast(`Draf "${label}" tersimpan.`);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setFormData(normalizeFormData(draft.data));
    setShowDraftsDrawer(false);
    setActiveView('editor');
    showToast(`Draf "${draft.label}" dimuat.`);
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setFormData(
      normalizeFormData({
        tanggalPengajuan: formatIndonesianDate(new Date()),
      })
    );
    setConfirmReset(false);
    showToast('Formulir dikosongkan.');
  };

  const handleFillSample = () => {
    setFormData((prev) => ({
      ...SAMPLE_FORM_DATA,
      fotoCopyKtp: prev.fotoCopyKtp,
      fotoCopyKtpNama: prev.fotoCopyKtpNama,
      lampiranTambahan: prev.lampiranTambahan,
      ttdPemohon: prev.ttdPemohon,
      ttdPenjamin: prev.ttdPenjamin,
    }));
    showToast('Contoh pengisian diterapkan.');
  };

  const handleAttachmentUpload = (
    key: AllAttachmentKey,
    label: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (key === 'fotoCopyKtp') {
          handleFieldChange('fotoCopyKtp', reader.result);
          handleFieldChange('fotoCopyKtpNama', file.name);
        } else {
          handleFieldChange('lampiranTambahan', {
            ...formData.lampiranTambahan,
            [key]: { dataUrl: reader.result, fileName: file.name },
          });
        }
        showToast(`Lampiran ${label} berhasil diunggah.`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAttachmentRemove = (key: AllAttachmentKey) => {
    if (key === 'fotoCopyKtp') {
      handleFieldChange('fotoCopyKtp', null);
      handleFieldChange('fotoCopyKtpNama', '');
    } else {
      handleFieldChange('lampiranTambahan', {
        ...formData.lampiranTambahan,
        [key]: null,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const enterSubmissionMode = (params?: { dept?: string; penjamin?: string }) => {
    const search = new URLSearchParams();
    search.set('mode', 'pengajuan');
    if (params?.dept) search.set('dept', params.dept);
    if (params?.penjamin) search.set('penjamin', params.penjamin);

    const newUrl = `${window.location.pathname}?${search.toString()}`;
    window.history.pushState({}, '', newUrl);

    if (params?.dept || params?.penjamin) {
      setFormData((prev) => ({
        ...prev,
        ...(params.dept ? { departement: params.dept } : {}),
        ...(params.penjamin ? { referensiPenjamin: params.penjamin } : {}),
      }));
    }
    setIsSubmissionMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitSubmissionMode = () => {
    const cleanPath = window.location.pathname.replace(/\/pengajuan\/?$/, '') || '/';
    window.history.pushState({}, '', cleanPath);
    setIsSubmissionMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmissionRecorded = (record: SubmittedApplication) => {
    setSubmissions((prev) => [record, ...prev].slice(0, 50));
  };

  const handleLoadSubmission = (record: SubmittedApplication) => {
    setFormData(normalizeFormData(record.data));
    setShowDraftsDrawer(false);
    setActiveView('editor');
    showToast(`Pengajuan ${record.registrationNumber} dimuat.`);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  const stats = getCompletionStats(formData);
  const attachmentStats = getAttachmentStats(formData);
  const isComplete = stats.missingFields.length === 0;

  if (isSubmissionMode) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="no-print">
          <SubmissionPortal
            data={formData}
            onChange={handleFieldChange}
            onSubmitSuccess={handleSubmissionRecorded}
            onResetForNew={() =>
              setFormData({
                ...INITIAL_FORM_DATA,
                tanggalPengajuan: formatIndonesianDate(new Date()),
              })
            }
            onExitPortal={exitSubmissionMode}
            onPrint={handlePrint}
          />
        </div>
        <div className="hidden print:block">
          <OfficialDocumentA4 data={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* ON-SCREEN WORKSPACE (HIDDEN WHEN PRINTING) */}
      <div className="no-print min-h-screen flex flex-col">
        {/* TOP BAR CONTRACT: 3 ZONES, SINGLE ROW */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="text-base font-bold tracking-tight text-blue-950 whitespace-nowrap shrink-0 cursor-pointer"
          >
            KOPKARTRANS
          </button>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {(
              [
                { id: 'editor', label: 'Isi Formulir' },
                { id: 'preview', label: 'Pratinjau A4' },
                { id: 'ktp', label: 'Lampiran' },
                { id: 'original', label: 'Dokumen Asli' },
              ] as const
            ).map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-blue-800 text-blue-950 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
          </div>
        </header>

        {/* MOBILE NAV ROW */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {(
            [
              { id: 'editor', label: 'Isi Formulir' },
              { id: 'preview', label: 'Pratinjau A4' },
              { id: 'ktp', label: 'Lampiran' },
              { id: 'original', label: 'Dokumen Asli' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeView === item.id
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* WORKSPACE CONTEXT TOOLBAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">
              Formulir Pinjaman Dana Darurat
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums inline-flex items-center gap-1.5">
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              {stats.filled}/{stats.total} parameter terisi
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Lampiran: {attachmentStats.uploaded}/{attachmentStats.total} terunggah
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              Link Pengajuan
            </button>
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              Isi Contoh
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              Simpan Draf
            </button>
            <button
              type="button"
              onClick={() => setShowDraftsDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              Arsip ({drafts.length + submissions.length})
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                confirmReset
                  ? 'bg-red-700 text-white border-red-700 hover:bg-red-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:text-red-700 hover:border-red-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {confirmReset ? 'Konfirmasi Kosongkan' : 'Kosongkan'}
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg">
            {toastMessage}
          </div>
        )}

        {/* MAIN VIEWPORT */}
        <main className="flex-1 flex flex-col">
          {/* VIEW 1: SPLIT FORM EDITOR + LIVE A4 PREVIEW */}
          {activeView === 'editor' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr]">
              {/* Left Panel: Structured Digital Form */}
              <aside className="bg-slate-50 border-r border-slate-200 px-6 py-6 lg:h-[calc(100vh-112px)] lg:overflow-y-auto">
                <div className="mb-6">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Pengisian Formulir Digital
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Seluruh isi dan ketentuan resmi pada formulir Koperasi Konsumen Karyawan PT
                    Transportasi Jakarta dipertahankan secara utuh. Klik langsung pada dokumen A4
                    di sebelah kanan untuk menuju kolom terkait.
                  </p>
                </div>

                <FormEditor data={formData} onChange={handleFieldChange} />
              </aside>

              {/* Right Panel: Live A4 Document Canvas */}
              <section className="bg-slate-200/75 lg:h-[calc(100vh-112px)] lg:overflow-y-auto flex flex-col">
                <div className="sticky top-0 z-10 bg-slate-200/90 backdrop-blur-xs border-b border-slate-300/80 px-6 py-2.5 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-700 font-medium">
                    Pratinjau Langsung Dokumen Resmi (A4 · 210 × 297 mm)
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-md border border-slate-300/70">
                    {[
                      { label: '70%', value: 0.7 },
                      { label: '80%', value: 0.78 },
                      { label: '90%', value: 0.9 },
                      { label: '100%', value: 1 },
                    ].map((z) => (
                      <button
                        key={z.label}
                        type="button"
                        onClick={() => setPreviewZoom(z.value)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors tabular-nums cursor-pointer ${
                          previewZoom === z.value
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto p-6 flex justify-center items-start">
                  <div
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: 'top center',
                      marginBottom: `calc((${previewZoom} - 1) * 297mm)`,
                    }}
                  >
                    <OfficialDocumentA4
                      data={formData}
                      interactive
                      onFieldClick={handlePreviewFieldClick}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* VIEW 2: FULL A4 PRINT PREVIEW */}
          {activeView === 'preview' && (
            <div className="flex-1 bg-slate-200/80 py-8 px-4 overflow-x-auto">
              <div className="max-w-[210mm] mx-auto mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    Pratinjau Cetak Ukuran Penuh (A4)
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pilih ukuran kertas A4 pada dialog cetak browser untuk menyimpan sebagai PDF
                    resmi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / Simpan PDF
                </button>
              </div>

              <OfficialDocumentA4 data={formData} />
            </div>
          )}

          {/* VIEW 3: LAMPIRAN PERSYARATAN LENGKAP */}
          {activeView === 'ktp' && (
            <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Lampiran Dokumen Persyaratan ({attachmentStats.uploaded}/
                    {attachmentStats.total})
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Unggah seluruh dokumen persyaratan pinjaman. Semua berkas yang diunggah akan
                    otomatis disusun rapi sebagai halaman lampiran saat mencetak PDF A4.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3.5 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cetakLampiranKtp}
                    onChange={(e) => handleFieldChange('cetakLampiranKtp', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                  />
                  Sertakan semua lampiran saat cetak PDF
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {REQUIREMENT_DOCUMENTS.map((doc, idx) => {
                  const attached = getAttachmentByKey(formData, doc.key);
                  return (
                    <div
                      key={doc.key}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                    >
                      <input
                        ref={(el) => {
                          attachmentInputRefs.current[doc.key] = el;
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleAttachmentUpload(doc.key, doc.label, e)}
                        className="hidden"
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            {idx + 1}. {doc.label}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                        </div>
                        <span
                          className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                            attached ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {attached ? 'Terlampir' : 'Belum diunggah'}
                        </span>
                      </div>

                      {attached ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center h-44">
                          <img
                            src={attached.dataUrl}
                            alt={`Lampiran ${doc.label}`}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => attachmentInputRefs.current[doc.key]?.click()}
                          className="h-44 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <FileText className="w-6 h-6" />
                          <span className="text-xs font-medium">Klik untuk unggah {doc.label}</span>
                        </button>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-500 truncate">
                          {attached ? attached.fileName : 'Format JPG, PNG, WebP'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => attachmentInputRefs.current[doc.key]?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {attached ? 'Ganti' : 'Unggah'}
                          </button>
                          {attached && (
                            <button
                              type="button"
                              onClick={() => handleAttachmentRemove(doc.key)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                              aria-label={`Hapus ${doc.label}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: DOKUMEN PDF ASLI */}
          {activeView === 'original' && (
            <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 flex flex-col">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    Dokumen Referensi Asli (PDF)
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    File sumber asli yang digunakan sebagai acuan parameter dan isi formulir
                    digital ini.
                  </p>
                </div>
                <a
                  href="/assets/aistudio/Form_dana_taktis_778cf5dc.pdf"
                  download="Form_Dana_Darurat_KOPKARTRANS.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh PDF Asli
                </a>
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[75vh]">
                <iframe
                  src="/assets/aistudio/Form_dana_taktis_778cf5dc.pdf"
                  title="Formulir Pinjaman Dana Darurat PDF Asli"
                  className="w-full h-[78vh] border-0"
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SAVED DRAFTS & SUBMISSIONS SLIDE-OVER DRAWER (NO-PRINT) */}
      {showDraftsDrawer && (
        <div className="no-print fixed inset-0 z-50 flex justify-end bg-slate-950/35">
          <div className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Arsip Formulir</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tersimpan secara lokal pada perangkat ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsDrawer(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup daftar arsip"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pt-3 pb-2 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDrawerTab('drafts')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors tabular-nums cursor-pointer ${
                    drawerTab === 'drafts'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Draf ({drafts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('submissions')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors tabular-nums cursor-pointer ${
                    drawerTab === 'submissions'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengajuan ({submissions.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {drawerTab === 'drafts' ? (
                drafts.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-sm font-medium text-slate-700">Belum ada draf tersimpan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Klik tombol Simpan Draf di toolbar untuk menyimpan pengisian formulir.
                    </p>
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border border-slate-200 rounded-lg p-4 bg-white space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {draft.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                            {draft.savedAt}
                            {draft.data.jumlahPinjaman
                              ? ` · Rp ${formatRupiah(draft.data.jumlahPinjaman)}`
                              : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-1.5 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Hapus draf ${draft.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLoadDraft(draft)}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                      >
                        Muat ke Formulir
                      </button>
                    </div>
                  ))
                )
              ) : submissions.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-sm font-medium text-slate-700">Belum ada pengajuan tercatat</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengajuan yang dikirim melalui Link Khusus Pengajuan akan muncul di sini.
                  </p>
                </div>
              ) : (
                submissions.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-4 bg-white space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-blue-900 tabular-nums">
                          {item.registrationNumber}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                          {item.data.namaLengkap || 'Tanpa Nama'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                          {item.submittedAt}
                          {item.data.jumlahPinjaman
                            ? ` · Rp ${formatRupiah(item.data.jumlahPinjaman)}`
                            : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubmission(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label={`Hapus pengajuan ${item.registrationNumber}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadSubmission(item)}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                    >
                      Buka & Cetak A4
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE DEDICATED SUBMISSION LINK MODAL */}
      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onOpenSubmissionMode={enterSubmissionMode}
      />

      {/* DEDICATED UNSCALED PRINT TARGET */}
      <div className="hidden print:block">
        <OfficialDocumentA4 data={formData} />
      </div>
    </div>
  );
}

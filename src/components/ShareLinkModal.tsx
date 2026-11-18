import React, { useState, useMemo } from 'react';
import { X, Copy, Check, ExternalLink, Link2 } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmissionMode: (params: { dept?: string; penjamin?: string }) => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  onOpenSubmissionMode,
}) => {
  const [prefillDept, setPrefillDept] = useState('');
  const [prefillPenjamin, setPrefillPenjamin] = useState('');
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('mode', 'pengajuan');
    if (prefillDept.trim()) params.set('dept', prefillDept.trim());
    if (prefillPenjamin.trim()) params.set('penjamin', prefillPenjamin.trim());
    return `${base}?${params.toString()}`;
  }, [prefillDept, prefillPenjamin]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-link-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-4 h-4 text-blue-900 shrink-0" />
            <h2 id="share-link-title" className="text-sm font-bold text-slate-900">
              Link Khusus Pengajuan Pinjaman
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bagikan tautan khusus ini kepada anggota koperasi agar langsung membuka halaman
            pengisian pengajuan yang bersih dan fokus, lengkap dengan cetak formulir A4 resmi.
          </p>

          {/* Generated URL box */}
          <div className="space-y-2">
            <label htmlFor="generated-submission-url" className="block text-xs font-semibold text-slate-700">
              Tautan Pengajuan
            </label>
            <div className="flex items-center gap-2">
              <input
                id="generated-submission-url"
                type="text"
                readOnly
                value={generatedUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-700"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Pre-fill Parameters */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Parameter Otomatis (Opsional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="prefill-dept" className="block text-xs text-slate-600 mb-1">
                  Departement
                </label>
                <input
                  id="prefill-dept"
                  type="text"
                  value={prefillDept}
                  onChange={(e) => setPrefillDept(e.target.value)}
                  placeholder="Contoh: Operasional"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="prefill-penjamin" className="block text-xs text-slate-600 mb-1">
                  Referensi/Penjamin
                </label>
                <input
                  id="prefill-penjamin"
                  type="text"
                  value={prefillPenjamin}
                  onChange={(e) => setPrefillPenjamin(e.target.value)}
                  placeholder="Nama penjamin"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubmissionMode({
                  dept: prefillDept.trim() || undefined,
                  penjamin: prefillPenjamin.trim() || undefined,
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Halaman Pengajuan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

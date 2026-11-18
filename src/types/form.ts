export type EmploymentStatus = 'TETAP' | 'KONTRAK' | '';

export interface DocumentAttachment {
  dataUrl: string;
  fileName: string;
}

export type ExtraAttachmentKey =
  | 'idCard'
  | 'npwp'
  | 'kartuKeluarga'
  | 'selfieKtp'
  | 'slipGaji';

export type AllAttachmentKey = 'fotoCopyKtp' | ExtraAttachmentKey;

export interface RequirementDocMeta {
  key: AllAttachmentKey;
  label: string;
  description: string;
}

export const REQUIREMENT_DOCUMENTS: RequirementDocMeta[] = [
  {
    key: 'fotoCopyKtp',
    label: 'Foto Copy KTP',
    description: 'Foto atau pindai KTP pemohon yang masih berlaku.',
  },
  {
    key: 'idCard',
    label: 'ID Card',
    description: 'Kartu tanda pengenal karyawan PT Transportasi Jakarta.',
  },
  {
    key: 'npwp',
    label: 'NPWP',
    description: 'Nomor Pokok Wajib Pajak milik pemohon.',
  },
  {
    key: 'kartuKeluarga',
    label: 'Kartu Keluarga',
    description: 'Foto atau pindai Kartu Keluarga (KK) terbaru.',
  },
  {
    key: 'selfieKtp',
    label: 'Foto Selfie dengan KTP',
    description: 'Swafoto pemohon sambil memegang KTP asli secara jelas.',
  },
  {
    key: 'slipGaji',
    label: 'Slip Gaji',
    description: 'Slip gaji bulan terakhir pemohon.',
  },
];

export interface LoanFormData {
  namaLengkap: string;
  noNikPegawai: string;
  noKtp: string;
  departement: string;
  jabatan: string;
  masaKerja: string;
  status: EmploymentStatus;
  kontrakBerakhir: string;
  noTeleponHp: string;
  alamatLengkapBaris1: string;
  alamatLengkapBaris2: string;
  email: string;
  jumlahPinjaman: string; // raw digits string
  referensiPenjamin: string;
  noRekeningBankDki: string;
  tanggalPengajuan: string;
  setujuPernyataan: boolean;
  anggotaKoperasi: boolean;
  setujuKelengkapanDokumen: boolean;
  ttdPemohon: string | null; // data URL
  ttdPenjamin: string | null; // data URL
  fotoCopyKtp: string | null; // data URL (kept for backward compatibility)
  fotoCopyKtpNama: string;
  lampiranTambahan: Record<ExtraAttachmentKey, DocumentAttachment | null>;
  cetakLampiranKtp: boolean;
}

export interface SavedDraft {
  id: string;
  savedAt: string;
  label: string;
  data: LoanFormData;
}

export interface SubmittedApplication {
  id: string;
  registrationNumber: string;
  submittedAt: string;
  data: LoanFormData;
}

export function generateRegistrationNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `KPK-${y}${m}${d}-${rand}`;
}

export const EMPTY_EXTRA_ATTACHMENTS: Record<ExtraAttachmentKey, DocumentAttachment | null> = {
  idCard: null,
  npwp: null,
  kartuKeluarga: null,
  selfieKtp: null,
  slipGaji: null,
};

export const INITIAL_FORM_DATA: LoanFormData = {
  namaLengkap: '',
  noNikPegawai: '',
  noKtp: '',
  departement: '',
  jabatan: '',
  masaKerja: '',
  status: '',
  kontrakBerakhir: '',
  noTeleponHp: '',
  alamatLengkapBaris1: '',
  alamatLengkapBaris2: '',
  email: '',
  jumlahPinjaman: '',
  referensiPenjamin: '',
  noRekeningBankDki: '',
  tanggalPengajuan: formatIndonesianDate(new Date()),
  setujuPernyataan: false,
  anggotaKoperasi: false,
  setujuKelengkapanDokumen: false,
  ttdPemohon: null,
  ttdPenjamin: null,
  fotoCopyKtp: null,
  fotoCopyKtpNama: '',
  lampiranTambahan: { ...EMPTY_EXTRA_ATTACHMENTS },
  cetakLampiranKtp: true,
};

export function normalizeFormData(raw: Partial<LoanFormData> | null | undefined): LoanFormData {
  return {
    ...INITIAL_FORM_DATA,
    ...(raw || {}),
    lampiranTambahan: {
      ...EMPTY_EXTRA_ATTACHMENTS,
      ...(raw?.lampiranTambahan || {}),
    },
  };
}

export function getAttachmentByKey(
  data: LoanFormData,
  key: AllAttachmentKey
): DocumentAttachment | null {
  if (key === 'fotoCopyKtp') {
    return data.fotoCopyKtp
      ? { dataUrl: data.fotoCopyKtp, fileName: data.fotoCopyKtpNama || 'Foto Copy KTP' }
      : null;
  }
  return data.lampiranTambahan?.[key] || null;
}

export function getAttachmentStats(data: LoanFormData): {
  uploaded: number;
  total: number;
  uploadedItems: Array<RequirementDocMeta & { attachment: DocumentAttachment }>;
} {
  const uploadedItems: Array<RequirementDocMeta & { attachment: DocumentAttachment }> = [];
  for (const doc of REQUIREMENT_DOCUMENTS) {
    const attachment = getAttachmentByKey(data, doc.key);
    if (attachment) {
      uploadedItems.push({ ...doc, attachment });
    }
  }
  return {
    uploaded: uploadedItems.length,
    total: REQUIREMENT_DOCUMENTS.length,
    uploadedItems,
  };
}

export function formatIndonesianDate(date: Date): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRupiah(rawDigits: string): string {
  const cleaned = rawDigits.replace(/\D/g, '');
  if (!cleaned) return '';
  return Number(cleaned).toLocaleString('id-ID');
}

export function getCompletionStats(data: LoanFormData): {
  filled: number;
  total: number;
  missingFields: string[];
} {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: 'Nama Lengkap', ok: data.namaLengkap.trim().length > 0 },
    { label: 'No. NIK Pegawai', ok: data.noNikPegawai.trim().length > 0 },
    { label: 'No. KTP', ok: data.noKtp.trim().length > 0 },
    { label: 'Departement', ok: data.departement.trim().length > 0 },
    { label: 'Jabatan', ok: data.jabatan.trim().length > 0 },
    { label: 'Masa Kerja', ok: data.masaKerja.trim().length > 0 },
    {
      label: 'Status Kepegawaian',
      ok:
        data.status === 'TETAP' ||
        (data.status === 'KONTRAK' && data.kontrakBerakhir.trim().length > 0),
    },
    { label: 'No. Telepon/HP', ok: data.noTeleponHp.trim().length > 0 },
    {
      label: 'Alamat lengkap',
      ok:
        data.alamatLengkapBaris1.trim().length > 0 ||
        data.alamatLengkapBaris2.trim().length > 0,
    },
    { label: 'Email (@)', ok: data.email.trim().length > 0 },
    { label: 'Jumlah Pinjaman', ok: data.jumlahPinjaman.replace(/\D/g, '').length > 0 },
    { label: 'Referensi/Penjamin', ok: data.referensiPenjamin.trim().length > 0 },
    { label: 'No. Rekening Bank DKI', ok: data.noRekeningBankDki.trim().length > 0 },
    {
      label: 'Persetujuan Pernyataan & Kelengkapan Dokumen',
      ok: data.setujuPernyataan && data.anggotaKoperasi && data.setujuKelengkapanDokumen,
    },
  ];

  const missingFields = checks.filter((c) => !c.ok).map((c) => c.label);
  return {
    filled: checks.length - missingFields.length,
    total: checks.length,
    missingFields,
  };
}

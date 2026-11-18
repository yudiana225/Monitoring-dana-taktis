import React from 'react';
import {
  LoanFormData,
  REQUIREMENT_DOCUMENTS,
  formatRupiah,
  getAttachmentStats,
} from '../types/form';
import { KopkartransLogo } from './KopkartransLogo';

interface OfficialDocumentA4Props {
  data: LoanFormData;
  onFieldClick?: (fieldId: string) => void;
  interactive?: boolean;
}

export const OfficialDocumentA4: React.FC<OfficialDocumentA4Props> = ({
  data,
  onFieldClick,
  interactive = false,
}) => {
  const formattedLoan = formatRupiah(data.jumlahPinjaman);
  const { uploadedItems } = getAttachmentStats(data);

  // Chunk uploaded attachments into pairs (2 per A4 page) for crisp printing
  const attachmentPages: Array<typeof uploadedItems> = [];
  for (let i = 0; i < uploadedItems.length; i += 2) {
    attachmentPages.push(uploadedItems.slice(i, i + 2));
  }

  const clickableClass = interactive
    ? 'cursor-pointer hover:bg-blue-50/70 transition-colors rounded-xs'
    : '';

  const renderDottedValue = (value: string, fieldId: string, placeholder = '') => {
    return (
      <span
        onClick={() => interactive && onFieldClick?.(fieldId)}
        className={`relative flex-1 min-h-[1.35em] border-b border-dotted border-black pb-[1px] px-1.5 text-[11pt] leading-tight text-black font-normal ${clickableClass}`}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-transparent select-none">{placeholder || '.'}</span>
        )}
      </span>
    );
  };

  return (
    <div className="print-only-container flex flex-col items-center gap-6 print:gap-0">
      {/* PAGE 1: FORMULIR PINJAMAN DANA DARURAT (VERBATIM) */}
      <article className="a4-sheet font-doc shadow-sm border border-slate-200 print:border-none print:shadow-none px-[18mm] py-[12mm] text-black flex flex-col justify-between">
        <div>
          {/* HEADER / KOP SURAT */}
          <header className="flex items-center gap-4 pb-2.5">
            <div className="shrink-0 pl-2">
              <KopkartransLogo className="w-[74px] h-[74px]" />
            </div>
            <div className="flex-1 text-center pr-6">
              <h1 className="font-sans text-[12.5pt] font-bold tracking-tight text-black leading-snug">
                KOPERASI KONSUMEN KARYAWAN PT TRANSPORTASI JAKARTA
              </h1>
              <p className="font-sans text-[9.5pt] text-black leading-snug mt-0.5">
                Representatif Office : Jl.Mayjen Sutoyo No.1, Cawang , Jakarta Timur
              </p>
              <p className="font-sans text-[9.5pt] text-black leading-snug">
                PT.Transportasi Jakarta Head Office
              </p>
            </div>
          </header>

          {/* DOUBLE HORIZONTAL LINE */}
          <div className="border-t-[2.5px] border-black pt-[2px] mb-4">
            <div className="border-t border-black" />
          </div>

          {/* DOCUMENT TITLE */}
          <div className="text-center mb-5">
            <h2 className="text-[11.5pt] font-bold tracking-wide text-black leading-tight">
              FORMULIR PINJAMAN
            </h2>
            <p className="text-[11.5pt] font-bold tracking-wide text-black underline underline-offset-2 decoration-1 leading-tight mt-0.5">
              DANA DARURAT KOPERASI TRANSPORTASI JAKARTA
            </p>
          </div>

          {/* INTRO LINE */}
          <p className="text-[10.8pt] font-bold mb-2">Yang Bertanda Tangan dibawah ini :</p>

          {/* NUMBERED PARAMETERS 1 - 12 (VERBATIM) */}
          <div className="space-y-[5px] pl-5 text-[10.8pt]">
            {/* 1. Nama Lengkap */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">1.</span>
              <span className="w-[155px] shrink-0 font-bold">Nama Lengkap</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.namaLengkap, 'field-namaLengkap')}
            </div>

            {/* 2. No. NIK Pegawai */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">2.</span>
              <span className="w-[155px] shrink-0 font-bold">No. NIK Pegawai</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              <span
                onClick={() => interactive && onFieldClick?.('field-noNikPegawai')}
                className={`relative flex-1 min-h-[1.35em] border-b border-dotted border-black pb-[1px] px-1.5 text-[11pt] leading-tight tabular-nums ${clickableClass}`}
              >
                {data.noNikPegawai || <span className="text-transparent select-none">.</span>}
              </span>
            </div>

            {/* 3. No. KTP */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">3.</span>
              <span className="w-[155px] shrink-0 font-bold">No. KTP</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              <span
                onClick={() => interactive && onFieldClick?.('field-noKtp')}
                className={`relative flex-1 min-h-[1.35em] border-b border-dotted border-black pb-[1px] px-1.5 text-[11pt] leading-tight tabular-nums ${clickableClass}`}
              >
                {data.noKtp || <span className="text-transparent select-none">.</span>}
              </span>
            </div>

            {/* 4. Departement */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">4.</span>
              <span className="w-[155px] shrink-0 font-bold">Departement</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.departement, 'field-departement')}
            </div>

            {/* 5. Jabatan */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">5.</span>
              <span className="w-[155px] shrink-0 font-bold">Jabatan</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.jabatan, 'field-jabatan')}
            </div>

            {/* 6. Masa Kerja */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">6.</span>
              <span className="w-[155px] shrink-0 font-bold">Masa Kerja</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.masaKerja, 'field-masaKerja')}
            </div>

            {/* 7. STATUS */}
            <div className="pt-1 pb-1">
              <div className="flex items-center">
                <span className="w-[24px] shrink-0 font-bold">7.</span>
                <span className="w-[155px] shrink-0 font-bold">STATUS</span>
                <span className="w-[14px] shrink-0 font-bold">:</span>
                <div
                  onClick={() => interactive && onFieldClick?.('field-status')}
                  className={`flex items-center gap-12 pl-2 flex-1 ${clickableClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-[42px] h-[22px] border border-black text-[12pt] font-bold leading-none">
                      {data.status === 'TETAP' ? '✓' : ''}
                    </span>
                    <span className="font-bold">TETAP</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-[42px] h-[22px] border border-black text-[12pt] font-bold leading-none">
                      {data.status === 'KONTRAK' ? '✓' : ''}
                    </span>
                    <span className="font-bold">KONTRAK</span>
                  </div>
                </div>
              </div>

              {/* Berakhir ........ */}
              <div className="flex items-end justify-end mt-2">
                <div className="flex items-end w-[215px]">
                  <span className="font-bold mr-1.5 shrink-0">Berakhir</span>
                  <span
                    onClick={() => interactive && onFieldClick?.('field-kontrakBerakhir')}
                    className={`flex-1 min-h-[1.3em] border-b border-dotted border-black pb-[1px] px-1 text-[10.5pt] leading-tight ${clickableClass}`}
                  >
                    {data.status === 'KONTRAK' ? (
                      data.kontrakBerakhir || <span className="text-transparent select-none">.</span>
                    ) : (
                      <span className="text-transparent select-none">.</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 8. No. Telepon/HP */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">8.</span>
              <span className="w-[155px] shrink-0 font-bold">No. Telepon/HP</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              <span
                onClick={() => interactive && onFieldClick?.('field-noTeleponHp')}
                className={`relative flex-1 min-h-[1.35em] border-b border-dotted border-black pb-[1px] px-1.5 text-[11pt] leading-tight tabular-nums ${clickableClass}`}
              >
                {data.noTeleponHp || <span className="text-transparent select-none">.</span>}
              </span>
            </div>

            {/* 9. Alamat lengkap (2 lines) */}
            <div className="space-y-1.5">
              <div className="flex items-end">
                <span className="w-[24px] shrink-0 font-bold">9.</span>
                <span className="w-[155px] shrink-0 font-bold">Alamat lengkap</span>
                <span className="w-[14px] shrink-0 font-bold">:</span>
                {renderDottedValue(data.alamatLengkapBaris1, 'field-alamatLengkapBaris1')}
              </div>
              <div className="flex items-end">
                <span className="w-[193px] shrink-0" />
                {renderDottedValue(data.alamatLengkapBaris2, 'field-alamatLengkapBaris2')}
              </div>
            </div>

            {/* 10. Email (@) */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">10.</span>
              <span className="w-[155px] shrink-0 font-bold">Email (@)</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.email, 'field-email')}
            </div>

            {/* 11. Jumlah Pinjaman */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">11.</span>
              <span className="w-[155px] shrink-0 font-bold">Jumlah Pinjaman</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              <span className="font-bold mr-1.5 shrink-0">Rp</span>
              <span
                onClick={() => interactive && onFieldClick?.('field-jumlahPinjaman')}
                className={`relative flex-1 min-h-[1.35em] border-b border-dotted border-black pb-[1px] px-1.5 text-[11pt] font-semibold leading-tight tabular-nums ${clickableClass}`}
              >
                {formattedLoan ? `${formattedLoan},-` : <span className="text-transparent select-none">.</span>}
              </span>
            </div>

            {/* 12. Referensi/Penjamin */}
            <div className="flex items-end">
              <span className="w-[24px] shrink-0 font-bold">12.</span>
              <span className="w-[155px] shrink-0 font-bold">Referensi/Penjamin</span>
              <span className="w-[14px] shrink-0 font-bold">:</span>
              {renderDottedValue(data.referensiPenjamin, 'field-referensiPenjamin')}
            </div>
          </div>

          {/* PAYMENT DEDUCTION STATEMENT (VERBATIM) */}
          <div className="mt-5 text-[10.8pt] leading-[1.45] font-bold">
            <p>
              Adapun pembayarannya saya bersedia dipotong dari gaji saya melalui pendebetan
              Rekening Bank DKI No{' '}
              <span
                onClick={() => interactive && onFieldClick?.('field-noRekeningBankDki')}
                className={`inline-block min-w-[230px] border-b border-dotted border-black px-1.5 font-normal tabular-nums ${clickableClass}`}
              >
                {data.noRekeningBankDki || <span className="text-transparent select-none">.</span>}
              </span>
            </p>
          </div>

          {/* DECLARATION CLAUSES 1 - 3 (VERBATIM) */}
          <div className="mt-4 pl-6 text-[10.5pt] leading-[1.38]">
            <p className="font-bold mb-1">Dengan ini saya menyatakan bahwa :</p>
            <ol className="space-y-1 font-bold">
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-4">1.</span>
                <span>
                  Saya bersedia membayar pinjaman tersebut sekaligus ditambah biaya Administrasinya
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-4">2.</span>
                <span>
                  Apabila saya lalai/tidak membayar cicilan tersebut maka saya bersedia dikenakan
                  denda oleh koperasi 0,025% per hari dari hutang saya
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="shrink-0 w-4">3.</span>
                <span>
                  Apabila satu dan lain hal sehingga saya berhenti atau diberhentikan oleh PT.
                  Transportasi Jakarta maka saya bersedia hak-hak saya berupa pesangon/konpensasi
                  dipotong oleh koperasi melalui PT. Transportasi Jakarta sejumlah sisa hutang saya.
                </span>
              </li>
            </ol>
          </div>

          {/* PERSYARATAN (VERBATIM + TAMBAHAN) */}
          <div className="mt-2.5 pl-4 text-[10pt] font-bold leading-snug">
            <p>Persyaratan:</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 pl-2 mt-0.5">
              {REQUIREMENT_DOCUMENTS.map((doc) => (
                <p key={doc.key}>- &nbsp; {doc.label}</p>
              ))}
            </div>
          </div>

          {/* NOTE BOX (VERBATIM) */}
          <div className="mt-4 border border-black px-2.5 py-1">
            <p className="text-[13.5pt] font-bold text-black leading-snug">
              Note: Hanya berlaku untuk yang sudah Anggota Koperasi
            </p>
          </div>
        </div>

        {/* SIGNATURE BLOCKS (VERBATIM) */}
        <footer className="mt-6 pt-2 flex justify-between items-start text-[10.8pt] font-bold px-1">
          {/* Left: Referensi/Penjamin */}
          <div className="w-[220px] flex flex-col">
            <div className="h-[1.4em]" />
            <p>Referensi/Penjamin</p>
            <div
              onClick={() => interactive && onFieldClick?.('field-ttdPenjamin')}
              className={`h-[72px] flex items-center justify-center my-1 ${clickableClass}`}
            >
              {data.ttdPenjamin && (
                <img
                  src={data.ttdPenjamin}
                  alt="Tanda tangan Referensi/Penjamin"
                  referrerPolicy="no-referrer"
                  className="max-h-[68px] max-w-[180px] object-contain"
                />
              )}
            </div>
            <div className="flex items-end">
              <span>(</span>
              <span className="flex-1 text-center border-b border-dotted border-black px-1 font-semibold text-[10.5pt]">
                {data.referensiPenjamin || <span className="text-transparent select-none">.</span>}
              </span>
              <span>)</span>
            </div>
          </div>

          {/* Right: Jakarta ..., Pemohon */}
          <div className="w-[220px] flex flex-col">
            <div className="flex items-end">
              <span className="mr-1.5 shrink-0">Jakarta</span>
              <span
                onClick={() => interactive && onFieldClick?.('field-tanggalPengajuan')}
                className={`flex-1 border-b border-dotted border-black px-1 font-normal text-[10.5pt] leading-tight ${clickableClass}`}
              >
                {data.tanggalPengajuan || <span className="text-transparent select-none">.</span>}
              </span>
            </div>
            <p className="mt-0.5">Pemohon</p>
            <div
              onClick={() => interactive && onFieldClick?.('field-ttdPemohon')}
              className={`h-[72px] flex items-center justify-center my-1 ${clickableClass}`}
            >
              {data.ttdPemohon && (
                <img
                  src={data.ttdPemohon}
                  alt="Tanda tangan Pemohon"
                  referrerPolicy="no-referrer"
                  className="max-h-[68px] max-w-[180px] object-contain"
                />
              )}
            </div>
            <div className="flex items-end">
              <span>(</span>
              <span className="flex-1 text-center border-b border-dotted border-black px-1 font-semibold text-[10.5pt]">
                {data.namaLengkap || <span className="text-transparent select-none">.</span>}
              </span>
              <span>)</span>
            </div>
          </div>
        </footer>
      </article>

      {/* PAGE 2+: LAMPIRAN DOKUMEN PERSYARATAN */}
      {data.cetakLampiranKtp &&
        attachmentPages.map((pageItems, pageIdx) => (
          <article
            key={pageIdx}
            className="a4-sheet font-doc shadow-sm border border-slate-200 print:border-none print:shadow-none px-[18mm] py-[14mm] text-black flex flex-col"
          >
            <div className="border-b-2 border-black pb-2.5 mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-sans text-[11.5pt] font-bold text-black">
                  LAMPIRAN PERSYARATAN PINJAMAN DANA DARURAT
                </h2>
                <p className="font-sans text-[9pt] text-slate-700 mt-0.5">
                  Koperasi Konsumen Karyawan PT Transportasi Jakarta (KOPKARTRANS)
                </p>
              </div>
              <span className="font-sans text-[9pt] font-semibold text-slate-700 tabular-nums">
                Lampiran {pageIdx + 1}/{attachmentPages.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10pt] mb-5">
              <div>
                <span className="font-bold">Nama Pemohon:</span> {data.namaLengkap || '-'}
              </div>
              <div className="tabular-nums">
                <span className="font-bold">No. NIK Pegawai:</span> {data.noNikPegawai || '-'}
              </div>
              <div className="tabular-nums">
                <span className="font-bold">No. KTP:</span> {data.noKtp || '-'}
              </div>
              <div>
                <span className="font-bold">Departement:</span> {data.departement || '-'}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              {pageItems.map((item) => (
                <div
                  key={item.key}
                  className="flex-1 flex flex-col border border-slate-400 p-3.5"
                >
                  <p className="font-sans text-[10pt] font-bold text-black mb-2">
                    {item.label}
                  </p>
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.attachment.dataUrl}
                      alt={`Lampiran ${item.label}`}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[96mm] object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
    </div>
  );
};

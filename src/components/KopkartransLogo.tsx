import React from 'react';

interface KopkartransLogoProps {
  className?: string;
}

export const KopkartransLogo: React.FC<KopkartransLogoProps> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Logo Koperasi Karyawan Transjakarta (KOPKARTRANS)"
    >
      <defs>
        <path id="kopkar-top-arc" d="M 18,60 A 42,42 0 1,1 102,60" />
        <path id="kopkar-bottom-arc" d="M 14,62 A 46,46 0 0,0 106,62" />
      </defs>

      {/* Outer circular text */}
      <text
        fill="#0f172a"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="1.2"
        fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      >
        <textPath href="#kopkar-top-arc" startOffset="50%" textAnchor="middle">
          KOPERASI KARYAWAN
        </textPath>
      </text>

      <text
        fill="#0f172a"
        fontSize="9.2"
        fontWeight="700"
        letterSpacing="1.4"
        fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      >
        <textPath href="#kopkar-bottom-arc" startOffset="50%" textAnchor="middle">
          TRANSJAKARTA
        </textPath>
      </text>

      {/* Center geometric emblem */}
      <g transform="translate(60, 58)">
        {/* Outer blue triangle */}
        <polygon
          points="0,-27 25,18 -25,18"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner nested triangle */}
        <polygon
          points="0,-16 14,11 -14,11"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Center vertical & chevron bar */}
        <line x1="0" y1="-25" x2="0" y2="16" stroke="#1d4ed8" strokeWidth="2.4" />
        <line x1="-11" y1="5" x2="11" y2="5" stroke="#1e3a8a" strokeWidth="2.2" />
      </g>

      {/* KOPKARTRANS sub-label */}
      <text
        x="60"
        y="88"
        textAnchor="middle"
        fill="#0f172a"
        fontSize="7.4"
        fontWeight="800"
        letterSpacing="0.5"
        fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      >
        KOPKARTRANS
      </text>
    </svg>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:8080';

export default function QrCodePage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const qrSrc = user?.id ? `${BASE_URL}/qr/generate/${user.id}` : null;

  const handleDownload = async () => {
    if (!qrSrc) return;
    setDownloading(true);
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payflow-qr-${user.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent fail */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My QR Code</h1>
        <p className="text-slate-400 mt-1">Share this code so others can pay you instantly</p>
      </div>

      {/* QR Card */}
      <div className="card flex flex-col items-center gap-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/40 to-primary-700/40 border-2 border-primary-500/50 flex items-center justify-center text-2xl font-bold text-primary-300">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>

        {/* QR image */}
        <div className="relative">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-primary-500/20 blur-xl scale-110" />

          <div className="relative w-64 h-64 rounded-2xl border-2 border-primary-500/40 bg-white p-3 shadow-2xl shadow-primary-900/40 flex items-center justify-center">
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900">
                <svg className="animate-spin h-8 w-8 text-primary-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm text-slate-400">Generating…</p>
              </div>
            )}

            {imgError ? (
              <div className="text-center text-slate-400 p-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-sm">Could not load QR. Make sure the backend is running.</p>
              </div>
            ) : (
              <img
                src={qrSrc}
                alt="Your Payment QR Code"
                className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </div>

        {/* Payment ID badge */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/80 border border-primary-500/30 shadow-lg">
          <span className="text-slate-400 text-sm">Payment ID</span>
          <span className="text-xl font-bold text-primary-300 tracking-widest">#{user?.id ?? '—'}</span>
        </div>

        {/* Instructions */}
        <div className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 text-sm text-slate-400 space-y-2">
          <p className="flex items-start gap-2"><span>📲</span> Ask your friend to open <strong className="text-slate-200">Scan & Pay</strong> in PayFlow.</p>
          <p className="flex items-start gap-2"><span>📷</span> They point their camera at this code — the amount field is pre-filled instantly.</p>
          <p className="flex items-start gap-2"><span>✅</span> Payment lands in your wallet in seconds.</p>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading || !imgLoaded || imgError}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Downloading…
            </>
          ) : (
            '⬇️ Download QR Code'
          )}
        </button>
      </div>

      {/* Tip */}
      <p className="text-center text-xs text-slate-600 mt-4">
        QR codes are unique to your account and never expire.
      </p>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { useAuth } from '../context/AuthContext';
import { sendMoney } from '../api/api';

// ── States ────────────────────────────────────────────────
const S = {
  IDLE:     'idle',
  SCANNING: 'scanning',
  SCANNED:  'scanned',
  SENDING:  'sending',
  SUCCESS:  'success',
};

// ── Modes ─────────────────────────────────────────────────
const MODE_CAMERA = 'camera';
const MODE_UPLOAD = 'upload';

export default function ScannerPage() {
  const { user } = useAuth();
  const videoRef    = useRef(null);
  const controlsRef = useRef(null);   // holds { stop() } returned by ZXing

  const [state, setState]         = useState(S.IDLE);
  const [mode, setMode]           = useState(MODE_CAMERA);
  const [scannedData, setScanned] = useState(null);
  const [amount, setAmount]       = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccess]  = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // ── Parse raw QR text → { paymentId, name, email } ──────
  const parseQr = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.paymentId) return { ok: true, data: parsed };
    } catch { /* not JSON */ }
    // Support plain numeric ID too
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0) return { ok: true, data: { paymentId: num } };
    return { ok: false };
  };

  const handleScanResult = (text) => {
    const { ok, data } = parseQr(text);
    if (!ok) {
      setError('Invalid QR code. Please scan a PayFlow QR code.');
      setState(S.IDLE);
      return;
    }
    setScanned(data);
    setState(S.SCANNED);
  };

  // ── CAMERA: start ────────────────────────────────────────
  const startCamera = async () => {
    setError('');
    setState(S.SCANNING);

    try {
      const reader   = new BrowserQRCodeReader();
      // decodeFromVideoDevice returns a Promise<IScannerControls>
      // callback gets (result | null, error | null, controls)
      const controls = await reader.decodeFromVideoDevice(
        undefined,       // undefined → uses default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            controls.stop();
            controlsRef.current = null;
            handleScanResult(result.getText());
          }
          // err is thrown on every frame that has no QR — safe to ignore
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      const msg = e?.message || '';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('allow')) {
        setError('Camera permission denied. Please click "Allow" when the browser asks, or use the "Upload QR" tab instead.');
      } else if (msg.toLowerCase().includes('found') || msg.toLowerCase().includes('device')) {
        setError('No camera detected on this device. Please use the "Upload QR" tab instead.');
      } else {
        setError('Could not start camera. Try the "Upload QR" tab instead.');
      }
      setState(S.IDLE);
    }
  };

  // ── CAMERA: stop ─────────────────────────────────────────
  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setState(S.IDLE);
    setError('');
  };

  // Stop camera when switching tabs or unmounting
  useEffect(() => {
    return () => { controlsRef.current?.stop(); };
  }, []);

  const switchMode = (m) => {
    if (controlsRef.current) stopCamera();
    setMode(m);
    setError('');
    setState(S.IDLE);
    setScanned(null);
    setAmount('');
  };

  // ── IMAGE UPLOAD ─────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';   // allow re-upload of same file

    setError('');
    setUploadLoading(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(objectUrl);
      handleScanResult(result.getText());
    } catch {
      setError('No QR code found in the image. Make sure the photo is clear and contains a PayFlow QR code.');
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploadLoading(false);
    }
  };

  // ── PAY ──────────────────────────────────────────────────
  const handlePay = async () => {
    if (!scannedData?.paymentId || !amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (Number(scannedData.paymentId) === Number(user?.id)) {
      setError('You cannot send money to yourself.');
      return;
    }
    setError('');
    setState(S.SENDING);
    try {
      await sendMoney({
        senderId:   user.id,
        receiverId: Number(scannedData.paymentId),
        amount:     Number(amount),
      });
      setSuccess(`₹${amount} sent to ${scannedData.name || `User #${scannedData.paymentId}`}!`);
      setState(S.SUCCESS);
    } catch (err) {
      setError(err.response?.data || 'Payment failed. Please try again.');
      setState(S.SCANNED);
    }
  };

  const reset = () => {
    stopCamera();
    setState(S.IDLE);
    setScanned(null);
    setAmount('');
    setError('');
    setSuccess('');
  };

  // ─────────────────────────────────────────────────────────
  //  RENDER — SUCCESS
  // ─────────────────────────────────────────────────────────
  if (state === S.SUCCESS) return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      <div className="card flex flex-col items-center gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-5xl">✅</div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">Payment Successful!</p>
          <p className="text-slate-400">{successMsg}</p>
        </div>
        <div className="w-full bg-slate-800/60 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">To</span>
            <span className="text-slate-200">{scannedData?.name || `User #${scannedData?.paymentId}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="text-emerald-400 font-bold">₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">SUCCESS</span>
          </div>
        </div>
        <button onClick={reset} className="btn-primary w-full">📷 Scan Another QR</button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  //  RENDER — CONFIRM & PAY (after scan)
  // ─────────────────────────────────────────────────────────
  if (state === S.SCANNED || state === S.SENDING) return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Confirm Payment</h1>
        <p className="text-slate-400 mt-1">Review and enter the amount to send</p>
      </div>
      <div className="card space-y-5">
        {/* Recipient */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-300 flex-shrink-0">
            {(scannedData?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Paying to</p>
            <p className="text-white font-semibold">{scannedData?.name || `User #${scannedData?.paymentId}`}</p>
            <p className="text-xs text-slate-400 truncate">{scannedData?.email || `Payment ID: #${scannedData?.paymentId}`}</p>
          </div>
          <div className="text-2xl">✅</div>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-slate-400">Your balance</span>
          <span className="text-white font-semibold">₹{user?.balance ?? '—'}</span>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold select-none">₹</span>
            <input
              type="number" min="1" step="0.01"
              className="input-field pl-8"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {[100, 500, 1000, 5000].map((v) => (
            <button key={v} type="button"
              onClick={() => setAmount(v)}
              className="px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 hover:border-primary-600 transition-all">
              ₹{v}
            </button>
          ))}
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <div className="flex gap-3">
          <button onClick={reset}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all">
            ✕ Cancel
          </button>
          <button onClick={handlePay}
            disabled={state === S.SENDING}
            className="flex-[2] btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
            {state === S.SENDING ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Sending…</>
            ) : '💸 Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  //  RENDER — MAIN SCANNER UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Scan & Pay</h1>
        <p className="text-slate-400 mt-1">Scan a PayFlow QR code to send money instantly</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700 rounded-xl mb-6">
        <button
          onClick={() => switchMode(MODE_CAMERA)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === MODE_CAMERA
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}>
          📷 Camera Scan
        </button>
        <button
          onClick={() => switchMode(MODE_UPLOAD)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === MODE_UPLOAD
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}>
          🖼️ Upload QR Image
        </button>
      </div>

      <div className="card space-y-5">

        {/* ── CAMERA TAB ── */}
        {mode === MODE_CAMERA && (
          <>
            {/* Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700" style={{ aspectRatio: '1' }}>
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-300 ${state === S.SCANNING ? 'opacity-100' : 'opacity-0'}`}
                autoPlay muted playsInline
              />

              {state !== S.SCANNING && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="text-6xl opacity-50">📷</div>
                  <p className="text-slate-500 text-sm">Camera preview appears here</p>
                </div>
              )}

              {state === S.SCANNING && (
                <>
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-primary-400 rounded-tl-lg"/>
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-primary-400 rounded-tr-lg"/>
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-primary-400 rounded-bl-lg"/>
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-primary-400 rounded-br-lg"/>
                  <div className="absolute left-8 right-8 h-0.5 bg-primary-400/80 shadow-lg shadow-primary-400/50 animate-scan-line" style={{top:'50%'}}/>
                </>
              )}
            </div>

            {/* Status badge */}
            {state === S.SCANNING && (
              <div className="flex items-center justify-center gap-2 text-primary-400 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400"/>
                </span>
                Scanning — point camera at the QR code…
              </div>
            )}

            {/* Camera tip */}
            {state === S.IDLE && !error && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-sky-400 text-xs space-y-1">
                <p className="font-semibold">💡 Camera Tips</p>
                <p>• Click below and <strong>Allow</strong> camera access when the browser asks.</p>
                <p>• Make sure you're on <strong>http://localhost:3000</strong> (not a public URL).</p>
                <p>• If camera is blocked, switch to the <strong>Upload QR Image</strong> tab.</p>
              </div>
            )}

            {error && <div className="error-box">⚠️ {error}</div>}

            {state === S.SCANNING ? (
              <button onClick={stopCamera} className="btn-primary w-full !bg-red-600 hover:!bg-red-500">
                ⏹ Stop Camera
              </button>
            ) : (
              <button onClick={startCamera} className="btn-primary w-full">
                📷 Start Camera
              </button>
            )}
          </>
        )}

        {/* ── UPLOAD TAB ── */}
        {mode === MODE_UPLOAD && (
          <>
            <p className="text-slate-400 text-sm text-center">
              Select a screenshot or photo of a PayFlow QR code from your device.
            </p>

            {/* Drop-zone style upload */}
            <label
              htmlFor="qr-upload"
              className={`flex flex-col items-center justify-center gap-4 w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-14
                ${uploadLoading
                  ? 'border-primary-500/50 bg-primary-500/5'
                  : 'border-slate-600 hover:border-primary-500/60 hover:bg-primary-500/5 bg-slate-800/30'}`}>
              {uploadLoading ? (
                <>
                  <svg className="animate-spin h-10 w-10 text-primary-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <p className="text-primary-400 text-sm font-medium">Reading QR code…</p>
                </>
              ) : (
                <>
                  <span className="text-5xl">🖼️</span>
                  <div className="text-center">
                    <p className="text-white font-semibold">Click to choose an image</p>
                    <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP — any photo with a QR code</p>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold">Browse Files</span>
                </>
              )}
            </label>
            <input
              id="qr-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadLoading}
            />

            {error && <div className="error-box">⚠️ {error}</div>}

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-slate-500 text-xs space-y-1">
              <p className="flex gap-2"><span>1️⃣</span> Take a screenshot of your friend's <strong className="text-slate-300">My QR Code</strong> page.</p>
              <p className="flex gap-2"><span>2️⃣</span> Click <strong className="text-slate-300">Browse Files</strong> and select the screenshot.</p>
              <p className="flex gap-2"><span>3️⃣</span> Enter the amount and tap <strong className="text-slate-300">Pay Now</strong>.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

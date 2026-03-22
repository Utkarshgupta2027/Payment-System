import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendMoney } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function SendMoneyPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ receiverId: '', amount: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user?.id) {
      setError('User ID not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      await sendMoney({
        senderId:   user.id,
        receiverId: Number(form.receiverId),
        amount:     Number(form.amount),
      });
      setSuccess(`₹${form.amount} sent successfully to User #${form.receiverId}!`);
      setForm({ receiverId: '', amount: '' });
    } catch (err) {
      setError(err.response?.data || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Send Money</h1>
          <p className="text-slate-400 mt-1">Transfer funds instantly to any user</p>
        </div>
        <Link
          to="/scanner"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-sm font-medium hover:bg-sky-500/25 active:scale-95 transition-all duration-200 flex-shrink-0 mt-1"
        >
          📷 Scan QR
        </Link>
      </div>

      {/* Sender info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-xl font-bold text-primary-300">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Sending from</p>
            <p className="text-white font-semibold">{user?.name || user?.email}</p>
            <p className="text-xs text-slate-400">Balance: ₹{user?.balance ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Receiver User ID</label>
            <input
              id="send-receiver"
              type="number"
              min="1"
              className="input-field"
              placeholder="e.g. 42"
              value={form.receiverId}
              onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Enter the numeric ID of the recipient</p>
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold select-none">₹</span>
              <input
                id="send-amount"
                type="number"
                min="1"
                step="0.01"
                className="input-field pl-8"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>

          {error   && <div className="error-box">⚠️ {error}</div>}
          {success && <div className="success-box">✅ {success}</div>}

          {/* Quick amounts */}
          <div>
            <p className="label">Quick amounts</p>
            <div className="flex gap-2 flex-wrap">
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, amount: val }))}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 hover:border-primary-600 transition-all"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          <button id="send-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending…
              </span>
            ) : '💸 Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
}

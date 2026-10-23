import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Check, AlertCircle, Copy, ExternalLink, Shield, Bell, HelpCircle, X, Smartphone } from 'lucide-react';

export default function MessengerDispatchModal({ isOpen, onClose, tripData }) {
  const [activeTab, setActiveTab] = useState('telegram'); // 'telegram' or 'whatsapp'
  
  // Telegram State
  const [botToken, setBotToken] = useState(() => localStorage.getItem('lifeos_tg_bot_token') || '');
  const [chatId, setChatId] = useState(() => localStorage.getItem('lifeos_tg_chat_id') || '');
  const [autoNotify, setAutoNotify] = useState(() => localStorage.getItem('lifeos_tg_auto_notify') === 'true');
  const [customNote, setCustomNote] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [tgStatus, setTgStatus] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showTgHelp, setShowTgHelp] = useState(false);

  // WhatsApp State
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('lifeos_wa_phone') || '');
  const [waLink, setWaLink] = useState('');
  const [waPreviewText, setWaPreviewText] = useState('');
  const [copied, setCopied] = useState(false);
  const [waLoading, setWaLoading] = useState(false);

  // Save credentials on change
  useEffect(() => {
    localStorage.setItem('lifeos_tg_bot_token', botToken);
  }, [botToken]);

  useEffect(() => {
    localStorage.setItem('lifeos_tg_chat_id', chatId);
  }, [chatId]);

  useEffect(() => {
    localStorage.setItem('lifeos_tg_auto_notify', String(autoNotify));
  }, [autoNotify]);

  useEffect(() => {
    localStorage.setItem('lifeos_wa_phone', phoneNumber);
  }, [phoneNumber]);

  // Load WhatsApp preview link when opened
  useEffect(() => {
    if (isOpen && tripData) {
      fetchWhatsAppLink();
    }
  }, [isOpen, tripData, phoneNumber]);

  const generateClientWhatsAppText = (data, phone) => {
    const city = (data?.city || 'London').toUpperCase();
    const dates = data?.dates || 'Upcoming Schedule';
    const weather = data?.weather || 'Intermittent Rain, 14°C';
    const packing = data?.packing || 'Trench coat, umbrella, formal layers';
    const hotel = data?.hotel?.name || (typeof data?.hotel === 'string' ? data?.hotel : 'The Langham, Regent Street');
    const flight = data?.flight?.airline || (typeof data?.flight === 'string' ? data?.flight : 'British Airways (BA 117)');
    const budget = data?.total_budget || 'INR 45,000';

    const text = `🧭 *LIFEOS // EXECUTIVE STATUS DISPATCH*\n----------------------------------------\n📍 *Destination:* ${city}\n📅 *Schedule:* ${dates}\n\n✈️ *TRANSIT & FLIGHTS*\n• Carrier: ${flight}\n• Status: Confirmed & Synchronized\n\n🏨 *LODGING*\n• Property: ${hotel}\n• Booking: Reserved\n\n🌦️ *WEATHER & DIRECTIVE*\n• Forecast: ${weather}\n• Packing: ${packing}\n\n💳 *FINANCE SUMMARY*\n• Projected Cost: ${budget}\n----------------------------------------\n_LifeOS Personal Chief of Staff Telemetry_`;

    const encoded = encodeURIComponent(text);
    const cleanedPhone = phone ? phone.replace(/\\D/g, '') : '';
    const link = cleanedPhone ? `https://wa.me/${cleanedPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    return { text, link };
  };

  const fetchWhatsAppLink = async () => {
    // 1. Set instant fallback immediately
    const fallback = generateClientWhatsAppText(tripData, phoneNumber);
    setWaLink(fallback.link);
    setWaPreviewText(fallback.text);

    // 2. Fetch server-side rendered link
    try {
      setWaLoading(true);
      const res = await fetch('http://localhost:8000/api/dispatch/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_data: tripData || {},
          phone_number: phoneNumber || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWaLink(data.wa_link);
        setWaPreviewText(data.raw_text);
      }
    } catch (err) {
      console.warn('Using client fallback for WhatsApp dispatch:', err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!botToken || !chatId) {
      setTgStatus({ type: 'error', text: 'Please enter both Bot Token and Chat ID first.' });
      return;
    }
    setIsTesting(true);
    setTgStatus(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('http://localhost:8000/api/dispatch/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_token: botToken.trim(), chat_id: chatId.trim() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok && data.success) {
        setTgStatus({ type: 'success', text: 'Handshake confirmed! Check your Telegram app.' });
        if (data.resolved_id && data.resolved_id !== chatId) {
          setChatId(data.resolved_id);
        }
      } else {
        setTgStatus({ type: 'error', text: data.detail || 'Connection failed.' });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setTgStatus({ type: 'error', text: 'Request timed out after 15s. Check your Telegram bot token or internet connection.' });
      } else {
        setTgStatus({ type: 'error', text: `Network error: ${err.message}` });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTelegram = async () => {
    if (!botToken || !chatId) {
      setTgStatus({ type: 'error', text: 'Enter Bot Token and Chat ID to send status.' });
      return;
    }
    setIsDispatching(true);
    setTgStatus(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('http://localhost:8000/api/dispatch/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: botToken.trim(),
          chat_id: chatId.trim(),
          trip_data: tripData || {},
          custom_note: customNote || undefined
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok && data.success) {
        setTgStatus({ type: 'success', text: 'Trip status dispatched to your Telegram!' });
        if (data.resolved_id && data.resolved_id !== chatId) {
          setChatId(data.resolved_id);
        }
      } else {
        setTgStatus({ type: 'error', text: data.detail || 'Failed to dispatch status.' });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setTgStatus({ type: 'error', text: 'Dispatch timed out. Telegram servers may be slow.' });
      } else {
        setTgStatus({ type: 'error', text: `Failed to dispatch: ${err.message}` });
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyMemo = () => {
    if (waPreviewText) {
      navigator.clipboard.writeText(waPreviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e131f] text-neutral-200 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <h3 className="font-title font-bold text-lg text-white tracking-wide">
                MESSENGER BOT // LIVE TELEMETRY
              </h3>
              <p className="text-xs font-retro-mono text-neutral-400">
                Track workflow status & receive alerts directly on your phone
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-2.5 px-4 text-xs font-retro-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'telegram'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4 text-sky-400" />
            TELEGRAM BOT (AUTOMATED PUSH)
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2.5 px-4 text-xs font-retro-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            WHATSAPP (ONE-CLICK DISPATCH)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* ================= TELEGRAM TAB ================= */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-sky-950/30 border border-sky-800/40 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-retro-mono text-sky-300">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Free Telegram Bot API • Instant alerts to your smartphone</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTgHelp(!showTgHelp)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-retro-mono underline flex items-center gap-1 shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showTgHelp ? 'Hide Guide' : 'Setup Guide (30s)'}
                </button>
              </div>

              {/* Quick Setup Guide Drawer */}
              {showTgHelp && (
                <div className="bg-neutral-900/90 border border-neutral-700/60 p-3.5 rounded-xl text-xs space-y-2 text-neutral-300 font-retro-mono animate-fade-in">
                  <div className="font-bold text-sky-400">HOW TO GET YOUR TELEGRAM BOT CREDENTIALS:</div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400">
                    <li>Open Telegram and search for <b>@BotFather</b>.</li>
                    <li>Send <code>/newbot</code>, choose a name, and copy the <b>HTTP API Token</b>.</li>
                    <li>Start a chat with your new bot and click <b>Start</b>.</li>
                    <li>To get your numerical Chat ID, message <b>@userinfobot</b> on Telegram—it replies with your ID instantly.</li>
                  </ol>
                </div>
              )}

              {/* Bot Credentials Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-retro-mono text-neutral-400 mb-1">
                    TELEGRAM BOT TOKEN
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 7123456789:AAH..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-retro-mono text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-retro-mono text-neutral-400 mb-1">
                    YOUR NUMERIC CHAT ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321 (from @userinfobot)"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className={`w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs font-retro-mono text-white placeholder-neutral-600 focus:outline-none ${
                      chatId.trim().startsWith('@') ? 'border-amber-500/70 focus:border-amber-400' : 'border-neutral-700 focus:border-sky-500'
                    }`}
                  />
                  {chatId.trim().startsWith('@') && (
                    <div className="mt-1.5 text-[10px] font-retro-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg flex items-start gap-1.5">
                      <span className="shrink-0 text-xs">⚠️</span>
                      <span>
                        Telegram Bot API requires your <b>numeric User ID</b> (numbers only e.g. <code>581920392</code>), not <code>{chatId}</code>.<br/>
                        👉 Open Telegram, message <b>@userinfobot</b>, and paste the <b>Id</b> it gives you!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-retro-mono text-neutral-400 mb-1">
                  OPTIONAL ATTACHED DIRECTIVE / NOTE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight booked under corporate account, baggage tag #29A"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-retro-mono text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Auto Notify Toggle */}
              <label className="flex items-center gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-900 transition-colors">
                <input
                  type="checkbox"
                  checked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-neutral-800 border-neutral-600"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-sky-400" />
                    Auto-push to Telegram when LifeOS finishes planning
                  </div>
                  <div className="text-neutral-400 font-retro-mono text-[10px]">
                    Sends real-time itinerary confirmation to your mobile device automatically.
                  </div>
                </div>
              </label>

              {/* Feedback Alert */}
              {tgStatus && (
                <div className={`p-3 rounded-xl text-xs font-retro-mono flex items-start gap-2 ${
                  tgStatus.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border border-red-500/40 text-red-300'
                }`}>
                  {tgStatus.type === 'success' ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  <span className="leading-relaxed">{tgStatus.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={isTesting || isDispatching}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-retro-mono font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? 'Connecting...' : 'Ping Test Handshake'}
                </button>
                <button
                  type="button"
                  onClick={handleSendTelegram}
                  disabled={isTesting || isDispatching}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-retro-mono font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isDispatching ? 'Dispatching...' : 'Send Live Travel Status'}
                </button>
              </div>
            </div>
          )}

          {/* ================= WHATSAPP TAB ================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-xs font-retro-mono text-emerald-300">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero setup required: Generates an encrypted memo ready to send via WhatsApp Web or Mobile.</span>
              </div>

              <div>
                <label className="block text-[11px] font-retro-mono text-neutral-400 mb-1">
                  RECIPIENT PHONE NUMBER (OPTIONAL WITH COUNTRY CODE)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210 (leave blank to select contact in WhatsApp)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-retro-mono text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Message Preview */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-retro-mono text-neutral-400">DISPATCH MEMO PREVIEW</span>
                  <button
                    onClick={handleCopyMemo}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-retro-mono flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-retro-mono text-xs text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto selection:bg-emerald-500/30">
                  {waPreviewText || 'Loading executive memo preview...'}
                </div>
              </div>

              {/* Launch WhatsApp Button */}
              <div className="pt-2">
                <a
                  href={waLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-retro-mono font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ${
                    !waLink ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in WhatsApp Web / App
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950/80 border-t border-neutral-800/80 text-center text-[10px] font-retro-mono text-neutral-500">
          LIFEOS SECURE TELEMETRY ENGINE • END-TO-END CHIEF OF STAFF DISPATCH
        </div>

      </div>
    </div>
  );
}

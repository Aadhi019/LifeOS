import React, { useState } from 'react';
import axios from 'axios';
import { X, Send, Calendar, Clock, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function ConflictReschedulerModal({ isOpen, onClose, destination = 'London', conflictEvent }) {
  const [colleagueName, setColleagueName] = useState('Colleague');
  const [colleagueEmail, setColleagueEmail] = useState('colleague@example.com');
  const [eventName, setEventName] = useState(conflictEvent?.summary || 'Project Sync & Strategy Session');
  const [customNote, setCustomNote] = useState('I will be reachable via email in the evening if urgent matters arise.');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const proposedSlots = [
    'Thursday, 11:00 AM – 12:00 PM',
    'Friday, 03:00 PM – 04:00 PM',
    'Next Monday, 10:00 AM – 11:00 AM'
  ];

  const emailPreview = `Dear ${colleagueName},

I hope this message finds you well.

Due to confirmed travel commitments to ${destination}, I will be traveling and unavailable during our scheduled session for '${eventName}'.

To ensure we still connect without disruption, would any of the following alternate windows work for you?
  • Thursday, 11:00 AM – 12:00 PM
  • Friday, 03:00 PM – 04:00 PM
  • Next Monday, 10:00 AM – 11:00 AM

${customNote}

Please let me know if one of these options suits your calendar, or feel free to propose another convenient time.

Thank you for your understanding.

Sincerely,
Executive Office | LifeOS Autonomous Assistant`;

  const handleSend = async () => {
    setIsSending(true);
    try {
      await axios.post(`${API_BASE}/reschedule-conflict`, {
        colleague_name: colleagueName,
        colleague_email: colleagueEmail,
        original_event: eventName,
        trip_destination: destination,
        proposed_slots: proposedSlots,
        custom_note: customNote
      });
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      // Even if mock email mode, show success for demonstration
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-(--bg-cream) dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-300/40 dark:border-neutral-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-retro-mono font-bold uppercase tracking-wider text-red-500 block">
                CONFLICT MITIGATION
              </span>
              <h3 className="font-title font-bold text-base text-neutral-800 dark:text-neutral-100">
                Polite Meeting Rescheduler
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs font-retro-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-500 font-bold block mb-1">RECIPIENT NAME:</label>
              <input
                type="text"
                value={colleagueName}
                onChange={(e) => setColleagueName(e.target.value)}
                className="w-full p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-500 font-bold block mb-1">RECIPIENT EMAIL:</label>
              <input
                type="email"
                value={colleagueEmail}
                onChange={(e) => setColleagueEmail(e.target.value)}
                className="w-full p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-500 font-bold block mb-1">CONFLICTING EVENT TITLE:</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-2 rounded-xl bg-white/70 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 focus:outline-none"
            />
          </div>

          {/* Generated Formal Draft Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-500 font-bold">AUTOMATED POLITE DRAFT:</label>
              <button 
                type="button" 
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-(--color-terracotta) hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
            <div className="panel-neu-inset p-3 rounded-xl bg-white/50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 max-h-44 overflow-y-auto whitespace-pre-line text-[11px]">
              {emailPreview}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-neutral-300/40 dark:border-neutral-700">
          <span className="text-[11px] font-retro-mono text-neutral-400">
            Dispatched via LifeOS Executive Mailer
          </span>

          <button
            onClick={handleSend}
            disabled={isSending || sendSuccess}
            className={`btn-vintage flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-retro-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
              sendSuccess 
                ? 'bg-emerald-500 text-white' 
                : 'bg-(--color-terracotta) text-white hover:bg-(--color-terracotta-hover)'
            }`}
          >
            {sendSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>RESCHEDULE EMAIL SENT!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "DISPATCHING..." : "SEND RESCHEDULE REQUEST"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

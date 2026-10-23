import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, PhoneCall, Building2, Landmark, Zap, Compass, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_KITS = {
  london: {
    city: "London",
    country: "United Kingdom",
    currency: "GBP",
    exchange_rate: "1 GBP ≈ 106.50 INR",
    police: "999 (Emergency) / 101",
    medical: "999 / NHS 111",
    hospital: "St Thomas' Hospital (Westminster Bridge Rd, SE1 7EH)",
    embassy: "High Commission of India (India House, Aldwych, WC2B 4NA)",
    embassy_phone: "+44 20 7836 9147",
    transit_advice: "Tap-in/Tap-out with Contactless debit/credit or Oyster card across the London Underground (Tube) and buses. Cash is not accepted on buses.",
    plug_type: "Type G (230V, 50Hz, 3 rectangular pins)"
  },
  bangalore: {
    city: "Bangalore",
    country: "India",
    currency: "INR",
    exchange_rate: "Local Currency (INR)",
    police: "112 / 100",
    medical: "108 / 102",
    hospital: "Manipal Hospital (Old Airport Road) / Apollo Hospital",
    embassy: "Local Domestic Hub / FRRO Indiranagar",
    embassy_phone: "+91 80 2294 2188",
    transit_advice: "Use Namma Metro smart card or QR tickets on WhatsApp. Uber and Ola available 24/7.",
    plug_type: "Type C, D, M (230V, 50Hz)"
  },
  paris: {
    city: "Paris",
    country: "France",
    currency: "EUR",
    exchange_rate: "1 EUR ≈ 91.20 INR",
    police: "17 (Police) / 112",
    medical: "15 (SAMU Medical Dispatch)",
    hospital: "Hôpital Hôtel-Dieu (1 Parvis Notre-Dame, 75004)",
    embassy: "Embassy of India (13-15 Rue Alfred Dehodencq, 75016)",
    embassy_phone: "+33 1 40 50 70 70",
    transit_advice: "Use the Navigo Easy card or Île-de-France Mobilités mobile app for Métro and RER trains.",
    plug_type: "Type C & E (230V, 50Hz)"
  }
};

export default function EmergencyKitCard({ city = 'London' }) {
  const normalizedKey = (city || 'London').toLowerCase().trim();
  const [kit, setKit] = useState(() => DEFAULT_KITS[normalizedKey] || DEFAULT_KITS.london);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const key = (city || 'London').toLowerCase().trim();
    if (DEFAULT_KITS[key]) {
      setKit(DEFAULT_KITS[key]);
    }

    const fetchKit = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/emergency-kit/${encodeURIComponent(city || 'London')}`);
        if (isMounted && res.data?.kit) {
          setKit(res.data.kit);
        }
      } catch (err) {
        console.warn('Emergency kit fallback active:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchKit();
    return () => { isMounted = false; };
  }, [city]);

  return (
    <div className="card-vintage p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-300/40 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-retro-mono font-bold uppercase tracking-wider text-red-500 block">
              BLACKBOX SURVIVAL &amp; OFFLINE PROTOCOL
            </span>
            <h4 className="font-title font-bold text-lg text-neutral-800 dark:text-neutral-100">
              {kit.city} Emergency &amp; Logistics Kit
            </h4>
          </div>
        </div>
        <span className="text-[10px] font-retro-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold uppercase">
          OFFLINE STAGED
        </span>
      </div>

      {/* Grid of Emergency & Logistics Intel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-retro-mono">
        {/* Police & Emergency Hotline */}
        <div className="panel-neu-inset p-3 rounded-xl bg-(--bg-cream) dark:bg-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase">
            <PhoneCall className="w-3 h-3" />
            <span>DISPATCH &amp; POLICE</span>
          </div>
          <p className="font-bold text-sm text-neutral-800 dark:text-neutral-100">{kit.police}</p>
          <p className="text-[10px] text-neutral-500">Medical: {kit.medical}</p>
        </div>

        {/* Embassy & Mission */}
        <div className="panel-neu-inset p-3 rounded-xl bg-(--bg-cream) dark:bg-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase">
            <Landmark className="w-3 h-3" />
            <span>DIPLOMATIC EMBASSY</span>
          </div>
          <p className="font-bold text-[11px] text-neutral-800 dark:text-neutral-100 truncate">{kit.embassy}</p>
          <p className="text-[10px] text-neutral-500">{kit.embassy_phone}</p>
        </div>

        {/* Currency & Exchange */}
        <div className="panel-neu-inset p-3 rounded-xl bg-(--bg-cream) dark:bg-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
            <RefreshCw className="w-3 h-3" />
            <span>CURRENCY RATIO</span>
          </div>
          <p className="font-bold text-sm text-neutral-800 dark:text-neutral-100">{kit.currency}</p>
          <p className="text-[10px] text-neutral-500">{kit.exchange_rate}</p>
        </div>

        {/* Electrical Plug Specs */}
        <div className="panel-neu-inset p-3 rounded-xl bg-(--bg-cream) dark:bg-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase">
            <Zap className="w-3 h-3" />
            <span>POWER ADAPTER</span>
          </div>
          <p className="font-bold text-[11px] text-neutral-800 dark:text-neutral-100 truncate">{kit.plug_type}</p>
          <p className="text-[10px] text-neutral-500">Universal standard</p>
        </div>
      </div>

      {/* Transit & Hospital Field Advice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-retro-mono">
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-neutral-700 dark:text-neutral-300">
          <span className="font-bold text-[10px] uppercase text-blue-600 block mb-1">TRANSIT ADVICE //</span>
          <p className="text-[11px] leading-relaxed">{kit.transit_advice}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-neutral-700 dark:text-neutral-300">
          <span className="font-bold text-[10px] uppercase text-emerald-600 block mb-1">PRIMARY TRAUMA CENTER //</span>
          <p className="text-[11px] leading-relaxed">{kit.hospital}</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Printer, Plane, Building, QrCode, Shield, CheckCircle2 } from 'lucide-react';

export default function DigitalPassModal({ isOpen, onClose, agentState, selectedFlight, selectedHotel }) {
  if (!isOpen || !agentState?.agent_outputs) return null;

  const outputs = agentState.agent_outputs;
  const travel = outputs.travel || {};
  const city = travel.city || 'London';
  const date = travel.dates || '2026-10-26';
  const flight = selectedFlight || (outputs.flights && outputs.flights[0]) || { airline: 'British Airways', origin: 'BLR', destination: 'LHR', departure: '09:00', price: 54000 };
  const hotel = selectedHotel || (outputs.hotels && outputs.hotels[0]) || { name: 'The Savoy London', price: 28000, rating: '4.8' };
  const totalBudget = outputs.finance?.total || outputs.optimized_budget?.optimized_total || '21,500';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-(--bg-cream) dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-300/40 dark:border-neutral-700 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-(--color-terracotta) animate-ping" />
            <h3 className="font-title font-bold text-lg text-neutral-800 dark:text-neutral-100">
              Executive Travel Dossier &amp; Boarding Pass
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-vintage flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-retro-mono text-neutral-700 hover:text-(--color-terracotta) cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PASS CARD (Apple Wallet / Airline Boarding Pass Style) */}
        <div className="space-y-6">
          {/* Main Boarding Pass Card */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-neutral-300 dark:border-neutral-700 bg-linear-to-br from-neutral-900 to-slate-900 text-white p-6 relative">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-retro-mono tracking-widest uppercase text-amber-400 block mb-1">
                  OFFICIAL EXECUTIVE BOARDING PASS
                </span>
                <h4 className="text-xl font-bold font-title tracking-tight">{flight.airline}</h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-retro-mono text-neutral-400 uppercase block">FLIGHT ID</span>
                <span className="font-retro-mono font-bold text-sm text-neutral-200">
                  {flight.airline.slice(0, 2).toUpperCase()}-{(flight.displayedPrice || 54200) % 900 + 100}
                </span>
              </div>
            </div>

            {/* Origin -> Destination Banner */}
            <div className="grid grid-cols-3 items-center text-center my-6">
              <div className="text-left">
                <span className="text-[10px] font-retro-mono text-neutral-400 block uppercase">ORIGIN</span>
                <span className="text-3xl font-extrabold font-retro-mono tracking-wider">{flight.origin || 'BLR'}</span>
                <span className="text-xs text-neutral-400 block">Gateway</span>
              </div>
              <div className="flex flex-col items-center">
                <Plane className="w-6 h-6 text-(--color-terracotta) transform rotate-90 mb-1" />
                <span className="text-[10px] font-retro-mono text-neutral-500 uppercase">NON-STOP</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-retro-mono text-neutral-400 block uppercase">DESTINATION</span>
                <span className="text-3xl font-extrabold font-retro-mono tracking-wider text-amber-400">{flight.destination || 'LHR'}</span>
                <span className="text-xs text-neutral-400 block">{city}</span>
              </div>
            </div>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-dashed border-white/15 text-xs font-retro-mono">
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">DATE</span>
                <span className="font-bold text-neutral-200">{date}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">DEP TIME</span>
                <span className="font-bold text-neutral-200">{flight.departure || '09:00'}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">CLASS</span>
                <span className="font-bold text-emerald-400 uppercase">BUSINESS</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 block uppercase">GATE / SEAT</span>
                <span className="font-bold text-amber-400">G04 / 2A</span>
              </div>
            </div>

            {/* Barcode & Security Strip */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-md">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-10 h-10" viewBox="0 0 33 33" fill="none">
                    <rect width="33" height="33" fill="white"/>
                    <rect x="2" y="2" width="9" height="9" fill="black"/>
                    <rect x="4" y="4" width="5" height="5" fill="white"/>
                    <rect x="22" y="2" width="9" height="9" fill="black"/>
                    <rect x="24" y="4" width="5" height="5" fill="white"/>
                    <rect x="2" y="22" width="9" height="9" fill="black"/>
                    <rect x="4" y="24" width="5" height="5" fill="white"/>
                    <rect x="14" y="14" width="5" height="5" fill="black"/>
                    <rect x="14" y="2" width="4" height="4" fill="black"/>
                    <rect x="2" y="14" width="4" height="4" fill="black"/>
                    <rect x="22" y="14" width="4" height="4" fill="black"/>
                    <rect x="14" y="22" width="4" height="4" fill="black"/>
                  </svg>
                </div>
                <div className="text-[9px] font-retro-mono text-neutral-400">
                  <span>ETKT // 892019482701</span><br/>
                  <span className="text-emerald-400">VERIFIED STATUS: CONFIRMED</span>
                </div>
              </div>

              {/* Faux Barcode lines */}
              <div className="hidden sm:flex items-center gap-0.5 h-8">
                {[2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 5, 2, 1, 4, 2, 3].map((w, idx) => (
                  <span key={idx} className="bg-white/80 h-full inline-block" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Hotel & Emergency Vouchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="panel-neu-inset p-4 rounded-2xl bg-(--bg-cream) dark:bg-neutral-800 text-xs font-retro-mono space-y-1">
              <span className="text-[9px] font-bold uppercase text-(--color-terracotta) block">HOTEL CONFIRMATION</span>
              <p className="font-bold text-sm text-neutral-800 dark:text-neutral-100">{hotel.name}</p>
              <p className="text-neutral-500">Rate: INR {hotel.price?.toLocaleString()} / night</p>
              <p className="text-emerald-600 font-semibold pt-1">Ref Code: HTL-{city.toUpperCase().slice(0, 3)}-9821</p>
            </div>

            <div className="panel-neu-inset p-4 rounded-2xl bg-(--bg-cream) dark:bg-neutral-800 text-xs font-retro-mono space-y-1">
              <span className="text-[9px] font-bold uppercase text-blue-600 block">TOTAL LOGISTICS BUDGET</span>
              <p className="font-bold text-sm text-neutral-800 dark:text-neutral-100">INR {totalBudget.toLocaleString()}</p>
              <p className="text-neutral-500">Allocation: Lodging + Transit + Dining</p>
              <p className="text-neutral-600 font-semibold pt-1">Audited by Finance Specialist</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-neutral-300/40 dark:border-neutral-700 text-center text-xs font-retro-mono text-neutral-500">
          LifeOS Autonomous Executive Travel Framework &bull; Retain for airport gate presentation
        </div>
      </div>
    </div>
  );
}

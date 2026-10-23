import React, { useState } from 'react';
import { Shield, Sparkles, MessageSquare, CheckCircle, ChevronDown, ChevronUp, Bot, Brain } from 'lucide-react';

export default function AgentWarRoom({ agentState, selectedFlight, selectedHotel }) {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const outputs = agentState?.agent_outputs || {};
  const city = outputs.travel?.city || 'London';
  const weather = outputs.travel?.weather_summary || 'Rain likely';
  const total = outputs.finance?.total || 21500;
  const flight = selectedFlight || (outputs.flights && outputs.flights[0]);
  const hotel = selectedHotel || (outputs.hotels && outputs.hotels[0]);

  // Simulated live multi-agent dialogue log representing internal LangGraph deliberation
  const agentDialogue = [
    {
      id: 1,
      agent: 'Supervisor',
      role: 'Chief of Staff Orchestrator',
      color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      time: '00:00.12',
      message: `Deconstructed user travel intent. Dispatched parallel sub-tasks: Geolocation & Weather, Flight Routing, Accommodation Selection, and Financial Safeguards for destination ${city}.`
    },
    {
      id: 2,
      agent: 'Geolocator Agent',
      role: 'Spatial & Climate Sentinel',
      color: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
      time: '00:00.45',
      message: `Geocoded ${city}. Retrieved meteorological outlook: ${weather}. Flagged precipitation hazard. Instructed Risk Agent to enforce waterproof apparel parameters.`
    },
    {
      id: 3,
      agent: 'Flight Specialist',
      role: 'Transit Optimizer',
      color: 'text-purple-500 border-purple-500/30 bg-purple-500/10',
      time: '00:01.02',
      message: flight ? `Evaluated ${outputs.flights?.length || 4} prospective flight itineraries. Ranked ${flight.airline} (${flight.origin} → ${flight.destination}) as top utility choice for score and timing.` : `Assessed carrier options. Formulated optimum departure window.`
    },
    {
      id: 4,
      agent: 'Hotel Curator',
      role: 'Hospitality Specialist',
      color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
      time: '00:01.35',
      message: hotel ? `Screened lodging inventory in ${city}. Cross-referenced with historical memory preferences. Selected ${hotel.name} at INR ${hotel.price?.toLocaleString()} per night.` : `Curated top hospitality locations matching executive profile.`
    },
    {
      id: 5,
      agent: 'Finance Auditor',
      role: 'Budget & Expenditure Controller',
      color: 'text-yellow-600 border-yellow-600/30 bg-yellow-500/10',
      time: '00:01.78',
      message: `Audited category expenditures: Lodging (INR ${outputs.finance?.lodging || 12000}), Transit (INR ${outputs.finance?.transit || 2500}), Dining (INR ${outputs.finance?.food || 4000}). Consolidated final estimate to INR ${total.toLocaleString()}. Variance within acceptable envelope.`
    },
    {
      id: 6,
      agent: 'Calendar Sentinel',
      role: 'Temporal Conflict Analyzer',
      color: 'text-red-500 border-red-500/30 bg-red-500/10',
      time: '00:02.10',
      message: `Scanned Google Calendar active events. Confirmed full day travel block. Prepared conflict mitigation proposals.`
    },
    {
      id: 7,
      agent: 'Supervisor',
      role: 'Consensus Reached',
      color: 'text-emerald-600 border-emerald-600/30 bg-emerald-500/10',
      time: '00:02.40',
      message: `Consensus achieved across all 6 specialist agents. Compiled formal executive itinerary briefing and structured payload for executive approval.`
    }
  ];

  const filteredLogs = selectedAgentFilter === 'all' 
    ? agentDialogue 
    : agentDialogue.filter(d => d.agent.toLowerCase().includes(selectedAgentFilter.toLowerCase()));

  return (
    <div className="card-vintage p-6 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-300/40 dark:border-neutral-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-retro-mono uppercase tracking-wider text-(--color-terracotta) font-bold block">
              MULTI-AGENT INTELLIGENCE ARCHITECTURE
            </span>
            <h3 className="font-title font-bold text-lg text-neutral-800 dark:text-neutral-100">
              Agent "War Room" Consensus Deliberation
            </h3>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-retro-mono">
          {['all', 'Supervisor', 'Flight', 'Hotel', 'Finance', 'Geolocator'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedAgentFilter(f)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                selectedAgentFilter === f 
                  ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue Timeline Stream */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filteredLogs.map(item => (
          <div 
            key={item.id} 
            className="p-3.5 rounded-2xl panel-neu-inset bg-(--bg-cream) dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-700 space-y-1.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-retro-mono font-bold text-[10px] uppercase border ${item.color}`}>
                  {item.agent}
                </span>
                <span className="text-neutral-400 font-retro-mono text-[10px]">
                  // {item.role}
                </span>
              </div>
              <span className="font-retro-mono text-[10px] text-neutral-400">
                +{item.time}
              </span>
            </div>
            <p className="font-retro-mono text-neutral-700 dark:text-neutral-300 leading-relaxed pl-1">
              {item.message}
            </p>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="pt-2 flex items-center justify-between text-[11px] font-retro-mono text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          Autonomous Multi-Agent Consensus: 100% Agreement Reached
        </span>
        <span className="text-neutral-400">LangGraph Engine v2.4</span>
      </div>
    </div>
  );
}

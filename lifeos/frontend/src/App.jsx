import React, { useState } from 'react';
import axios from 'axios';
import { 
  Plane, 
  Calendar, 
  DollarSign, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  MapPin, 
  CloudSun, 
  Briefcase, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  ExternalLink,
  Lock,
  RefreshCw,
  Shield,
  Building,
  User,
  TrendingDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('System Idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // LifeOS Agent State
  const [agentState, setAgentState] = useState(null);
  
  // Execution Confirmation Results
  const [executionResult, setExecutionResult] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Collapsible cards toggle state
  const [collapsedCards, setCollapsedCards] = useState({
    flights: false,
    hotels: false,
    budget: false,
    risk: false,
    conflicts: false,
    preferences: false
  });

  // Starter prompts
  const starterPrompts = [
    "I'm travelling to Bangalore next Friday",
    "I have a business trip to Paris on 2026-08-10",
    "Travelling to London next Monday, draft details"
  ];

  const handleStarterClick = (prompt) => {
    setInputText(prompt);
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setExecutionResult(null);
    setStatusMessage('Supervisor orchestrating workflow...');
    
    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: inputText
      });
      
      setAgentState(response.data);
      setStatusMessage('Workflow completed. Awaiting user approval.');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      setErrorMessage(`Error: ${detail}`);
      setStatusMessage('Workflow failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExecute = async () => {
    if (!agentState) return;

    setIsConfirming(true);
    setErrorMessage('');
    setStatusMessage('Executing automated actions...');
    
    try {
      const response = await axios.post(`${API_BASE}/confirm`, {
        state: agentState
      });
      
      setExecutionResult(response.data);
      // Update local state with the returned state from backend
      if (response.data.state) {
        setAgentState(response.data.state);
      }
      setStatusMessage('Actions successfully executed!');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      setErrorMessage(`Execution Error: ${detail}`);
      setStatusMessage('Execution failed');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setAgentState(null);
    setExecutionResult(null);
    setInputText('');
    setStatusMessage('System Idle');
    setErrorMessage('');
  };

  // Determine Agent Status
  const getAgentStatus = (agentName) => {
    if (isLoading) {
      if (agentName === 'travel' && !agentState) return 'working';
      if (agentName === 'flights' && agentState?.agent_outputs?.travel && !agentState?.agent_outputs?.flights) return 'working';
      if (agentName === 'hotels' && agentState?.agent_outputs?.flights && !agentState?.agent_outputs?.hotels) return 'working';
      if (agentName === 'budget' && agentState?.agent_outputs?.hotels && !agentState?.agent_outputs?.optimized_budget) return 'working';
      if (agentName === 'risk' && agentState?.agent_outputs?.optimized_budget && !agentState?.agent_outputs?.risk) return 'working';
      if (agentName === 'memory' && agentState?.agent_outputs?.risk && !agentState?.agent_outputs?.memory) return 'working';
      if (agentName === 'conflicts' && agentState?.agent_outputs?.memory && !agentState?.agent_outputs?.calendar_conflicts) return 'working';
      if (agentName === 'calendar' && agentState?.agent_outputs?.calendar_conflicts && !agentState?.agent_outputs?.calendar) return 'working';
      if (agentName === 'email' && agentState?.agent_outputs?.calendar && !agentState?.agent_outputs?.email) return 'working';
      return 'idle';
    }
    
    if (agentState?.agent_outputs) {
      const out = agentState.agent_outputs;
      if (agentName === 'travel' && out.travel) return 'completed';
      if (agentName === 'flights' && out.flights) return out.flights.skipped ? 'skipped' : 'completed';
      if (agentName === 'hotels' && out.hotels) return out.hotels.skipped ? 'skipped' : 'completed';
      if (agentName === 'budget' && out.optimized_budget) return 'completed';
      if (agentName === 'risk' && out.risk) return 'completed';
      if (agentName === 'memory' && out.memory) return 'completed';
      if (agentName === 'conflicts' && out.calendar_conflicts) return out.calendar_conflicts.skipped ? 'skipped' : 'completed';
      if (agentName === 'calendar' && out.calendar) return out.calendar.skipped ? 'skipped' : 'completed';
      if (agentName === 'email' && out.email) return 'completed';
    }
    
    return 'idle';
  };

  const outputs = agentState?.agent_outputs || {};
  const requiresApproval = agentState?.requires_approval && !executionResult;

  return (
    <div className="min-h-screen p-4 md:p-8 select-none">
      {/* Structural double outline vintage-style canvas wrapper */}
      <div className="w-full border-vintage bg-(--bg-cream) p-4 md:p-8 relative min-h-[90vh]">
        
        {/* Background decorative vector bursts & doodles */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-10">
          <svg className="w-96 h-96 text-(--text-charcoal)" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="40" />
            <line x1="10" y1="50" x2="90" y2="50" />
            <line x1="50" y1="10" x2="50" y2="90" />
            <circle cx="50" cy="50" r="20" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* HEADER BLOCK (Sectioned with thin lines) */}
        <header className="border-vintage flex flex-col md:flex-row justify-between items-stretch bg-white relative z-10">
          {/* Brand/Monogram */}
          <div className="flex items-center gap-4 p-4 border-vintage-b md:border-vintage-b-0 md:border-vintage-r bg-[#ffffff]">
            <div className="p-1 border-vintage rounded-none bg-(--color-terracotta) text-white shadow-[1.5px_1.5px_0px_#000]">
              <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
                <path d="M40 30 H48 V60 H65 V67 H40 Z" fill="currentColor" />
                <circle cx="68" cy="35" r="7" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black font-title tracking-tight uppercase">
                LifeOS
              </h1>
              <p className="text-[11px] font-retro-mono font-bold tracking-widest text-(--color-olive) uppercase">
                Personal Chief of Staff Co.
              </p>
            </div>
          </div>

          {/* Navigation/Status placeholder (Monospace minimalist) */}
          <div className="grow flex items-center justify-around px-6 py-4 md:py-0 border-vintage-b md:border-vintage-b-0 md:border-vintage-r text-sm font-retro-mono font-bold uppercase tracking-wider text-neutral-500">
            <span className="text-(--text-charcoal) border-b-2 border-(--color-terracotta) pb-1 cursor-default">Dashboard</span>
            <span className="hover:text-(--text-charcoal) transition-colors cursor-pointer">Pipeline Flow</span>
            <span className="hover:text-(--text-charcoal) transition-colors cursor-pointer">Agent logs</span>
          </div>

          {/* Real-time Status Tracker */}
          <div className="flex items-center gap-3 p-4 bg-(--bg-cream-dark) font-retro-mono text-sm font-bold border-vintage-b md:border-vintage-b-0">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLoading || isConfirming ? 'bg-(--color-mustard)' : requiresApproval ? 'bg-(--color-terracotta)' : 'bg-(--color-olive)'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLoading || isConfirming ? 'bg-(--color-mustard)' : requiresApproval ? 'bg-(--color-terracotta)' : 'bg-(--color-olive)'
              }`} />
            </span>
            <span className="uppercase text-(--text-charcoal)">
              {statusMessage}
            </span>
          </div>
        </header>

        {/* MAIN PANEL CONTENT SPLIT (2/3 Left, 1/3 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start relative z-10">
          
          {/* LEFT PANEL (Main Console, Pipeline & Reports) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Task Orchestrator Form Panel */}
            <div className="border-vintage bg-[#ffffff] p-6 relative overflow-hidden">
              {/* Corner Sienna Burst Illustration */}
              <div className="absolute top-2 right-4 pointer-events-none opacity-40">
                <svg className="w-12 h-12 text-(--color-terracotta) animate-pulse" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 L55 35 L85 15 L65 45 L100 50 L65 55 L85 85 L55 65 L50 100 L45 65 L15 85 L35 55 L0 50 L35 45 L15 15 L45 35 Z" />
                </svg>
              </div>

              <div className="mb-4">
                <span className="text-xs font-retro-mono font-bold uppercase tracking-widest text-(--color-terracotta) block mb-1">
                  FEATURED WORKSPACE
                </span>
                <h2 className="text-3xl font-bold font-title text-(--text-charcoal) mb-2">
                  Plan Your Journey
                </h2>
                <p className="text-sm font-body text-neutral-500 leading-relaxed max-w-xl">
                  Formulate travel instructions below. Our network of specialist agents will resolve weather, allocate budget targets, analyze schedules, and compose correspondence.
                </p>
              </div>

              <form onSubmit={handleChatSubmit} className="space-y-4">
                <div className="relative border-vintage bg-(--bg-cream)">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Travel to Bangalore next Friday, draft the details..."
                    className="w-full bg-transparent border-0 p-4 pr-12 text-base font-retro-mono focus:outline-none min-h-24 placeholder:text-neutral-450 resize-none text-(--text-charcoal)"
                    disabled={isLoading || isConfirming}
                  />
                  
                  {/* Retro Custom "ADD TO AUTOMATE" Button inspired by watches template */}
                  <div className="flex justify-end p-2 border-vintage-t bg-[#ffffff]">
                    <button
                      type="submit"
                      disabled={isLoading || isConfirming || !inputText.trim()}
                      className="btn-vintage btn-vintage-primary group relative overflow-hidden font-retro-mono"
                    >
                      <span>{isLoading ? "ORCHESTRATING..." : "RUN WORKFLOW"}</span>
                      <span className="border-vintage-l pl-2 ml-1 text-white group-hover:translate-x-0.5 transition-transform duration-200">
                        {isLoading ? "⏳" : "↘"}
                      </span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Starter Prompts - Vintage rounded badge styled pills */}
              <div className="mt-6 pt-4 border-vintage-t flex flex-wrap items-center gap-3">
                <span className="text-xs font-retro-mono font-bold uppercase text-neutral-400 tracking-wider">
                  QUICK RUNS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleStarterClick(prompt)}
                      disabled={isLoading || isConfirming}
                      className="btn-vintage-pill"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset/Clear Button */}
              {agentState && (
                <div className="mt-4 flex justify-start">
                  <button
                    onClick={handleReset}
                    className="btn-vintage text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                    Reset Console
                  </button>
                </div>
              )}

              {/* Error Box */}
              {errorMessage && (
                <div className="mt-4 bg-red-50 border-vintage p-3 flex gap-2 text-xs text-red-800 font-retro-mono">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}
            </div>

            {/* Pipeline Step Progress Flow */}
            {agentState && (
              <div className="border-vintage bg-[#ffffff] p-6">
                <div className="flex items-center gap-2 mb-4 border-vintage-b pb-3">
                  <div className="w-2.5 h-2.5 bg-(--color-terracotta) animate-pulse" />
                  <span className="text-xs font-retro-mono font-bold uppercase tracking-widest text-(--text-charcoal)">
                    AGENT PIPELINE SEQUENCER
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm font-retro-mono">
                  <span className="px-2.5 py-1 border-vintage bg-neutral-200 text-neutral-700 font-bold">START</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Travel */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('travel') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('travel') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Travel</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Flights */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('flights') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('flights') === 'skipped' ? 'bg-neutral-100 text-neutral-300 line-through' :
                    getAgentStatus('flights') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Flights</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Hotels */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('hotels') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('hotels') === 'skipped' ? 'bg-neutral-100 text-neutral-300 line-through' :
                    getAgentStatus('hotels') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Hotels</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Budget */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('budget') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('budget') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Budget</span>
                  <span className="text-neutral-450">→</span>
                  
                  {/* Risk */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('risk') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('risk') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Risk</span>
                  <span className="text-neutral-450">→</span>

                  {/* Memory */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('memory') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('memory') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Memory</span>
                  <span className="text-neutral-450">→</span>

                  {/* Conflicts */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('conflicts') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('conflicts') === 'skipped' ? 'bg-neutral-100 text-neutral-300 line-through' :
                    getAgentStatus('conflicts') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Conflicts</span>
                  <span className="text-neutral-450">→</span>
                  
                  {/* Calendar */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('calendar') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('calendar') === 'skipped' ? 'bg-neutral-100 text-neutral-300 line-through' :
                    getAgentStatus('calendar') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Calendar</span>
                  <span className="text-neutral-450">→</span>
                  
                  {/* Email */}
                  <span className={`px-2.5 py-1 border-vintage transition-all font-bold ${
                    getAgentStatus('email') === 'completed' ? 'bg-(--color-olive) text-white' :
                    getAgentStatus('email') === 'working' ? 'bg-(--color-mustard) text-(--text-charcoal) animate-pulse' :
                    'bg-[#ffffff] text-neutral-300'
                  }`}>Email</span>
                  <span className="text-neutral-450">→</span>
                  
                  <span className={`px-2.5 py-1 border-vintage font-bold ${
                    requiresApproval ? 'bg-(--color-terracotta) text-white animate-pulse' :
                    executionResult ? 'bg-(--color-olive) text-white' :
                    'bg-[#ffffff] text-neutral-350'
                  }`}>EXECUTE</span>
                </div>
              </div>
            )}

            {/* Core Agent Network Outputs - 2 Column Retro Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-vintage-b pb-2">
                <h3 className="text-xl font-bold font-title text-(--text-charcoal) uppercase tracking-tight">
                  Agent Core Deliverables
                </h3>
                <div className="text-xs font-retro-mono font-bold bg-[#ffffff] py-1 px-3 border-vintage shadow-[1px_1px_0px_#000]">
                  10 ACTIVE NODES
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Travel Agent Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 01 // GEOLOCATOR
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('travel') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('travel') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('travel')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Travel & Packing</h4>
                    
                    {outputs.travel ? (
                      <div className="space-y-2.5 text-sm">
                        <div className="font-retro-mono font-bold text-(--color-terracotta) flex items-center gap-1.5">
                          <span>📍 {outputs.travel.city} ({outputs.travel.dates})</span>
                        </div>
                        <div className="border-vintage bg-(--bg-cream) p-2 font-body text-xs leading-relaxed italic">
                          "{outputs.travel.weather_summary}"
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-neutral-500 font-retro-mono block mb-1">SUGGESTED PACKING:</span>
                          <div className="flex flex-wrap gap-1 font-retro-mono">
                            {outputs.travel.packing_list?.map((item, idx) => (
                              <span key={idx} className="bg-neutral-100 px-1.5 py-0.5 border-vintage text-xs font-semibold">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Running weather geocoding..." : "Awaiting travel coordinates..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Finance Agent Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 02 // FINANCIALS
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('finance') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('finance') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-450'
                      }`}>
                        {getAgentStatus('finance')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Cost Projections</h4>
                    
                    {outputs.finance ? (
                      <div className="font-retro-mono text-sm space-y-1 bg-(--bg-cream) border-vintage p-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">LODGING:</span>
                          <span className="font-bold text-(--text-charcoal)">INR {outputs.finance.lodging}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">TRANSIT:</span>
                          <span className="font-bold text-(--text-charcoal)">INR {outputs.finance.transit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">FOOD:</span>
                          <span className="font-bold text-(--text-charcoal)">INR {outputs.finance.food}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">ACTIVITIES:</span>
                          <span className="font-bold text-(--text-charcoal)">INR {outputs.finance.activities}</span>
                        </div>
                        <div className="border-t border-vintage pt-1 mt-1 flex justify-between font-bold text-(--color-terracotta)">
                          <span>TOTAL EST:</span>
                          <span>INR {outputs.finance.total}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Estimating lodging & food costs..." : "Awaiting financial details..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Flight Search Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 03 // FLIGHTS
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('flights') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('flights') === 'skipped' ? 'bg-neutral-100 text-neutral-400 line-through' :
                        getAgentStatus('flights') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('flights')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Flight Search</h4>
                    
                    {outputs.flights ? (
                      outputs.flights.skipped ? (
                        <div className="bg-(--bg-cream) border-vintage p-3 text-xs font-retro-mono text-neutral-500 italic text-center border-t border-dashed border-neutral-300 mt-2">
                          {outputs.flights.reason}
                        </div>
                      ) : (
                        <div className="space-y-2 border-t border-dashed border-neutral-300 pt-3 mt-2">
                          {outputs.flights.map((flight, idx) => (
                            <div key={idx} className={`p-2 border-vintage font-retro-mono text-xs ${idx === 0 ? 'bg-(--bg-cream-dark)' : 'bg-white'}`}>
                              <div className="flex justify-between font-bold">
                                <span>✈️ {flight.airline}</span>
                                <span className="text-(--color-terracotta)">INR {flight.price}</span>
                              </div>
                              <div className="text-neutral-500 text-xs mt-0.5">
                                {flight.departure} → {flight.arrival} ({flight.duration}h) • {flight.stops} stop(s)
                              </div>
                              <div className="flex justify-between text-xs mt-1 text-neutral-400 pt-1 border-t border-neutral-100">
                                <span>Rating: {flight.rating}⭐</span>
                                <span className="font-bold">Weighted Score: {flight.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Searching best flights..." : "Awaiting search parameters..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hotel Recommendations Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 04 // LODGING
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('hotels') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('hotels') === 'skipped' ? 'bg-neutral-100 text-neutral-400 line-through' :
                        getAgentStatus('hotels') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('hotels')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Hotel Recommendations</h4>
                    
                    {outputs.hotels ? (
                      outputs.hotels.skipped ? (
                        <div className="bg-(--bg-cream) border-vintage p-3 text-xs font-retro-mono text-neutral-500 italic text-center border-t border-dashed border-neutral-300 mt-2">
                          {outputs.hotels.reason}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-t border-dashed border-neutral-300 pt-3 mt-2">
                          {outputs.hotels.map((hotel, idx) => (
                            <div key={idx} className="p-2 border-vintage font-retro-mono text-xs bg-white space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>🏢 {hotel.name}</span>
                                <span>INR {hotel.price}/night</span>
                              </div>
                              <div className="text-neutral-500 text-xs">
                                Category: {hotel.category} • Dist: {hotel.distance}km • Safety: {hotel.safety_score}/100
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities?.map((am, i) => (
                                  <span key={i} className="text-[10px] px-1 bg-neutral-100 border-vintage">{am}</span>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-neutral-450 border-t border-neutral-100 pt-1">
                                <span>Rating: {hotel.rating}⭐</span>
                                <span className="font-bold text-(--color-olive)">Score: {hotel.overall_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Finding matching lodging..." : "Awaiting search parameters..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Budget Optimization Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 05 // BUDGET
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('budget') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('budget') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('budget')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Budget Target</h4>
                    
                    {outputs.optimized_budget ? (
                      <div className="space-y-3 font-retro-mono text-xs border-t border-dashed border-neutral-300 pt-3 mt-2">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="bg-neutral-100 p-1 border-vintage">
                            <span className="text-[10px] text-neutral-450 block uppercase">ESTIMATED</span>
                            <span className="font-bold">INR {outputs.optimized_budget.original_cost}</span>
                          </div>
                          <div className="bg-(--bg-cream-dark) p-1 border-vintage">
                            <span className="text-[10px] text-(--color-olive) block uppercase">OPTIMIZED</span>
                            <span className="font-bold text-(--color-olive)">INR {outputs.optimized_budget.optimized_cost}</span>
                          </div>
                          <div className="bg-(--color-terracotta) p-1 border-vintage text-white">
                            <span className="text-[10px] block uppercase opacity-80">SAVINGS</span>
                            <span className="font-bold">INR {outputs.optimized_budget.savings}</span>
                          </div>
                        </div>
                        <div className="bg-(--bg-cream) border-vintage p-2">
                          <span className="font-bold block text-[10px] text-neutral-500 uppercase mb-1">TRIMMING STRATEGIES:</span>
                          <ul className="list-disc pl-3.5 space-y-0.5 text-neutral-600 leading-normal text-xs">
                            {outputs.optimized_budget.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Optimizing budget target..." : "Awaiting budget targets..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Risk & Safety Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 06 // RISK
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('risk') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('risk') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('risk')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Risk & Safety</h4>
                    
                    {outputs.risk ? (
                      <div className="space-y-3 font-retro-mono text-xs border-t border-dashed border-neutral-300 pt-3 mt-2">
                        <div className="flex justify-between items-center border-vintage bg-neutral-100 p-2">
                          <span className="font-bold">SAFETY RANK:</span>
                          <span className={`px-2 py-0.5 font-bold border-vintage uppercase text-xs ${
                            outputs.risk.risk_level === 'High' ? 'bg-(--color-terracotta) text-white' :
                            outputs.risk.risk_level === 'Medium' ? 'bg-(--color-mustard)' : 'bg-(--color-olive) text-white'
                          }`}>{outputs.risk.risk_level} ({outputs.risk.score}/100)</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-1 border-vintage rounded-none overflow-hidden">
                          <div 
                            className="h-full bg-(--color-terracotta)"
                            style={{ width: `${outputs.risk.score}%` }}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-bold text-neutral-500 uppercase block">IDENTIFIED RISK FACTORS:</span>
                            <ul className="list-disc pl-3 text-neutral-600 space-y-0.5">
                              {outputs.risk.risks?.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div className="bg-(--bg-cream) border-vintage p-2 text-xs">
                            <span className="font-bold text-(--color-terracotta) uppercase block mb-1">MITIGATION SCHEME:</span>
                            <ul className="list-disc pl-3 text-neutral-650 space-y-0.5">
                              {outputs.risk.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Evaluating risk factors..." : "Awaiting destination parameters..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* User Memory Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 07 // USER PROFILE
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('memory') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('memory') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('memory')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">User Memory</h4>
                    
                    {outputs.memory ? (
                      <div className="space-y-3 font-retro-mono text-xs border-t border-dashed border-neutral-300 pt-3 mt-2">
                        <div className="bg-(--bg-cream) border-vintage p-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">AIRLINE PREF:</span>
                            <span className="font-bold">{outputs.memory.preferred_airline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">HOTEL TYPOLOGY:</span>
                            <span className="font-bold">{outputs.memory.preferred_hotel_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">RESTRICTIONS:</span>
                            <span className="font-bold">{outputs.memory.seat} / {outputs.memory.meal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">HOME CITY:</span>
                            <span className="font-bold">{outputs.memory.home_city}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-neutral-450 block uppercase text-[10px] mb-1">FREQUENT STOPS:</span>
                          <div className="flex flex-wrap gap-1 font-retro-mono">
                            {outputs.memory.frequently_visited_cities?.map((city, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-white border-vintage font-bold">{city}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Resolving custom preferences..." : "Awaiting user profile lookup..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Schedule Conflicts Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 08 // CONFLICTS
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('conflicts') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('conflicts') === 'skipped' ? 'bg-neutral-100 text-neutral-400 line-through' :
                        getAgentStatus('conflicts') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {getAgentStatus('conflicts')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Schedule Conflicts</h4>
                    
                    {outputs.calendar_conflicts ? (
                      outputs.calendar_conflicts.skipped ? (
                        <div className="bg-(--bg-cream) border-vintage p-3 text-xs font-retro-mono text-neutral-550 italic text-center border-t border-dashed border-neutral-300 mt-2">
                          {outputs.calendar_conflicts.reason}
                        </div>
                      ) : (
                        <div className="space-y-2.5 font-retro-mono text-xs border-t border-dashed border-neutral-300 pt-3 mt-2">
                          {outputs.calendar_conflicts.hasConflict ? (
                            <div className="bg-red-50 border-vintage p-2.5 text-red-900 space-y-1">
                              <span className="font-bold block text-[10px] uppercase tracking-wider">CONFLICT DETECTED:</span>
                              <ul className="list-disc pl-3.5 space-y-0.5">
                                {outputs.calendar_conflicts.conflicts?.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-(--bg-cream-dark) border-vintage p-2 text-(--color-olive) text-xs font-bold flex items-center gap-1.5">
                              <span>✔</span>
                              <span>No scheduling conflicts detected. Slots clear.</span>
                            </div>
                          )}
                          {outputs.calendar_conflicts.suggestedSlots?.length > 0 && (
                            <div>
                              <span className="font-bold text-neutral-450 block uppercase text-[10px] mb-1">ALTERNATES SUGGESTED:</span>
                              <div className="space-y-1">
                                {outputs.calendar_conflicts.suggestedSlots.map((slot, i) => (
                                  <div key={i} className="p-1.5 bg-neutral-100 border-vintage font-bold text-neutral-700">
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        {isLoading ? "Running conflict scan..." : "Awaiting calendar conflicts check..."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Calendar Agent Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 09 // SCHEDULER
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('calendar') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('calendar') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-450'
                      }`}>
                        {getAgentStatus('calendar')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Calendar Scheduler</h4>
                    
                    {outputs.calendar ? (
                      <div className="space-y-2 text-sm border-t border-dashed border-neutral-300 pt-3 mt-2">
                        <div className="font-bold text-(--text-charcoal) font-title text-sm">{outputs.calendar.summary}</div>
                        <div className="font-retro-mono text-xs space-y-0.5 bg-(--bg-cream) border-vintage p-2">
                          <div className="text-neutral-500">START: {outputs.calendar.start_time}</div>
                          <div className="text-neutral-500">END: {outputs.calendar.end_time}</div>
                          <div className="text-neutral-500">VENUE: {outputs.calendar.location}</div>
                        </div>
                        <p className="text-xs text-neutral-550 italic font-body">"{outputs.calendar.description}"</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        Awaiting travel schedule instructions...
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Agent Card */}
                <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                        NODE 10 // CORRESPONDENCE
                      </span>
                      <span className={`text-xs font-retro-mono font-bold px-2 py-0.5 border-vintage uppercase ${
                        getAgentStatus('email') === 'completed' ? 'bg-(--color-olive) text-white' :
                        getAgentStatus('email') === 'working' ? 'bg-(--color-mustard) animate-pulse' : 'bg-neutral-100 text-neutral-450'
                      }`}>
                        {getAgentStatus('email')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-(--text-charcoal) mb-2">Email Correspondence</h4>
                    
                    {outputs.email ? (
                      <div className="space-y-1.5 text-sm border-t border-dashed border-neutral-300 pt-3 mt-2">
                        <div className="font-retro-mono text-xs">
                          <div><span className="text-neutral-500">TO:</span> <span className="font-bold">{outputs.email.to}</span></div>
                          <div><span className="text-neutral-500">SUBJ:</span> <span className="font-bold">{outputs.email.subject}</span></div>
                        </div>
                        <div className="bg-(--bg-cream) border-vintage p-2 text-xs font-retro-mono max-h-20 overflow-y-auto whitespace-pre-line text-neutral-600">
                          {outputs.email.body}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-250 mt-2">
                        Awaiting details to generate correspondence draft...
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT PANEL (Retro Badge, Analog Watch Graphic, Live Console Log, Execute Drawers) */}
          <div className="space-y-6">
            
            {/* Dark Retro Status/Console Block */}
            <div className="bg-(--bg-dark) text-(--text-light) border-vintage p-6 relative overflow-hidden shadow-[4px_4px_0px_#2A2725] min-h-145 flex flex-col justify-between">
              
              {/* Burnt Orange & Mustard Burst Badge */}
              <div className="absolute top-3 right-3 transform rotate-12 z-20 hover:scale-105 transition-transform duration-200">
                <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 L60 25 L85 15 L75 40 L100 50 L75 60 L85 85 L60 75 L50 100 L40 75 L15 85 L25 60 L0 50 L25 40 L15 15 L40 25 Z" fill="var(--color-mustard)" stroke="var(--border-charcoal)" strokeWidth="4" />
                  <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="var(--text-charcoal)" fontWeight="900" fontSize="12" fontFamily="Courier Prime, monospace">
                    {isLoading ? "RUNNING" : agentState ? "ACTIVE" : "STANDBY"}
                  </text>
                </svg>
              </div>

              {/* Pocket Watch Graphic Container */}
              <div className="border-vintage-b border-neutral-700 pb-6 text-center">
                <div className="relative inline-block mt-4 mb-2 bg-[#ffffff]/5 p-3 rounded-full border border-neutral-800">
                  {/* Detailed Vector Vintage Watch Face SVG */}
                  <svg className={`h-32 w-32 mx-auto ${isLoading ? "animate-[spin_10s_linear_infinite]" : "animate-[spin_40s_linear_infinite]"}`} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="3" fill="#201F1D" />
                    <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Hour Numbers */}
                    <text x="60" y="24" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Georgia" fontWeight="bold">XII</text>
                    <text x="96" y="63" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Georgia" fontWeight="bold">III</text>
                    <text x="60" y="103" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Georgia" fontWeight="bold">VI</text>
                    <text x="24" y="63" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Georgia" fontWeight="bold">IX</text>
                    
                    {/* Hands */}
                    <path d="M60 60 L78 40" stroke="var(--color-terracotta)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M60 60 L42 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="60" y1="60" x2="60" y2="28" stroke="var(--color-mustard)" strokeWidth="1" />
                    
                    {/* Center point */}
                    <circle cx="60" cy="60" r="4" fill="var(--color-mustard)" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <h4 className="font-title font-bold text-base tracking-wide text-white uppercase mt-2">
                  System Chronometer
                </h4>
                <p className="text-xs font-retro-mono text-neutral-450 tracking-wider">
                  MODEL NO. L-OS // AUTOMATION ENGINE
                </p>
              </div>

              {/* Vintage Typewriter console logs section */}
              <div className="grow my-6 flex flex-col justify-start">
                <span className="text-xs font-retro-mono font-bold text-(--color-mustard) uppercase tracking-wider mb-2 block">
                  SYS.CONSOLE LOGS:
                </span>
                
                <div className="bg-[#151413] border border-neutral-800 p-4 rounded-none font-retro-mono text-xs text-neutral-350 space-y-2 grow min-h-45 overflow-y-auto leading-normal">
                  <div className="text-(--color-olive)">&gt; LifeOS Personal Automation System Init...</div>
                  <div className="text-neutral-500">&gt; UTC Clock sync verified.</div>
                  
                  {isLoading && (
                    <div className="text-(--color-mustard) animate-pulse">
                      &gt; Orchestrating: Contacting travel, finance, calendar agents...
                    </div>
                  )}

                  {agentState ? (
                    <>
                      <div className="text-white">&gt; State output loaded. Awaiting confirmation.</div>
                      <div className="text-(--color-mustard)">&gt; Proposed calendar event extracted.</div>
                      <div className="text-(--color-mustard)">&gt; Proposed email draft composed.</div>
                      {executionResult && (
                        <div className="text-(--color-olive) font-bold">&gt; EXECUTION STATUS: SUCCESS!</div>
                      )}
                    </>
                  ) : (
                    <div className="text-neutral-650">&gt; Standby. Enter travel request to launch thread.</div>
                  )}
                </div>
              </div>

              {/* Quote / Sub-text decoration */}
              <div className="border-t border-neutral-800 pt-4 text-center">
                <p className="text-xs italic font-body text-neutral-400 leading-relaxed px-4">
                  "Orchestration is a way to say where you want to go without booking it yourself."
                </p>
              </div>

            </div>

            {/* HUMAN REVIEW DRAWER / EXECUTION INTERFACES */}
            {requiresApproval && (
              <div className="border-vintage p-5 bg-(--bg-cream-dark) space-y-4 animate-fade-in relative shadow-[3px_3px_0px_#000]">
                
                <div className="flex items-start gap-2.5">
                  <div className="p-1 border-vintage bg-(--color-terracotta) text-white text-xs font-bold font-retro-mono">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-base text-(--text-charcoal)">
                      Pending Authorization
                    </h4>
                    <p className="text-xs text-neutral-500 font-retro-mono leading-tight">
                      Verify draft event & email files before final system commit.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#ffffff] p-4 border-vintage font-retro-mono text-xs shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-(--color-terracotta) uppercase tracking-wider block">
                      [ ] PROPOSED EVENT payload:
                    </span>
                    <div className="text-xs font-title font-bold text-(--text-charcoal)">
                      {outputs.calendar?.summary}
                    </div>
                    <div className="text-neutral-500 text-xs">
                      {outputs.calendar?.start_time} // {outputs.calendar?.location}
                    </div>
                  </div>
                  
                  <div className="border-t border-dashed border-neutral-300 pt-2 space-y-1">
                    <span className="text-[10px] font-bold text-(--color-terracotta) uppercase tracking-wider block">
                      [ ] PROPOSED EMAIL payload:
                    </span>
                    <div className="font-bold text-(--text-charcoal) truncate">
                      {outputs.email?.subject}
                    </div>
                    <div className="text-neutral-500 text-xs truncate">
                      Recipient: {outputs.email?.to}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    onClick={handleReset}
                    className="btn-vintage text-xs bg-white"
                    disabled={isConfirming}
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleConfirmExecute}
                    className="btn-vintage btn-vintage-primary btn-vintage-accent text-xs font-bold shadow-[2px_2px_0px_#000]"
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <span>Executing...</span>
                    ) : (
                      <span>Approve & Write</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SYSTEM SUCCESS EXECUTION RECEIPT */}
            {executionResult && (
              <div className="border-vintage p-5 bg-(--bg-cream-dark) space-y-4 animate-fade-in shadow-[3px_3px_0px_#000]">
                
                <div className="flex items-center gap-2.5">
                  <div className="p-1 border-vintage bg-(--color-olive) text-white text-xs font-bold font-retro-mono">
                    ✔
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-base text-(--text-charcoal)">
                      Commit Successful
                    </h4>
                    <p className="text-xs text-neutral-550 font-retro-mono">
                      All remote writes completed successfully.
                    </p>
                  </div>
                </div>

                <div className="bg-[#ffffff] p-4 border-vintage font-retro-mono text-xs space-y-2.5 shadow-inner overflow-hidden">
                  <div className="flex flex-col gap-1 leading-snug">
                    <span className="font-bold text-(--color-olive)">CALENDAR STATE:</span>
                    <span className="text-neutral-650 font-semibold break-all">{executionResult.calendar_status}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 leading-snug border-t border-dashed border-neutral-200 pt-2">
                    <span className="font-bold text-(--color-olive)">GMAIL STATE:</span>
                    <span className="text-neutral-650 font-semibold break-all">{executionResult.email_status}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

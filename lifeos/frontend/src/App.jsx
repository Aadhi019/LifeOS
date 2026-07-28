import React, { useState, useEffect } from 'react';
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

function SystemChronometer({ isLoading, agentState }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // If loading, update fast to spin the needle. Otherwise, update slowly.
    const delay = isLoading ? 50 : 1000;
    const timer = setInterval(() => {
      setTime(new Date());
    }, delay);
    return () => clearInterval(timer);
  }, [isLoading]);

  // Count completed processes
  let completedCount = 0;
  if (agentState?.agent_outputs) {
    const out = agentState.agent_outputs;
    if (out.travel) completedCount += 1;
    if (out.flights) completedCount += 1;
    if (out.hotels) completedCount += 1;
    if (out.optimized_budget) completedCount += 1;
    if (out.risk) completedCount += 1;
    if (out.memory) completedCount += 1;
    if (out.calendar_conflicts) completedCount += 1;
    if (out.calendar) completedCount += 1;
    if (out.email) completedCount += 1;
  }

  // Angle calculations
  const progressAngle = completedCount * 40; // 9 steps * 40 deg = 360 deg
  
  // Continuous rotation during loading
  const spinSpeed = time.getTime();
  const rotation = isLoading ? (spinSpeed / 3) % 360 : progressAngle;

  return (
    <svg className={`h-36 w-36 mx-auto ${isLoading ? "animate-pulse" : ""}`} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="neu-dark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="#090a0c" flood-opacity="0.6"/>
          <feDropShadow dx="-3" dy="-3" stdDeviation="3" flood-color="#2a2e34" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      {/* Dial Face Outer Shadow */}
      <circle cx="60" cy="60" r="50" fill="#1b1e22" filter="url(#neu-dark-shadow)" />
      {/* Outer ticks */}
      <circle cx="60" cy="60" r="44" stroke="#2a2e34" strokeWidth="1" strokeDasharray="2 3" fill="none" />
      
      {/* Inner raised knob */}
      <circle cx="60" cy="60" r="32" fill="#22252a" stroke="#131518" strokeWidth="1" />
      <circle cx="60" cy="60" r="26" fill="#1b1e22" />
      
      {/* Red marker ticks at 12, 3, 6, 9 o'clock */}
      <line x1="60" y1="20" x2="60" y2="24" stroke="#ff4b2b" strokeWidth="2" />
      <line x1="60" y1="96" x2="60" y2="100" stroke="#ff4b2b" strokeWidth="1" />
      <line x1="20" y1="60" x2="24" y2="60" stroke="#ff4b2b" strokeWidth="1" />
      <line x1="96" y1="60" x2="100" y2="60" stroke="#ff4b2b" strokeWidth="1" />

      {/* Progress needle */}
      <line 
        x1="60" 
        y1="60" 
        x2="60" 
        y2="34" 
        stroke="#ff4b2b" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        transform={`rotate(${rotation} 60 60)`} 
        style={{ transition: isLoading ? 'none' : 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} 
      />
      
      {/* Center point */}
      <circle cx="60" cy="60" r="7" fill="#131518" stroke="#ff4b2b" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="3.5" fill="#ff4b2b" />
    </svg>
  );
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [sessionStartTime] = useState(() => new Date());

  const formatLogTime = (offsetSeconds) => {
    const logTime = new Date(sessionStartTime.getTime() + offsetSeconds * 1000);
    const tzoffset = logTime.getTimezoneOffset() * 60000;
    return new Date(logTime - tzoffset).toISOString().slice(0, 19).replace('T', ' ');
  };
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('System Idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // LifeOS Agent State
  const [agentState, setAgentState] = useState(null);
  
  // Execution Confirmation Results
  const [executionResult, setExecutionResult] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Active navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="min-h-screen p-4 md:p-8 select-none bg-(--bg-cream)">
      {/* Soft UI canvas wrapper */}
      <div className="w-full p-4 md:p-8 relative min-h-[90vh]">
        
        {/* Background decorative vector bursts - removed for clean neumorphism */}

        {/* HEADER BLOCK (Soft UI header card) */}
        <header className="card-vintage flex flex-col md:flex-row justify-between items-center p-4 md:p-6 mb-8 relative z-10 rounded-3xl">
          {/* Brand/Monogram */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-linear-to-br from-[#ff416c] to-[#ff4b2b] text-white shadow-[3px_3px_8px_rgba(255,75,43,0.35)]">
              <svg className="h-7 w-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="8" />
                <path d="M42 35 V62 H62" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="66" cy="42" r="7" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black font-title tracking-tight uppercase text-neutral-800">
                LifeOS
              </h1>
              <p className="text-[10px] font-retro-mono font-bold tracking-wider text-neutral-400 uppercase">
                Personal Chief of Staff Co.
              </p>
            </div>
          </div>

          {/* Navigation/Status placeholder (Neumorphic Tabs) */}
          <div className="flex items-center gap-2 my-4 md:my-0 px-4 py-2 rounded-full panel-neu-inset text-xs font-bold uppercase tracking-wider text-neutral-500">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'text-neutral-800 bg-(--bg-cream) shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_#fff] font-bold' 
                  : 'hover:text-neutral-700'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'pipeline' 
                  ? 'text-neutral-800 bg-(--bg-cream) shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_#fff] font-bold' 
                  : 'hover:text-neutral-700'
              }`}
            >
              Pipeline Flow
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'logs' 
                  ? 'text-neutral-800 bg-(--bg-cream) shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_#fff] font-bold' 
                  : 'hover:text-neutral-700'
              }`}
            >
              Agent logs
            </button>
          </div>

          {/* Real-time Status Tracker */}
          <div className="flex items-center gap-3 py-2 px-4 rounded-full panel-neu-inset font-retro-mono text-xs font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLoading || isConfirming ? 'bg-amber-500' : requiresApproval ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLoading || isConfirming ? 'bg-amber-500' : requiresApproval ? 'bg-red-500' : 'bg-green-500'
              }`} />
            </span>
            <span className="uppercase text-neutral-600">
              {statusMessage}
            </span>
          </div>
        </header>

        {/* MAIN PANEL CONTENT SPLIT (2/3 Left, 1/3 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start relative z-10">
          
          {activeTab === 'dashboard' && (
            <>
              {/* LEFT PANEL (Main Console, Pipeline & Reports) */}
              <div className="lg:col-span-2 space-y-8">
            
            {/* Task Orchestrator Form Panel */}
            <div className="card-vintage p-6 relative overflow-hidden">
              <div className="mb-4">
                <span className="text-xs font-retro-mono font-bold uppercase tracking-wider text-(--color-terracotta) block mb-1">
                  FEATURED WORKSPACE
                </span>
                <h2 className="text-3xl font-bold font-title text-neutral-800 mb-2">
                  Plan Your Journey
                </h2>
                <p className="text-sm font-body text-neutral-500 leading-relaxed max-w-xl">
                  Formulate travel instructions below. Our network of specialist agents will resolve weather, allocate budget targets, analyze schedules, and compose correspondence.
                </p>
              </div>

              <form onSubmit={handleChatSubmit} className="space-y-4">
                <div className="relative panel-neu-inset p-1 bg-(--bg-cream)">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Travel to Bangalore next Friday, draft the details..."
                    className="w-full bg-transparent border-0 p-4 text-base font-body focus:outline-none min-h-24 placeholder:text-neutral-400 resize-none"
                    style={{ color: '#374151' }}
                    disabled={isLoading || isConfirming}
                  />
                  
                  {/* Submit Button */}
                  <div className="flex justify-end p-2 bg-transparent">
                    <button
                      type="submit"
                      disabled={isLoading || isConfirming || !inputText.trim()}
                      className="btn-vintage btn-vintage-primary group font-body"
                    >
                      <span>{isLoading ? "ORCHESTRATING..." : "RUN WORKFLOW"}</span>
                      <span className="pl-2 ml-1 text-white group-hover:translate-x-0.5 transition-transform duration-200">
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
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset Console
                  </button>
                </div>
              )}

              {/* Error Box */}
              {errorMessage && (
                <div className="mt-4 bg-red-50/80 border border-red-200/50 rounded-2xl p-4 flex gap-3 text-xs text-red-800 font-body shadow-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}
            </div>

            {/* Pipeline Step Progress Flow */}
            {agentState && (
              <div className="card-vintage p-6">
                <div className="flex items-center gap-2 mb-4 border-vintage-b pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-(--color-terracotta) animate-pulse shadow-[0_0_8px_var(--color-terracotta)]" />
                  <span className="text-xs font-retro-mono font-bold uppercase tracking-widest text-neutral-700">
                    AGENT PIPELINE SEQUENCER
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-retro-mono">
                  <span className="px-3 py-1.5 rounded-full panel-neu-inset text-neutral-500 font-bold">START</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Travel */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('travel') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('travel') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Travel</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Flights */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('flights') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('flights') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                    getAgentStatus('flights') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Flights</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Hotels */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('hotels') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('hotels') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                    getAgentStatus('hotels') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Hotels</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Budget */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('budget') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('budget') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Budget</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Risk */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('risk') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('risk') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Risk</span>
                  <span className="text-neutral-400">→</span>

                  {/* Memory */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('memory') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('memory') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Memory</span>
                  <span className="text-neutral-400">→</span>

                  {/* Conflicts */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('conflicts') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('conflicts') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                    getAgentStatus('conflicts') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Conflicts</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Calendar */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('calendar') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('calendar') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                    getAgentStatus('calendar') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Calendar</span>
                  <span className="text-neutral-400">→</span>
                  
                  {/* Email */}
                  <span className={`px-3 py-1.5 rounded-full transition-all font-bold ${
                    getAgentStatus('email') === 'completed' ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    getAgentStatus('email') === 'working' ? 'bg-linear-to-r from-amber-500 to-yellow-400 text-white animate-pulse shadow-[2px_2px_5px_rgba(255,177,20,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>Email</span>
                  <span className="text-neutral-400">→</span>
                  
                  <span className={`px-3 py-1.5 rounded-full font-bold ${
                    requiresApproval ? 'bg-linear-to-r from-rose-500 to-red-500 text-white animate-pulse shadow-[2px_2px_5px_rgba(239,68,68,0.3)]' :
                    executionResult ? 'bg-linear-to-r from-emerald-500 to-green-400 text-white shadow-[2px_2px_5px_rgba(46,204,113,0.3)]' :
                    'bg-transparent text-neutral-400 shadow-inner'
                  }`}>EXECUTE</span>
                </div>
              </div>
            )}

            {/* Core Agent Network Outputs - Neumorphic Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-vintage-b pb-2">
                <h3 className="text-xl font-bold font-title text-neutral-800 uppercase tracking-tight">
                  Agent Core Deliverables
                </h3>
                <div className="text-xs font-retro-mono font-bold py-1.5 px-3 rounded-full panel-neu-inset">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('travel') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('travel') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('travel')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Travel & Packing</h4>
                    
                    {outputs.travel ? (
                      <div className="space-y-2.5 text-sm">
                        <div className="font-retro-mono font-bold text-(--color-terracotta) flex items-center gap-1.5">
                          <span>📍 {outputs.travel.city} ({outputs.travel.dates})</span>
                        </div>
                        <div className="panel-neu-inset bg-(--bg-cream) p-3 font-body text-xs leading-relaxed italic text-neutral-600">
                          "{outputs.travel.weather_summary}"
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-neutral-500 font-retro-mono block mb-1">SUGGESTED PACKING:</span>
                          <div className="flex flex-wrap gap-1 font-retro-mono">
                            {outputs.travel.packing_list?.map((item, idx) => (
                              <span key={idx} className="bg-(--bg-cream) px-2 py-0.5 rounded-full shadow-sm text-xs font-semibold text-neutral-600">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('finance') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('finance') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('finance')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Cost Projections</h4>
                    
                    {outputs.finance ? (
                      <div className="font-retro-mono text-xs space-y-1.5 bg-transparent p-2">
                        <div className="flex justify-between py-1 border-b border-white/40">
                          <span className="text-neutral-400">LODGING:</span>
                          <span className="font-bold text-neutral-600">INR {outputs.finance.lodging}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/40">
                          <span className="text-neutral-400">TRANSIT:</span>
                          <span className="font-bold text-neutral-600">INR {outputs.finance.transit}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/40">
                          <span className="text-neutral-400">FOOD:</span>
                          <span className="font-bold text-neutral-600">INR {outputs.finance.food}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/40">
                          <span className="text-neutral-400">ACTIVITIES:</span>
                          <span className="font-bold text-neutral-600">INR {outputs.finance.activities}</span>
                        </div>
                        <div className="pt-2 mt-1 flex justify-between font-bold text-(--color-terracotta) border-t-2 border-white/60">
                          <span>TOTAL EST:</span>
                          <span>INR {outputs.finance.total}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('flights') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('flights') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                        getAgentStatus('flights') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('flights')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Flight Search</h4>
                    
                    {outputs.flights ? (
                      outputs.flights.skipped ? (
                        <div className="panel-neu-inset p-3 text-xs font-retro-mono text-neutral-500 italic text-center mt-2">
                          {outputs.flights.reason}
                        </div>
                      ) : (
                        <div className="space-y-2 pt-3 mt-2 border-t border-white/50">
                          {outputs.flights.map((flight, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl font-retro-mono text-xs transition-all mb-2 ${idx === 0 ? 'panel-neu-inset font-semibold' : 'card-vintage shadow-sm bg-(--bg-cream)'}`}>
                              <div className="flex justify-between font-bold text-neutral-700">
                                <span>✈️ {flight.airline}</span>
                                <span className="text-(--color-terracotta)">INR {flight.price}</span>
                              </div>
                              <div className="text-neutral-500 text-xs mt-0.5">
                                {flight.origin && flight.destination && (
                                  <div className="font-bold text-neutral-600 mb-1 text-[10px] uppercase tracking-wider">
                                    {flight.origin} ➔ {flight.destination}
                                  </div>
                                )}
                                {flight.departure} → {flight.arrival} ({flight.duration}h) • {flight.stops} stop(s)
                              </div>
                              <div className="flex justify-between text-xs mt-2 text-neutral-450 pt-1.5 border-t border-white/40">
                                <span>Rating: {flight.rating}⭐</span>
                                <span className="font-bold text-neutral-500">Score: {flight.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-350 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('hotels') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('hotels') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                        getAgentStatus('hotels') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('hotels')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Hotel Recommendations</h4>
                    
                    {outputs.hotels ? (
                      outputs.hotels.skipped ? (
                        <div className="panel-neu-inset p-3 text-xs font-retro-mono text-neutral-500 italic text-center mt-2">
                          {outputs.hotels.reason}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 pt-3 mt-2 border-t border-white/50">
                          {outputs.hotels.map((hotel, idx) => (
                            <div key={idx} className="p-3 rounded-2xl font-retro-mono text-xs card-vintage bg-(--bg-cream) space-y-1.5 mb-2 shadow-sm">
                              <div className="flex justify-between font-bold text-neutral-700">
                                <span>🏢 {hotel.name}</span>
                                <span>INR {hotel.price}/night</span>
                              </div>
                              <div className="text-neutral-500 text-xs">
                                Category: {hotel.category} • Dist: {hotel.distance}km • Safety: {hotel.safety_score}/100
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities?.map((am, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-(--bg-cream) rounded-full shadow-sm text-neutral-600">{am}</span>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-neutral-400 border-t border-white/40 pt-1.5 mt-1">
                                <span>Rating: {hotel.rating}⭐</span>
                                <span className="font-bold text-(--color-olive)">Score: {hotel.overall_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('budget') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('budget') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('budget')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Budget Target</h4>
                    
                    {outputs.optimized_budget ? (
                      <div className="space-y-3 font-retro-mono text-xs pt-3 mt-2 border-t border-white/50">
                        <div className="grid grid-cols-3 gap-2 text-center font-bold">
                          <div className="panel-neu-inset p-2 rounded-xl bg-(--bg-cream)">
                            <span className="text-[9px] text-neutral-450 block uppercase">ESTIMATED</span>
                            <span className="font-bold text-neutral-600">INR {outputs.optimized_budget.original_cost}</span>
                          </div>
                          <div className="card-vintage p-2 rounded-xl bg-(--bg-cream) shadow-sm">
                            <span className="text-[9px] text-(--color-olive) block uppercase">OPTIMIZED</span>
                            <span className="font-bold text-(--color-olive)">INR {outputs.optimized_budget.optimized_cost}</span>
                          </div>
                          <div className="bg-linear-to-br from-rose-500 to-red-500 p-2 rounded-xl text-white shadow-sm">
                            <span className="text-[9px] block uppercase opacity-90">SAVINGS</span>
                            <span className="font-bold">INR {outputs.optimized_budget.savings}</span>
                          </div>
                        </div>
                        <div className="panel-neu-inset bg-(--bg-cream) p-3 rounded-2xl">
                          <span className="font-bold block text-[10px] text-neutral-500 uppercase mb-1.5">TRIMMING STRATEGIES:</span>
                          <ul className="list-disc pl-4 space-y-1 text-neutral-600 leading-relaxed text-xs">
                            {outputs.optimized_budget.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('risk') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('risk') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('risk')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Risk & Safety</h4>
                    
                    {outputs.risk ? (
                      <div className="space-y-3 font-retro-mono text-xs pt-3 mt-2 border-t border-white/50">
                        <div className="flex justify-between items-center rounded-xl panel-neu-inset p-2 bg-(--bg-cream)">
                          <span className="font-bold text-neutral-500">SAFETY RANK:</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-xs ${
                            outputs.risk.risk_level === 'High' ? 'bg-red-500 text-white shadow-sm' :
                            outputs.risk.risk_level === 'Medium' ? 'bg-amber-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm'
                          }`}>{outputs.risk.risk_level} ({outputs.risk.score}/100)</span>
                        </div>
                        <div className="w-full bg-(--bg-cream-dark) h-2.5 rounded-full shadow-inner overflow-hidden mt-1">
                          <div 
                            className="h-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] rounded-full shadow-[0_0_6px_rgba(255,75,43,0.4)]"
                            style={{ width: `${outputs.risk.score}%` }}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-bold text-neutral-500 uppercase block mb-1">IDENTIFIED RISK FACTORS:</span>
                            <ul className="list-disc pl-4 text-neutral-600 space-y-0.5">
                              {outputs.risk.risks?.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div className="panel-neu-inset bg-(--bg-cream) p-3 rounded-2xl text-xs">
                            <span className="font-bold text-(--color-terracotta) uppercase block mb-1">MITIGATION SCHEME:</span>
                            <ul className="list-disc pl-4 text-neutral-600 space-y-0.5">
                              {outputs.risk.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('memory') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('memory') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('memory')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">User Memory</h4>
                    
                    {outputs.memory ? (
                      <div className="space-y-3 font-retro-mono text-xs pt-3 mt-2 border-t border-white/50">
                        <div className="panel-neu-inset p-3 bg-(--bg-cream) space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-neutral-450">AIRLINE PREF:</span>
                            <span className="font-bold text-neutral-700">{outputs.memory.preferred_airline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450">HOTEL TYPOLOGY:</span>
                            <span className="font-bold text-neutral-700">{outputs.memory.preferred_hotel_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450">RESTRICTIONS:</span>
                            <span className="font-bold text-neutral-700">{outputs.memory.seat} / {outputs.memory.meal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-450">HOME CITY:</span>
                            <span className="font-bold text-neutral-700">{outputs.memory.home_city}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-neutral-450 block uppercase text-[10px] mb-1.5">FREQUENT STOPS:</span>
                          <div className="flex flex-wrap gap-1 font-retro-mono">
                            {outputs.memory.frequently_visited_cities?.map((city, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-(--bg-cream) rounded-full shadow-sm font-bold text-neutral-600">{city}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('conflicts') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('conflicts') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                        getAgentStatus('conflicts') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('conflicts')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Schedule Conflicts</h4>
                    
                    {outputs.calendar_conflicts ? (
                      outputs.calendar_conflicts.skipped ? (
                        <div className="panel-neu-inset p-3 text-xs font-retro-mono text-neutral-500 italic text-center mt-2">
                          {outputs.calendar_conflicts.reason}
                        </div>
                      ) : (
                        <div className="space-y-2.5 font-retro-mono text-xs pt-3 mt-2 border-t border-white/50">
                          {outputs.calendar_conflicts.hasConflict ? (
                            <div className="bg-red-50/80 rounded-2xl p-3 text-red-900 space-y-1.5 border border-red-200/50 shadow-sm">
                              <span className="font-bold block text-[9px] uppercase tracking-wider">CONFLICT DETECTED:</span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {outputs.calendar_conflicts.conflicts?.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-green-50/80 rounded-2xl p-3 text-green-900 text-xs font-bold flex items-center gap-1.5 border border-green-200/50 shadow-sm">
                              <span>✔</span>
                              <span>No scheduling conflicts detected. Slots clear.</span>
                            </div>
                          )}
                          {outputs.calendar_conflicts.suggestedSlots?.length > 0 && (
                            <div>
                              <span className="font-bold text-neutral-450 block uppercase text-[10px] mb-1.5">ALTERNATES SUGGESTED:</span>
                              <div className="space-y-1.5">
                                {outputs.calendar_conflicts.suggestedSlots.map((slot, i) => (
                                  <div key={i} className="p-2 bg-(--bg-cream) rounded-xl shadow-sm font-bold text-neutral-600">
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('calendar') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('calendar') === 'skipped' ? 'text-neutral-400 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                        getAgentStatus('calendar') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('calendar')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Calendar Scheduler</h4>
                    
                    {outputs.calendar ? (
                      <div className="space-y-2 text-sm pt-3 mt-2 border-t border-white/50">
                        <div className="font-bold text-neutral-700 font-title text-sm">{outputs.calendar.summary}</div>
                        <div className="font-retro-mono text-xs space-y-0.5 panel-neu-inset p-3 bg-(--bg-cream)">
                          <div className="text-neutral-500"><span className="font-bold">START:</span> {outputs.calendar.start_time}</div>
                          <div className="text-neutral-500"><span className="font-bold">END:</span> {outputs.calendar.end_time}</div>
                          <div className="text-neutral-500"><span className="font-bold">VENUE:</span> {outputs.calendar.location}</div>
                        </div>
                        <p className="text-xs text-neutral-500 italic font-body">"{outputs.calendar.description}"</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
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
                      <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        getAgentStatus('email') === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        getAgentStatus('email') === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                      }`}>
                        {getAgentStatus('email')}
                      </span>
                    </div>

                    <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Email Correspondence</h4>
                    
                    {outputs.email ? (
                      <div className="space-y-1.5 text-sm pt-3 mt-2 border-t border-white/50">
                        <div className="font-retro-mono text-xs">
                          <div><span className="text-neutral-500">TO:</span> <span className="font-bold text-neutral-700">{outputs.email.to}</span></div>
                          <div><span className="text-neutral-500">SUBJ:</span> <span className="font-bold text-neutral-700">{outputs.email.subject}</span></div>
                        </div>
                        <div className="panel-neu-inset p-3 text-xs font-retro-mono max-h-24 overflow-y-auto whitespace-pre-line text-neutral-650 bg-(--bg-cream)">
                          {outputs.email.body}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 font-body py-4 italic border-t border-dashed border-neutral-300 mt-2">
                        Awaiting details to generate correspondence draft...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL (Neumorphic Dial, Live Console Log, Execute Drawers) */}
          <div className="space-y-6">
            
            {/* Dark Soft Status/Console Block */}
            <div className="card-neu-dark text-neutral-200 p-6 relative overflow-hidden min-h-145 flex flex-col justify-between">
              
              {/* Neumorphic Status Indicator Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-retro-mono text-[9px] font-black uppercase transition-all duration-300 ${
                  isLoading ? 'bg-amber-500 text-white animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
                  agentState ? 'bg-linear-to-br from-[#ff416c] to-[#ff4b2b] text-white shadow-[0_0_12px_rgba(255,75,43,0.5)]' :
                  'bg-neutral-800 text-neutral-400 shadow-inner'
                }`}>
                  {isLoading ? "RUN" : agentState ? "ACTIVE" : "STBY"}
                </div>
              </div>

              {/* Neumorphic Dial Widget */}
              <div className="pb-6 text-center border-b border-neutral-800/80">
                <div className="relative inline-block mt-4 mb-3">
                  <SystemChronometer isLoading={isLoading} agentState={agentState} />
                </div>
                <h4 className="font-title font-bold text-base tracking-wide text-neutral-200 uppercase mt-2">
                  System Chronometer
                </h4>
                <p className="text-xs font-retro-mono text-neutral-500 tracking-wider">
                  MODEL NO. L-OS // AUTOMATION ENGINE
                </p>
              </div>

              {/* Console Logs inside recessed panel */}
              <div className="grow my-6 flex flex-col justify-start">
                <span className="text-xs font-retro-mono font-bold text-amber-500 uppercase tracking-wider mb-2 block">
                  SYS.CONSOLE LOGS:
                </span>
                
                <div className="panel-neu-dark-inset p-4 font-retro-mono text-xs text-neutral-300 space-y-2 grow min-h-45 overflow-y-auto leading-normal">
                  <div className="text-green-400">&gt; LifeOS Personal Automation System Init...</div>
                  <div className="text-neutral-500">&gt; UTC Clock sync verified.</div>
                  
                  {isLoading && (
                    <div className="text-amber-400 animate-pulse">
                      &gt; Orchestrating: Contacting travel, finance, calendar agents...
                    </div>
                  )}

                  {agentState ? (
                    <>
                      <div className="text-white">&gt; State output loaded. Awaiting confirmation.</div>
                      <div className="text-amber-400">&gt; Proposed calendar event extracted.</div>
                      <div className="text-amber-400">&gt; Proposed email draft composed.</div>
                      {executionResult && (
                        <div className="text-green-400 font-bold">&gt; EXECUTION STATUS: SUCCESS!</div>
                      )}
                    </>
                  ) : (
                    <div className="text-neutral-600">&gt; Standby. Enter travel request to launch thread.</div>
                  )}
                </div>
              </div>

              {/* Quote / Sub-text decoration */}
              <div className="border-t border-neutral-800/80 pt-4 text-center">
                <p className="text-xs italic font-body text-neutral-400 leading-relaxed px-4">
                  "Orchestration is a way to say where you want to go without booking it yourself."
                </p>
              </div>

            </div>

            {/* HUMAN REVIEW DRAWER / EXECUTION INTERFACES */}
            {requiresApproval && (
              <div className="card-vintage p-6 bg-(--bg-cream) space-y-4 animate-fade-in relative">
                
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-(--color-terracotta) text-white text-xs font-bold font-retro-mono">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-base text-neutral-800">
                      Pending Authorization
                    </h4>
                    <p className="text-xs text-neutral-400 font-body leading-tight mt-0.5">
                      Verify draft event & email files before final system commit.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 panel-neu-inset p-4 font-retro-mono text-xs bg-(--bg-cream)">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-(--color-terracotta) uppercase tracking-wider block">
                      [ ] PROPOSED EVENT payload:
                    </span>
                    <div className="text-xs font-title font-bold text-neutral-700">
                      {outputs.calendar?.summary}
                    </div>
                    <div className="text-neutral-500 text-xs">
                      {outputs.calendar?.start_time} // {outputs.calendar?.location}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/50 pt-2 space-y-1">
                    <span className="text-[10px] font-bold text-(--color-terracotta) uppercase tracking-wider block">
                      [ ] PROPOSED EMAIL payload:
                    </span>
                    <div className="font-bold text-neutral-700 truncate">
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
                    className="btn-vintage text-xs"
                    disabled={isConfirming}
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleConfirmExecute}
                    className="btn-vintage btn-vintage-primary text-xs font-bold"
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
              <div className="card-vintage p-6 bg-(--bg-cream) space-y-4 animate-fade-in">
                
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-(--color-olive) text-white text-xs font-bold font-retro-mono">
                    ✔
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-base text-neutral-800">
                      Commit Successful
                    </h4>
                    <p className="text-xs text-neutral-400 font-body">
                      All remote writes completed successfully.
                    </p>
                  </div>
                </div>

                <div className="panel-neu-inset p-4 font-retro-mono text-xs space-y-2.5 overflow-hidden bg-(--bg-cream)">
                  <div className="flex flex-col gap-1 leading-snug">
                    <span className="font-bold text-(--color-olive)">CALENDAR STATE:</span>
                    <span className="text-neutral-600 font-semibold break-all">{executionResult.calendar_status}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 leading-snug border-t border-white/50 pt-2">
                    <span className="font-bold text-(--color-olive)">GMAIL STATE:</span>
                    <span className="text-neutral-600 font-semibold break-all">{executionResult.email_status}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {activeTab === 'pipeline' && (
        <div className="lg:col-span-3 space-y-8 animate-fade-in">
          <div className="card-vintage p-6 relative overflow-hidden">
            <h3 className="font-title font-bold text-xl text-neutral-800 mb-4 uppercase tracking-wider">
              Active Agent Pipeline Flow
            </h3>
            <p className="text-sm text-neutral-500 font-body mb-6">
              Real-time status tracking of all virtual agents in the orchestration sequence.
            </p>
            
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-white/50 mb-6">
              {agentState ? (
                Object.keys(agentState.agent_outputs || {}).map((agentKey, idx) => {
                  const status = getAgentStatus(agentKey);
                  return (
                    <div key={agentKey} className="flex items-center">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold font-retro-mono tracking-wide shadow-sm border ${
                        status === 'completed' ? 'bg-green-500 text-white border-green-400' :
                        status === 'skipped' ? 'text-neutral-450 border-neutral-300 bg-neutral-200/50 shadow-inner' :
                        status === 'working' ? 'bg-amber-500 text-white animate-pulse border-amber-400' :
                        'bg-neutral-200 text-neutral-555 border-neutral-300'
                      }`}>
                        {idx + 1}. {agentKey.toUpperCase()} ({status})
                      </span>
                      {idx < Object.keys(agentState.agent_outputs).length - 1 && (
                        <span className="mx-2 text-neutral-400 font-bold">➔</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-neutral-400 italic py-4">
                  No active pipeline thread. Enter a travel request on the Dashboard to launch orchestration.
                </div>
              )}
            </div>

            {agentState ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(agentState.agent_outputs || {}).map(([agentKey, val]) => (
                  <div key={agentKey} className="card-vintage p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                          Agent Node // {agentKey.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          getAgentStatus(agentKey) === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                          getAgentStatus(agentKey) === 'skipped' ? 'text-neutral-450 opacity-50 line-through bg-neutral-200/50 shadow-inner' :
                          getAgentStatus(agentKey) === 'working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-500 shadow-inner'
                        }`}>
                          {getAgentStatus(agentKey)}
                        </span>
                      </div>
                      <h4 className="font-title font-bold text-lg text-neutral-850 mb-2 capitalize">{agentKey.replace('_', ' ')}</h4>
                      <div className="panel-neu-inset p-3 bg-(--bg-cream) text-xs font-retro-mono max-h-40 overflow-y-auto whitespace-pre-line text-neutral-650">
                        {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel-neu-inset p-8 text-center bg-(--bg-cream)">
                <p className="text-sm text-neutral-500 italic">
                  Awaiting travel plan initialization to display active node details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="lg:col-span-3 space-y-8 animate-fade-in">
          <div className="card-neu-dark text-neutral-250 p-6 relative overflow-hidden min-h-120 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-neutral-800/80 mb-6">
                <div>
                  <h3 className="font-title font-bold text-xl text-neutral-200 uppercase tracking-wider">
                    Live System Orchestrator Console
                  </h3>
                  <p className="text-xs font-retro-mono text-neutral-500 tracking-wider mt-0.5">
                    ENGINE INSTANCE: L-OS // AUTOMATION SERVICE LOGGING
                  </p>
                </div>
              </div>

              <div className="panel-neu-dark-inset p-6 font-retro-mono text-sm text-neutral-350 space-y-3 min-h-90 overflow-y-auto leading-relaxed">
                <div className="text-green-400 font-bold">&gt; [{formatLogTime(0)}] System Initializing Personal Automation Pipeline...</div>
                <div className="text-neutral-550">&gt; [{formatLogTime(2)}] Clock Synchronized with UTC Travel Chronometer.</div>
                
                {isLoading && (
                  <div className="text-amber-400 animate-pulse">
                    &gt; [{formatLogTime(4)}] ORCHESTRATOR: Running multi-agent search (Geolocator, Flights, Lodging)...
                  </div>
                )}

                {agentState ? (
                  <>
                    <div className="text-white">&gt; [{formatLogTime(6)}] PIPELINE: Agent outputs successfully parsed.</div>
                    <div className="text-amber-400">&gt; [{formatLogTime(7)}] CALENDAR: Extracted travel calendar block payload.</div>
                    <div className="text-amber-400">&gt; [{formatLogTime(8)}] GMAIL: Drafted correspondence message to team.</div>
                    <div className="text-green-400">&gt; [{formatLogTime(10)}] SYS: Awaiting human execution authorization...</div>
                    {executionResult && (
                      <div className="text-green-400 font-bold">&gt; [{formatLogTime(12)}] EXECUTION: Success! Gmail sent and Calendar booked.</div>
                    )}
                  </>
                ) : (
                  <div className="text-neutral-650">&gt; [{formatLogTime(3)}] STANDBY: Awaiting input query. Enter prompt above to trigger agents execution.</div>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-800/80 pt-4 text-center mt-6">
              <p className="text-xs italic font-body text-neutral-500">
                Console instance logs reflect active step tracing from LangGraph outputs.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>

      </div>
    </div>
  );
}

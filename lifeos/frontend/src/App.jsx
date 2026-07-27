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
    <div className="min-h-screen pb-12">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-indigo-400/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-400/8 blur-[130px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-linear-to-r from-slate-900 via-slate-800 to-indigo-600 bg-clip-text text-transparent">
              LifeOS
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Personal Chief of Staff
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLoading || isConfirming ? 'bg-amber-400' : requiresApproval ? 'bg-indigo-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isLoading || isConfirming ? 'bg-amber-500' : requiresApproval ? 'bg-indigo-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="text-xs font-bold text-slate-700">
            {statusMessage}
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        
        {/* TOP SECTION: Centered Task Orchestrator */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass rounded-3xl p-6 space-y-6 relative overflow-hidden transition-all duration-300 focus-within:shadow-lg focus-within:border-indigo-300">
            <div className="absolute top-0 right-0 p-3 text-slate-900/5 pointer-events-none">
              <Lock className="h-24 w-24" />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Task Orchestrator
              </h2>
              <p className="text-xs text-slate-555 max-w-md mx-auto">
                Enter your travel request in natural language. Our agent network will coordinate to fetch weather forecasts, estimate budgets, and draft schedules.
              </p>
            </div>

            <form onSubmit={handleChatSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., I'm travelling to Paris on 2026-08-10"
                  className="w-full bg-white/70 border rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 min-h-22.5 placeholder:text-slate-400 resize-none transition-all shadow-inner"
                  style={{ borderColor: 'rgba(226, 232, 240, 0.8)', color: '#1e293b' }}
                  disabled={isLoading || isConfirming}
                />
                <button
                  type="submit"
                  disabled={isLoading || isConfirming || !inputText.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Starter Prompts */}
            <div className="space-y-2">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Quick Examples
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {starterPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleStarterClick(prompt)}
                    disabled={isLoading || isConfirming}
                    className="text-xs bg-white hover:bg-indigo-50/50 border border-slate-200/60 hover:border-indigo-200 text-slate-600 px-3.5 py-1.5 rounded-full transition-all hover:scale-105 cursor-pointer shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {agentState && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Clear Current Workflow
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3 flex gap-2 text-xs text-red-655 shadow-sm max-w-xl mx-auto">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <div>{errorMessage}</div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: Workflow Pipeline */}
        {agentState && (
          <div className="max-w-5xl mx-auto glass rounded-2xl p-4 shadow-sm border border-slate-200/50 flex flex-wrap justify-between items-center gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent Pipeline Flow</span>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 shadow-sm">Input</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Travel */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('travel') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('travel') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Travel</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Flights */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('flights') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('flights') === 'skipped' ? 'bg-slate-100 text-slate-400 border-slate-200/40 line-through' :
                getAgentStatus('flights') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Flights</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Hotels */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('hotels') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('hotels') === 'skipped' ? 'bg-slate-100 text-slate-400 border-slate-200/40 line-through' :
                getAgentStatus('hotels') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Hotels</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Budget */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('budget') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('budget') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Budget</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Risk */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('risk') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('risk') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Risk</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

              {/* Memory */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('memory') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('memory') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Memory</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

              {/* Conflicts */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('conflicts') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('conflicts') === 'skipped' ? 'bg-slate-100 text-slate-400 border-slate-200/40 line-through' :
                getAgentStatus('conflicts') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Conflicts</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Calendar */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('calendar') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('calendar') === 'skipped' ? 'bg-slate-100 text-slate-400 border-slate-200/40 line-through' :
                getAgentStatus('calendar') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Calendar</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              {/* Email */}
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                getAgentStatus('email') === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                getAgentStatus('email') === 'working' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Email</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              
              <span className={`font-semibold px-2 py-0.5 rounded-md border transition-all ${
                requiresApproval ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' :
                executionResult ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                'bg-slate-50 text-slate-400 border-slate-200/60'
              }`}>Execute</span>
            </div>
          </div>
        )}

        {/* BOTTOM SECTION: Responsive 4-Column Agent Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Agent Network Dashboard
            </h2>
            <div className="text-xs font-bold text-slate-600 bg-white/80 py-1 px-3 border border-slate-200/60 rounded-full shadow-sm">
              4 Specialized Agents
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: Travel Agent */}
            <div className="glass rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-350 flex flex-col min-h-55">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
                  <Plane className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('travel') === 'completed' ? 'bg-emerald-50/15 text-emerald-700 border border-emerald-100' :
                  getAgentStatus('travel') === 'working' ? 'bg-amber-50/15 text-amber-700 border-amber-100 animate-pulse' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {getAgentStatus('travel')}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2">Travel Agent</h3>
              
              {outputs.travel ? (
                <div className="space-y-3 text-xs text-slate-600 grow">
                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{outputs.travel.city} ({outputs.travel.dates})</span>
                  </div>
                  <div className="bg-indigo-50/45 p-2.5 border border-indigo-100/50 rounded-xl flex items-start gap-2 shadow-inner">
                    <CloudSun className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-700">{outputs.travel.weather_summary}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Packing List:</span>
                    <ul className="grid grid-cols-2 gap-1 text-[11px] list-disc pl-4 text-slate-650">
                      {outputs.travel.packing_list?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grow flex items-center justify-center border border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                  {isLoading ? "Running weather geocoding..." : "Awaiting travel instructions..."}
                </div>
              )}
            </div>

            {/* CARD 2: Finance Agent */}
            <div className="glass rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-350 flex flex-col min-h-55">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('finance') === 'completed' ? 'bg-emerald-50/15 text-emerald-700 border border-emerald-100' :
                  getAgentStatus('finance') === 'working' ? 'bg-amber-50/15 text-amber-700 border-amber-100 animate-pulse' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {getAgentStatus('finance')}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2">Finance Agent</h3>
              
              {outputs.finance ? (
                <div className="space-y-3 text-xs text-slate-600 grow">
                  <div className="bg-emerald-50/45 p-3 border border-emerald-100/50 rounded-2xl space-y-1.5 shadow-inner">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lodging:</span>
                      <span className="font-mono text-slate-800 font-semibold">INR {outputs.finance.lodging}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transit:</span>
                      <span className="font-mono text-slate-800 font-semibold">INR {outputs.finance.transit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Food:</span>
                      <span className="font-mono text-slate-800 font-semibold">INR {outputs.finance.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Activities:</span>
                      <span className="font-mono text-slate-800 font-semibold">INR {outputs.finance.activities}</span>
                    </div>
                    <div className="border-t border-emerald-200/50 pt-1.5 flex justify-between font-bold">
                      <span className="text-emerald-750">Total Budget:</span>
                      <span className="font-mono text-emerald-750">INR {outputs.finance.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grow flex items-center justify-center border border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                  {isLoading ? "Estimating lodging & food costs..." : "Awaiting financial details..."}
                </div>
              )}
            </div>

            {/* CARD 3: Calendar Agent */}
            <div className="glass rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-350 flex flex-col min-h-55">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-550 border border-amber-100 rounded-2xl text-amber-600 shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('calendar') === 'completed' ? 'bg-emerald-50/15 text-emerald-700 border border-emerald-100' :
                  getAgentStatus('calendar') === 'working' ? 'bg-amber-50/15 text-amber-700 border-amber-100 animate-pulse' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {getAgentStatus('calendar')}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2">Calendar Agent</h3>
              
              {outputs.calendar ? (
                <div className="space-y-2.5 text-xs text-slate-650 grow">
                  <div className="font-bold text-slate-800">{outputs.calendar.summary}</div>
                  <div className="space-y-1 bg-amber-50/45 p-2.5 border border-amber-100/50 rounded-xl text-[11px] shadow-inner">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Start: {outputs.calendar.start_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>End: {outputs.calendar.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>Location: {outputs.calendar.location}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{outputs.calendar.description}</p>
                </div>
              ) : (
                <div className="grow flex items-center justify-center border border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                  Awaiting travel details to schedule...
                </div>
              )}
            </div>

            {/* CARD 4: Email Agent */}
            <div className="glass rounded-3xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-350 flex flex-col min-h-55">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-pink-50 border border-pink-100 rounded-2xl text-pink-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('email') === 'completed' ? 'bg-emerald-50/15 text-emerald-700 border border-emerald-100' :
                  getAgentStatus('email') === 'working' ? 'bg-amber-50/15 text-amber-700 border-amber-100 animate-pulse' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {getAgentStatus('email')}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2">Email Agent</h3>
              
              {outputs.email ? (
                <div className="space-y-2 text-xs text-slate-650 grow">
                  <div>
                    <span className="text-slate-500 font-bold">To:</span> <span className="font-mono text-slate-800 font-semibold">{outputs.email.to}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Subject:</span> <span className="font-bold text-slate-800">{outputs.email.subject}</span>
                  </div>
                  <div className="bg-pink-50/40 p-2.5 border border-pink-100/50 rounded-xl text-[10px] max-h-21.25 overflow-y-auto whitespace-pre-line text-slate-600 shadow-inner">
                    {outputs.email.body}
                  </div>
                </div>
              ) : (
                <div className="grow flex items-center justify-center border border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                  Awaiting event payload to compose draft...
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SUB-AGENTS DASHBOARD */}
        {agentState && (
          <div className="space-y-4 mt-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Specialist Sub-Agent Reports
              </h2>
              <div className="text-xs font-bold text-slate-650 bg-white/80 py-1 px-3 border border-slate-200/60 rounded-full shadow-sm">
                6 Specialist Nodes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* CARD 1: Flight Search Agent */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, flights: !prev.flights }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-sm">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Flight Search Agent</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Weighted scoring & rank</p>
                    </div>
                  </div>
                  {collapsedCards.flights ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.flights && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.flights ? (
                      outputs.flights.skipped ? (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-4 text-xs text-slate-500 text-center leading-relaxed">
                          {outputs.flights.reason}
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          {outputs.flights.map((flight, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl border transition-all ${idx === 0 ? 'bg-indigo-50/40 border-indigo-200 shadow-sm' : 'bg-white/50 border-slate-205/65'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800">{flight.airline}</span>
                                <span className="font-bold text-indigo-600 font-mono">INR {flight.price}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>{flight.departure} - {flight.arrival} ({flight.duration}h)</span>
                                <span>{flight.stops} stop(s)</span>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-150/40 text-[10px]">
                                <span className="font-bold text-slate-400">Rating: {flight.rating}⭐</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-indigo-100 text-indigo-750 font-bold' : 'bg-slate-150 text-slate-600'}`}>Score: {flight.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        {isLoading ? "Analyzing flight data..." : "Awaiting travel details..."}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 2: Hotel Recommendations */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, hotels: !prev.hotels }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shadow-sm">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Hotel Recommendations</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Weighted amenity selection</p>
                    </div>
                  </div>
                  {collapsedCards.hotels ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.hotels && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.hotels ? (
                      outputs.hotels.skipped ? (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-4 text-xs text-slate-500 text-center leading-relaxed">
                          {outputs.hotels.reason}
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs max-h-75 overflow-y-auto pr-1">
                          {outputs.hotels.map((hotel, idx) => (
                            <div key={idx} className="p-3 rounded-2xl border bg-white/50 border-slate-200/60 shadow-sm space-y-1.5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-800 block text-xs leading-tight">{hotel.name}</span>
                                  <span className="text-[10px] text-emerald-600 font-bold">{hotel.category}</span>
                                </div>
                                <span className="font-bold text-slate-800 font-mono text-xs">INR {hotel.price}/n</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500">
                                <span>Dist: {hotel.distance} km</span>
                                <span>Safety: {hotel.safety_score}/100</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities?.map((am, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-100/70 text-slate-500 rounded font-semibold">{am}</span>
                                ))}
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-slate-150/45 text-[10px]">
                                <span>Rating: {hotel.rating}⭐</span>
                                <span className="font-semibold text-emerald-700">Score: {hotel.overall_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        {isLoading ? "Running hotel recommendations..." : "Awaiting hotel metrics..."}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 3: Budget Optimization */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, budget: !prev.budget }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 shadow-sm">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Budget Optimization</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Cheaper alternatives check</p>
                    </div>
                  </div>
                  {collapsedCards.budget ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.budget && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.optimized_budget ? (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 p-2 border border-slate-200/50 rounded-xl">
                            <span className="text-[9px] text-slate-450 block font-semibold mb-0.5">Estimated</span>
                            <span className="font-bold text-slate-800 font-mono text-[10px]">INR {outputs.optimized_budget.original_cost}</span>
                          </div>
                          <div className="bg-emerald-50/50 p-2 border border-emerald-100 rounded-xl">
                            <span className="text-[9px] text-emerald-700 block font-semibold mb-0.5">Optimized</span>
                            <span className="font-bold text-emerald-800 font-mono text-[10px]">INR {outputs.optimized_budget.optimized_cost}</span>
                          </div>
                          <div className="bg-indigo-50/50 p-2 border border-indigo-100 rounded-xl">
                            <span className="text-[9px] text-indigo-700 block font-semibold mb-0.5">Savings</span>
                            <span className="font-bold text-indigo-800 font-mono text-[10px]">+INR {outputs.optimized_budget.savings}</span>
                          </div>
                        </div>

                        <div className="bg-amber-50/30 p-3 border border-amber-100/50 rounded-2xl shadow-inner space-y-1.5">
                          <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Trimming Guidelines:</span>
                          <ul className="space-y-1 list-disc pl-4 text-slate-700 text-[11px] leading-relaxed">
                            {outputs.optimized_budget.recommendations?.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        Awaiting financial data...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 4: Risk Report */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, risk: !prev.risk }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl text-red-600 shadow-sm">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Risk Report</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Real-time alerts & safety</p>
                    </div>
                  </div>
                  {collapsedCards.risk ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.risk && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.risk ? (
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200/50 rounded-xl">
                          <span className="font-bold text-slate-700">Safety Index:</span>
                          <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] uppercase tracking-wider ${
                            outputs.risk.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                            outputs.risk.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>{outputs.risk.risk_level} ({outputs.risk.score}/100)</span>
                        </div>

                        {/* Gauge bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              outputs.risk.score > 70 ? 'bg-red-500' :
                              outputs.risk.score > 30 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${outputs.risk.score}%` }}
                          />
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="font-bold text-slate-450 text-[9px] uppercase block mb-1">Risk Factors:</span>
                            <ul className="list-disc pl-4 text-slate-700 space-y-0.5 text-[10px]">
                              {outputs.risk.risks?.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          
                          <div className="bg-red-50/45 p-2.5 border border-red-100/50 rounded-xl space-y-1">
                            <span className="font-bold text-red-700 text-[9px] uppercase block">Mitigation Advice:</span>
                            <ul className="list-disc pl-4 text-slate-650 space-y-0.5 text-[10px]">
                              {outputs.risk.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        Evaluating safety protocols...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 5: Calendar Conflicts */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, conflicts: !prev.conflicts }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 border border-pink-100 rounded-xl text-pink-600 shadow-sm">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Calendar Conflicts</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Overlapping slot checks</p>
                    </div>
                  </div>
                  {collapsedCards.conflicts ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.conflicts && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.calendar_conflicts ? (
                      outputs.calendar_conflicts.skipped ? (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-4 text-xs text-slate-500 text-center leading-relaxed">
                          {outputs.calendar_conflicts.reason}
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          {outputs.calendar_conflicts.hasConflict ? (
                            <div className="bg-red-50/50 border border-red-200/50 rounded-2xl p-3 text-red-805 space-y-1">
                              <span className="font-bold text-[9px] uppercase block tracking-wider">Conflicts Detected!</span>
                              <ul className="list-disc pl-4 text-[10px] space-y-0.5">
                                {outputs.calendar_conflicts.conflicts?.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-emerald-50/50 border border-emerald-250/50 rounded-2xl p-3 text-emerald-800 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              <span className="font-bold text-[10px]">No schedule conflicts detected.</span>
                            </div>
                          )}

                          {outputs.calendar_conflicts.suggestedSlots?.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-450 text-[9px] uppercase block mb-1">Recommended Alternates:</span>
                              <div className="space-y-1">
                                {outputs.calendar_conflicts.suggestedSlots.map((slot, i) => (
                                  <div key={i} className="p-2 bg-indigo-50/30 border border-slate-200/60 rounded-xl text-[10px] text-slate-700 font-mono font-semibold">
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        Analyzing schedules...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 6: Personalized Preferences */}
              <div className="glass rounded-3xl p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col min-h-35">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => setCollapsedCards(prev => ({ ...prev, preferences: !prev.preferences }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Personalized Preferences</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">User preferences & history</p>
                    </div>
                  </div>
                  {collapsedCards.preferences ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedCards.preferences && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 grow flex flex-col justify-between">
                    {outputs.memory ? (
                      <div className="space-y-3 text-xs">
                        <div className="bg-white/70 p-3 border border-slate-200/80 rounded-2xl space-y-1 shadow-inner">
                          <div className="flex justify-between">
                            <span className="text-slate-550">Preferred Airline:</span>
                            <span className="font-bold text-indigo-700">{outputs.memory.preferred_airline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-550">Hotel Category:</span>
                            <span className="font-bold text-slate-850">{outputs.memory.preferred_hotel_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-550">Seat / Meal:</span>
                            <span className="font-semibold text-slate-800">{outputs.memory.seat} / {outputs.memory.meal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-550">Home Location:</span>
                            <span className="font-semibold text-slate-800">{outputs.memory.home_city}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-450 text-[9px] uppercase block mb-1">Visited Locations:</span>
                          <div className="flex flex-wrap gap-1">
                            {outputs.memory.frequently_visited_cities?.map((city, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] rounded-full font-bold shadow-sm">{city}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grow flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 text-xs py-8">
                        Loading long term memory...
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM FLOATING SECTIONS: Human Review and Success confirmations */}
        <div className="max-w-4xl mx-auto">
          
          {/* CONFIRMATION DRAWER / BLOCK */}
          {requiresApproval && (
            <div className="glass rounded-3xl p-6 shadow-md border border-indigo-200/50 bg-linear-to-r from-indigo-50/50 to-slate-50/50 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 border border-amber-200 rounded-xl text-amber-700 shadow-sm">
                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-950">Human-In-The-Loop Confirmation</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Please review the proposed actions before writing to Google Calendar and Gmail.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 p-4 border border-slate-200/80 rounded-2xl shadow-inner">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-650" /> Proposed Event
                  </span>
                  <div className="text-xs text-slate-700">
                    <div className="font-bold text-slate-800">{outputs.calendar?.summary}</div>
                    <div className="text-[11px] text-slate-500">{outputs.calendar?.start_time} - {outputs.calendar?.location}</div>
                  </div>
                </div>
                
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3 text-pink-650" /> Proposed Email
                  </span>
                  <div className="text-xs text-slate-700">
                    <div className="font-bold text-slate-855">{outputs.email?.subject}</div>
                    <div className="text-[11px] text-slate-500 truncate">Recipient: {outputs.email?.to}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                  disabled={isConfirming}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExecute}
                  className="px-5 py-2 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl transition-all hover:scale-105 cursor-pointer shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve & Execute
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* EXECUTION SUCCESS PANEL */}
          {executionResult && (
            <div className="glass rounded-3xl p-6 shadow-md border border-emerald-250/50 bg-linear-to-r from-emerald-50/50 to-slate-50/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-950">Execution Successful!</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    The agent has completed the approved real-world automation tasks.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 p-4 border border-slate-200/80 rounded-2xl text-xs space-y-3 shadow-inner">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700 shrink-0">Calendar Status:</span>
                  <span className="text-slate-700 leading-relaxed font-mono">{executionResult.calendar_status}</span>
                </div>
                
                <div className="flex items-start gap-2 border-t border-slate-100 pt-2.5">
                  <span className="font-bold text-emerald-700 shrink-0">Gmail Status:</span>
                  <span className="text-slate-700 leading-relaxed font-mono">{executionResult.email_status}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

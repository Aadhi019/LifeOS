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
  RefreshCw
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
      if (agentName === 'finance' && !agentState) return 'working';
      if (agentName === 'calendar' && agentState?.agent_outputs?.travel) return 'working';
      if (agentName === 'email' && agentState?.agent_outputs?.calendar) return 'working';
      return 'idle';
    }
    
    if (agentState?.agent_outputs) {
      if (agentName === 'travel' && agentState.agent_outputs.travel) return 'completed';
      if (agentName === 'finance' && agentState.agent_outputs.finance) return 'completed';
      if (agentName === 'calendar' && agentState.agent_outputs.calendar) return 'completed';
      if (agentName === 'email' && agentState.agent_outputs.email) return 'completed';
    }
    
    return 'idle';
  };

  const outputs = agentState?.agent_outputs || {};
  const requiresApproval = agentState?.requires_approval && !executionResult;

  return (
    <div className="min-h-screen pb-12">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              LifeOS
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
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
          <span className="text-xs font-semibold text-slate-300">
            {statusMessage}
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input and Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-white/5 pointer-events-none">
              <Lock className="h-24 w-24" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                Task Orchestrator
              </h2>
              <p className="text-xs text-slate-400">
                Input your natural language request below to trigger coordinated agent automation.
              </p>
            </div>

            <form onSubmit={handleChatSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g., I'm travelling to Bangalore next Friday"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 min-h-[100px] placeholder:text-slate-500 resize-none transition-all"
                  disabled={isLoading || isConfirming}
                />
                <button
                  type="submit"
                  disabled={isLoading || isConfirming || !inputText.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-lg shadow-indigo-600/20"
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
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Try these examples:
              </span>
              <div className="flex flex-col gap-2">
                {starterPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleStarterClick(prompt)}
                    disabled={isLoading || isConfirming}
                    className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 p-3 rounded-xl transition-all hover:translate-x-1 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {agentState && (
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear Current Workflow
              </button>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <div>{errorMessage}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Agent Cards Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section title */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Agent Network Dashboard
            </h2>
            <div className="text-xs text-slate-400 bg-white/5 py-1 px-3 border border-white/5 rounded-full">
              4 Agents Coordinated
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: Travel Agent */}
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/10 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  <Plane className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('travel') === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  getAgentStatus('travel') === 'working' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  {getAgentStatus('travel')}
                </span>
              </div>
              
              <h3 className="font-bold text-white mb-2">Travel Agent</h3>
              
              {outputs.travel ? (
                <div className="space-y-3 text-xs text-slate-300 flex-grow">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{outputs.travel.city} ({outputs.travel.dates})</span>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 border border-white/5 rounded-xl flex items-start gap-2">
                    <CloudSun className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">{outputs.travel.weather_summary}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">Packing List:</span>
                    <ul className="grid grid-cols-2 gap-1 text-[11px] list-disc pl-4 text-slate-400">
                      {outputs.travel.packing_list?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-slate-600 text-xs py-8">
                  {isLoading ? "Running weather geocoding..." : "Awaiting travel instructions..."}
                </div>
              )}
            </div>

            {/* CARD 2: Finance Agent */}
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/10 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('finance') === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  getAgentStatus('finance') === 'working' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  {getAgentStatus('finance')}
                </span>
              </div>
              
              <h3 className="font-bold text-white mb-2">Finance Agent</h3>
              
              {outputs.finance ? (
                <div className="space-y-3 text-xs text-slate-300 flex-grow">
                  <div className="bg-slate-950/50 p-3 border border-white/5 rounded-2xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lodging:</span>
                      <span className="font-mono text-white">INR {outputs.finance.lodging}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit:</span>
                      <span className="font-mono text-white">INR {outputs.finance.transit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Food:</span>
                      <span className="font-mono text-white">INR {outputs.finance.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Activities:</span>
                      <span className="font-mono text-white">INR {outputs.finance.activities}</span>
                    </div>
                    <div className="border-t border-white/10 pt-1.5 flex justify-between font-semibold">
                      <span className="text-indigo-300">Total Budget:</span>
                      <span className="font-mono text-indigo-300">INR {outputs.finance.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-slate-600 text-xs py-8">
                  {isLoading ? "Estimating lodging & food costs..." : "Awaiting financial details..."}
                </div>
              )}
            </div>

            {/* CARD 3: Calendar Agent */}
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/10 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('calendar') === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  getAgentStatus('calendar') === 'working' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  {getAgentStatus('calendar')}
                </span>
              </div>
              
              <h3 className="font-bold text-white mb-2">Calendar Agent</h3>
              
              {outputs.calendar ? (
                <div className="space-y-2.5 text-xs text-slate-300 flex-grow">
                  <div className="font-semibold text-white">{outputs.calendar.summary}</div>
                  <div className="space-y-1 bg-slate-950/50 p-2.5 border border-white/5 rounded-xl text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Start: {outputs.calendar.start_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>End: {outputs.calendar.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>Location: {outputs.calendar.location}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{outputs.calendar.description}</p>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-slate-600 text-xs py-8">
                  Awaiting travel details to schedule...
                </div>
              )}
            </div>

            {/* CARD 4: Email Agent */}
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/10 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400">
                  <Mail className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  getAgentStatus('email') === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  getAgentStatus('email') === 'working' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  {getAgentStatus('email')}
                </span>
              </div>
              
              <h3 className="font-bold text-white mb-2">Email Agent</h3>
              
              {outputs.email ? (
                <div className="space-y-2 text-xs text-slate-300 flex-grow">
                  <div>
                    <span className="text-slate-400">To:</span> <span className="font-mono text-white">{outputs.email.to}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Subject:</span> <span className="font-semibold text-white">{outputs.email.subject}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 border border-white/5 rounded-xl text-[10px] max-h-[85px] overflow-y-auto whitespace-pre-line text-slate-400">
                    {outputs.email.body}
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-slate-600 text-xs py-8">
                  Awaiting event payload to compose draft...
                </div>
              )}
            </div>

          </div>

          {/* CONFIRMATION DRAWER / BLOCK */}
          {requiresApproval && (
            <div className="glass rounded-3xl p-6 shadow-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 to-slate-950/20 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Human-In-The-Loop Confirmation</h3>
                  <p className="text-xs text-slate-400">
                    Please review the proposed actions before writing to Google Calendar and Gmail.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 border border-white/5 rounded-2xl">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" /> Proposed Event
                  </span>
                  <div className="text-xs text-slate-300">
                    <div className="font-semibold text-white">{outputs.calendar?.summary}</div>
                    <div className="text-[11px] text-slate-400">{outputs.calendar?.start_time} - {outputs.calendar?.location}</div>
                  </div>
                </div>
                
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3 text-pink-400" /> Proposed Email
                  </span>
                  <div className="text-xs text-slate-300">
                    <div className="font-semibold text-white">{outputs.email?.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate">Recipient: {outputs.email?.to}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-white/10 text-slate-300 hover:bg-slate-950 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  disabled={isConfirming}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExecute}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-xl transition-all hover:scale-105 cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
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
            <div className="glass rounded-3xl p-6 shadow-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/10 to-slate-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/25 border border-emerald-500/35 rounded-xl text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Execution Successful!</h3>
                  <p className="text-xs text-slate-400">
                    The agent has completed the approved real-world automation tasks.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 border border-white/5 rounded-2xl text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-emerald-400 shrink-0">Calendar Status:</span>
                  <span className="text-slate-300 leading-relaxed font-mono">{executionResult.calendar_status}</span>
                </div>
                
                <div className="flex items-start gap-2 border-t border-white/5 pt-2.5">
                  <span className="font-semibold text-emerald-400 shrink-0">Gmail Status:</span>
                  <span className="text-slate-300 leading-relaxed font-mono">{executionResult.email_status}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

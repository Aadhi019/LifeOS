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

export const TOURIST_SPOTS_DB = {
  'bangalore': [
    'Bangalore Palace',
    'Lalbagh Botanical Garden',
    'Cubbon Park',
    'Wonderla Amusement Park',
    'Nandi Hills'
  ],
  'bengaluru': [
    'Bangalore Palace',
    'Lalbagh Botanical Garden',
    'Cubbon Park',
    'Wonderla Amusement Park',
    'Nandi Hills'
  ],
  'paris': [
    'Eiffel Tower',
    'Louvre Museum',
    'Palace of Versailles',
    'Seine River Cruise',
    'Notre-Dame Cathedral'
  ],
  'london': [
    'British Museum',
    'Tower of London',
    'London Eye',
    'Hyde Park',
    'Buckingham Palace'
  ],
  'mumbai': [
    'Gateway of India',
    'Marine Drive',
    'Elephanta Caves',
    'Juhu Beach',
    'Chhatrapati Shivaji Maharaj Terminus'
  ],
  'chennai': [
    'Marina Beach',
    'Kapaleeshwarar Temple',
    'Government Museum',
    'VGP Universal Kingdom',
    'DakshinaChitra'
  ],
  'coimbatore': [
    'Marudhamalai Temple',
    'Siruvani Waterfalls',
    'VOC Park and Zoo',
    'Gass Forest Museum',
    'Dhyanalinga Temple'
  ],
  'kannur': [
    'Payyambalam Beach',
    'St. Angelo Fort',
    'Muzhappilangad Drive-in Beach',
    'Arakkal Museum',
    'Parassinikkadavu Muthappan Temple'
  ],
  'ooty': [
    'Ooty Lake',
    'Government Botanical Garden',
    'Doddabetta Peak',
    'Government Rose Garden',
    'Pykara Waterfalls'
  ],
  'coorg': [
    'Abbey Falls',
    'Raja\'s Seat',
    'Dubare Elephant Camp',
    'Namdroling Monastery (Golden Temple)',
    'Talakaveri'
  ],
  'pondicherry': [
    'Promenade Beach',
    'Auroville',
    'Sri Aurobindo Ashram',
    'Paradise Beach',
    'Matrimandir'
  ],
  'goa': [
    'Calangute Beach',
    'Basilica of Bom Jesus',
    'Fort Aguada',
    'Dudhsagar Falls',
    'Anjuna Flea Market'
  ],
  'agra': [
    'Taj Mahal',
    'Agra Fort',
    'Fatehpur Sikri',
    'Mehtab Bagh',
    'Tomb of Itimad-ud-Daulah'
  ]
};

export const getTouristSpots = (city) => {
  if (!city) return [];
  const key = city.trim().toLowerCase();
  if (TOURIST_SPOTS_DB[key]) return TOURIST_SPOTS_DB[key];
  return [
    `${city} Museum & Cultural Center`,
    `${city} Botanical Park & Gardens`,
    `Historic ${city} Old Town Square`,
    `Local Food Tasting tour in ${city}`,
    `${city} Skyline Viewpoint`
  ];
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [sessionStartTime] = useState(() => new Date());
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [packedItems, setPackedItems] = useState([]);

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

  // Flight Recommendations Filtering & Sorting State
  const [flightClass, setFlightClass] = useState('economy');
  const [flightSort, setFlightSort] = useState('score');
  const [flightSortOrder, setFlightSortOrder] = useState('desc');
  const [flightStopsFilter, setFlightStopsFilter] = useState('all'); // 'all', 'direct', '1stop'
  const [flightMaxPrice, setFlightMaxPrice] = useState('');
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [isFlightFiltersOpen, setIsFlightFiltersOpen] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // Theme support
  const [theme, setTheme] = useState(() => localStorage.getItem('lifeos-theme') || 'light');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('lifeos-theme', theme);
  }, [theme]);

  // Interactive local budget target override
  const [budgetLimit, setBudgetLimit] = useState(25000);

  // Sync budget limit with memory when agentState changes
  useEffect(() => {
    if (agentState?.agent_outputs?.memory?.budget) {
      setBudgetLimit(parseInt(agentState.agent_outputs.memory.budget, 10) || 25000);
    }
  }, [agentState]);

  // Drawer modal state for User Memory Profile Editor
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [memoryForm, setMemoryForm] = useState({
    preferred_airline: 'IndiGo',
    preferred_hotel_type: 'Business',
    meal: 'Vegetarian',
    seat: 'Window',
    budget: '25000',
    home_city: 'Bangalore',
    frequently_visited_cities: [],
    travel_style: 'Comfort & Efficiency'
  });

  // Sync memoryForm with agentState memory
  useEffect(() => {
    if (agentState?.agent_outputs?.memory) {
      setMemoryForm({
        ...agentState.agent_outputs.memory,
        frequently_visited_cities: agentState.agent_outputs.memory.frequently_visited_cities || []
      });
    }
  }, [agentState]);

  // Track alternate slot selection flag
  const [selectedAlternateSlot, setSelectedAlternateSlot] = useState(null);

  // Track selected leg index for multi-leg travel tabs
  const [selectedLegIdx, setSelectedLegIdx] = useState(0);

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
      
      // Reset selected activities and packing checklist items
      setSelectedSpots([]);
      setPackedItems([]);
      setSelectedAlternateSlot(null);
      setSelectedLegIdx(0);
      // Set default selected flight and hotel
      if (response.data.agent_outputs?.flights && response.data.agent_outputs.flights.length > 0) {
        const firstFlight = response.data.agent_outputs.flights[0];
        setSelectedFlightId(firstFlight.airline + '_' + firstFlight.price + '_' + firstFlight.departure);
      } else {
        setSelectedFlightId(null);
      }
      
      if (response.data.agent_outputs?.hotels && response.data.agent_outputs.hotels.length > 0) {
        const firstHotel = response.data.agent_outputs.hotels[0];
        setSelectedHotelId(firstHotel.name + '_' + firstHotel.price);
      } else {
        setSelectedHotelId(null);
      }

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

  const handleSelectAlternateSlot = (slotString) => {
    setSelectedAlternateSlot(slotString);
    const parts = slotString.split(' to ');
    if (parts.length === 2) {
      const [start, end] = parts;
      if (agentState) {
        const updatedState = { ...agentState };
        const currentOutputs = { ...updatedState.agent_outputs };
        if (currentOutputs.calendar) {
          currentOutputs.calendar = {
            ...currentOutputs.calendar,
            start_time: start,
            end_time: end
          };
        }
        
        // Update email body with new calendar details
        if (currentOutputs.email) {
          const selectedFlight = getSelectedFlight();
          const selectedHotel = getSelectedHotel();
          currentOutputs.email = {
            ...currentOutputs.email,
            body: getUpdatedEmailBody(currentOutputs.email.body, selectedFlight, selectedHotel)
          };
        }
        
        updatedState.agent_outputs = currentOutputs;
        setAgentState(updatedState);
      }
    }
  };

  const handleAutoOptimize = () => {
    if (!agentState?.agent_outputs) return;
    
    const flights = agentState.agent_outputs.flights || [];
    const hotels = agentState.agent_outputs.hotels || [];
    
    let cheapestFlightObj = null;
    let flightSig = null;
    const validFlights = flights.filter(f => !f.skipped && typeof f.price === 'number');
    if (validFlights.length > 0) {
      cheapestFlightObj = validFlights.reduce((min, f) => f.price < min.price ? f : min, validFlights[0]);
      flightSig = cheapestFlightObj.airline + '_' + cheapestFlightObj.price + '_' + cheapestFlightObj.departure;
      setSelectedFlightId(flightSig);
    }
    
    let cheapestHotelObj = null;
    let hotelSig = null;
    const validHotels = hotels.filter(h => !h.skipped && typeof h.price === 'number');
    if (validHotels.length > 0) {
      cheapestHotelObj = validHotels.reduce((min, h) => h.price < min.price ? h : min, validHotels[0]);
      hotelSig = cheapestHotelObj.name + '_' + cheapestHotelObj.price;
      setSelectedHotelId(hotelSig);
    }
    
    const updatedState = { ...agentState };
    const currentOutputs = { ...updatedState.agent_outputs };
    if (currentOutputs.email) {
      const flightMultipliers = { economy: 1.0, premium_economy: 1.5, business: 2.5, first_class: 4.0 };
      const multiplier = flightMultipliers[flightClass] || 1.0;
      
      const displayedFlight = cheapestFlightObj ? {
        ...cheapestFlightObj,
        displayedPrice: Math.round(cheapestFlightObj.price * multiplier)
      } : getSelectedFlight();
      
      const displayedHotel = cheapestHotelObj || getSelectedHotel();
      
      currentOutputs.email = {
        ...currentOutputs.email,
        body: getUpdatedEmailBody(currentOutputs.email.body, displayedFlight, displayedHotel)
      };
    }
    updatedState.agent_outputs = currentOutputs;
    setAgentState(updatedState);
    setStatusMessage('Selection auto-optimized to cheapest options.');
  };

  const handleSaveMemory = async () => {
    try {
      setStatusMessage('Saving profile preferences...');
      const response = await axios.post(`${API_BASE}/memory`, memoryForm);
      if (response.data.success) {
        if (agentState) {
          const updatedState = { ...agentState };
          const currentOutputs = { ...updatedState.agent_outputs };
          currentOutputs.memory = response.data.memory;
          updatedState.agent_outputs = currentOutputs;
          setAgentState(updatedState);
        }
        
        setBudgetLimit(parseInt(response.data.memory.budget, 10) || 25000);
        setIsMemoryOpen(false);
        setStatusMessage('Preferences saved successfully!');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      setErrorMessage(`Failed to save memory: ${detail}`);
      setStatusMessage('Failed to save memory');
    }
  };

  const handleConfirmExecute = async () => {
    if (!agentState) return;

    setIsConfirming(true);
    setErrorMessage('');
    setStatusMessage('Executing automated actions...');
    
    try {
      // Synchronize selection changes into the email body sent to the backend
      const updatedState = { ...agentState };
      const currentOutputs = { ...updatedState.agent_outputs };
      
      if (currentOutputs.email) {
        const selectedFlight = getSelectedFlight();
        const selectedHotel = getSelectedHotel();
        currentOutputs.email = {
          ...currentOutputs.email,
          body: getUpdatedEmailBody(currentOutputs.email.body, selectedFlight, selectedHotel)
        };
      }
      updatedState.agent_outputs = currentOutputs;

      const response = await axios.post(`${API_BASE}/confirm`, {
        state: updatedState
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
    
    // Reset filters and selection state
    setFlightClass('economy');
    setFlightSort('score');
    setFlightSortOrder('desc');
    setFlightStopsFilter('all');
    setFlightMaxPrice('');
    setSelectedAirlines([]);
    setIsFlightFiltersOpen(false);
    setSelectedFlightId(null);
    setSelectedHotelId(null);
    setSelectedSpots([]);
    setPackedItems([]);
    setSelectedAlternateSlot(null);
    setSelectedLegIdx(0);
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

  const getProcessedFlights = () => {
    if (!agentState?.agent_outputs?.flights || agentState.agent_outputs.flights.skipped) return [];

    const classMultipliers = {
      economy: 1.0,
      premium_economy: 1.5,
      business: 2.5,
      first_class: 4.0
    };
    const multiplier = classMultipliers[flightClass] || 1.0;

    let list = agentState.agent_outputs.flights.map(f => ({
      ...f,
      displayedPrice: Math.round(f.price * multiplier)
    }));

    // Multi-leg filtering
    const legs = agentState?.agent_outputs?.travel?.legs;
    if (legs && legs.length > 1 && legs[selectedLegIdx]) {
      const activeLegCity = legs[selectedLegIdx].city.toLowerCase();
      list = list.filter(f => 
        f.destination.toLowerCase() === activeLegCity || 
        f.destination.toLowerCase().includes(activeLegCity) || 
        activeLegCity.includes(f.destination.toLowerCase())
      );
    }

    // Apply filters
    if (flightStopsFilter !== 'all') {
      const maxStops = flightStopsFilter === 'direct' ? 0 : 1;
      list = list.filter(f => f.stops <= maxStops);
    }
    if (flightMaxPrice !== '') {
      const maxVal = parseFloat(flightMaxPrice);
      if (!isNaN(maxVal)) {
        list = list.filter(f => f.displayedPrice <= maxVal);
      }
    }
    if (selectedAirlines.length > 0) {
      list = list.filter(f => selectedAirlines.includes(f.airline));
    }

    // Apply sorting
    list.sort((a, b) => {
      let valA, valB;
      if (flightSort === 'price') {
        valA = a.displayedPrice;
        valB = b.displayedPrice;
      } else if (flightSort === 'duration') {
        valA = a.duration;
        valB = b.duration;
      } else if (flightSort === 'rating') {
        valA = a.rating;
        valB = b.rating;
      } else {
        valA = a.score;
        valB = b.score;
      }
      if (valA < valB) return flightSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return flightSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  };

  const getSelectedFlight = () => {
    const list = getProcessedFlights();
    if (list.length === 0) return null;
    const match = list.find(f => (f.airline + '_' + f.price + '_' + f.departure) === selectedFlightId);
    return match || list[0];
  };

  const getSelectedHotel = () => {
    const list = agentState?.agent_outputs?.hotels && !agentState.agent_outputs.hotels.skipped ? agentState.agent_outputs.hotels : [];
    
    // Multi-leg filtering
    const legs = agentState?.agent_outputs?.travel?.legs;
    let filteredList = list;
    if (legs && legs.length > 1 && legs[selectedLegIdx]) {
      const activeLegCity = legs[selectedLegIdx].city.toLowerCase();
      filteredList = list.filter(h => 
        h.city?.toLowerCase() === activeLegCity || 
        h.city?.toLowerCase().includes(activeLegCity) || 
        activeLegCity.includes(h.city?.toLowerCase())
      );
    }
    
    if (filteredList.length === 0) return null;
    const match = filteredList.find(h => (h.name + '_' + h.price) === selectedHotelId);
    return match || filteredList[0];
  };

  const getIataCode = (city) => {
    if (!city) return '';
    const mapping = {
      'bangalore': 'BLR',
      'bengaluru': 'BLR',
      'delhi': 'DEL',
      'new delhi': 'DEL',
      'mumbai': 'BOM',
      'chennai': 'MAA',
      'coimbatore': 'CJB',
      'kannur': 'CNN',
      'paris': 'CDG',
      'london': 'LHR',
      'singapore': 'SIN',
      'tokyo': 'NRT',
      'new york': 'JFK',
      'hyderabad': 'HYD',
      'kolkata': 'CCU',
      'pune': 'PNQ',
      'kochi': 'COK',
      'goa': 'GOI',
      'agra': 'DEL',
      'ooty': 'CJB',
      'coorg': 'CNN',
      'pondicherry': 'MAA'
    };
    const key = city.trim().toLowerCase();
    return mapping[key] || key.substring(0, 3).toUpperCase();
  };

  const getMakeMyTripFlightUrl = (flight) => {
    if (!flight) return '';
    const originIata = getIataCode(flight.origin);
    const destIata = getIataCode(flight.destination);
    
    const travelDate = agentState?.agent_outputs?.travel?.dates || '';
    let formattedDate = '';
    if (travelDate) {
      const parts = travelDate.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
      }
    }
    
    const classMapping = {
      economy: 'E',
      premium_economy: 'W',
      business: 'B',
      first_class: 'F'
    };
    const cabin = classMapping[flightClass] || 'E';
    
    if (originIata && destIata && formattedDate) {
      return `https://www.makemytrip.com/flight/search?itinerary=${originIata}-${destIata}-${formattedDate}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=${cabin}`;
    }
    
    return `https://www.makemytrip.com/flight/search?itinerary=${flight.origin}-${flight.destination}&tripType=O`;
  };

  const getMakeMyTripHotelUrl = (hotel) => {
    if (!hotel) return '';
    
    const checkinStr = agentState?.agent_outputs?.travel?.dates || '';
    let checkin = '';
    let checkout = '';
    
    if (checkinStr) {
      const parts = checkinStr.split('-');
      if (parts.length === 3) {
        checkin = `${parts[2]}${parts[1]}${parts[0]}`; // DDMMYYYY
        
        try {
          const checkinDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
          const checkoutDateObj = new Date(checkinDateObj.getTime() + 2 * 24 * 60 * 60 * 1000);
          
          const dd = String(checkoutDateObj.getDate()).padStart(2, '0');
          const mm = String(checkoutDateObj.getMonth() + 1).padStart(2, '0');
          const yyyy = checkoutDateObj.getFullYear();
          checkout = `${dd}${mm}${yyyy}`; // DDMMYYYY
        } catch (e) {
          checkout = checkin;
        }
      }
    }
    
    if (checkin && checkout) {
      return `https://www.makemytrip.com/hotels/hotel-listing/?searchText=${encodeURIComponent(hotel.name + ', ' + hotel.city)}&checkin=${checkin}&checkout=${checkout}&roomStayQualifier=1e0e&locusType=hotel&country=IN`;
    }
    
    return `https://www.google.com/search?q=${encodeURIComponent('MakeMyTrip hotel ' + hotel.name + ' in ' + hotel.city)}`;
  };

  const getUpdatedEmailBody = (baseBody, flight, hotel) => {
    if (!baseBody) return "";
    
    // Clean up any old booking links block if it was already appended
    let cleanedBody = baseBody.split("\n\n--- BOOKING DETAILS ---")[0];
    cleanedBody = cleanedBody.split("\n\n--- BOOKING LINKS ---")[0];
    cleanedBody = cleanedBody.split("\n\n--- PLANNED ACTIVITIES ---")[0];
    
    let bookingBlock = "\n\n--- BOOKING LINKS ---";
    
    if (flight) {
      const flightUrl = getMakeMyTripFlightUrl(flight);
      bookingBlock += `\n✈️ Selected Flight: ${flight.airline} (${flight.origin} -> ${flight.destination}) - INR ${flight.displayedPrice.toLocaleString()} (${flightClass.replace('_', ' ')})\n   Book Flight (MakeMyTrip): ${flightUrl}\n`;
    }
    
    if (hotel) {
      const hotelUrl = getMakeMyTripHotelUrl(hotel);
      bookingBlock += `\n🏢 Selected Hotel: ${hotel.name} - INR ${hotel.price.toLocaleString()}/night\n   Book Hotel (MakeMyTrip): ${hotelUrl}\n`;
    }

    if (selectedSpots.length > 0) {
      bookingBlock += `\n\n--- PLANNED ACTIVITIES ---`;
      selectedSpots.forEach((spot, i) => {
        bookingBlock += `\n📍 Day ${i + 1}: ${spot}`;
      });
      bookingBlock += `\n`;
    }
    
    return cleanedBody + bookingBlock;
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
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="btn-vintage-pill py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Toggle Theme"
            >
              <span className="text-base select-none">{theme === 'light' ? '🌙' : '☀️'}</span>
              <span className="hidden sm:inline font-retro-mono font-bold uppercase tracking-wider text-[10px]">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Profile Memory Button */}
            <button
              type="button"
              onClick={() => setIsMemoryOpen(true)}
              className="btn-vintage-pill py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Edit Profile Preferences"
            >
              <User className="h-3.5 w-3.5 text-(--color-terracotta)" />
              <span className="hidden sm:inline font-retro-mono font-bold uppercase tracking-wider text-[10px]">
                Profile
              </span>
            </button>
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

              {/* Multi-Leg Travel Tabs Selector */}
              {outputs.travel?.legs?.length > 1 && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl panel-neu-inset bg-(--bg-cream) border border-white/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)]">
                  <span className="text-[10px] font-retro-mono font-bold uppercase tracking-wider text-neutral-450">
                    🌍 MULTI-LEG ITINERARY DETECTED • SELECT ACTIVE TRIP STOP:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {outputs.travel.legs.map((leg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedLegIdx(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-retro-mono font-bold uppercase tracking-wide transition-all border cursor-pointer ${
                          selectedLegIdx === idx
                            ? 'bg-(--bg-cream) text-(--color-terracotta) border-(--color-terracotta)/20 shadow-[2px_2px_4px_rgba(0,0,0,0.06),-2px_-2px_4px_#fff]'
                            : 'bg-transparent text-neutral-500 border-transparent hover:text-neutral-700'
                        }`}
                      >
                        📍 {leg.city} ({leg.start_date})
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                      <div className="space-y-3.5 text-sm">
                        <div className="font-retro-mono font-bold text-(--color-terracotta) flex items-center gap-1.5">
                          <span>📍 {outputs.travel.city} ({outputs.travel.dates})</span>
                        </div>
                        {/* Weather Forecast Outlook */}
                        <div className="panel-neu-inset bg-(--bg-cream) p-3 font-body text-xs leading-relaxed text-neutral-600 flex items-start gap-2.5">
                          <span className="text-2xl mt-0.5 shrink-0 select-none">
                            {outputs.travel.weather_summary?.toLowerCase().includes('rain') ? '🌧️' :
                             outputs.travel.weather_summary?.toLowerCase().includes('cloud') ? '⛅' :
                             outputs.travel.weather_summary?.toLowerCase().includes('drizzle') ? '🌦️' :
                             outputs.travel.weather_summary?.toLowerCase().includes('wind') ? '💨' : '☀️'}
                          </span>
                          <div>
                            <div className="font-bold text-(--color-terracotta) mb-0.5 uppercase tracking-wide text-[9px] font-retro-mono">Forecast Outlook</div>
                            <p className="italic">"{outputs.travel.weather_summary}"</p>
                          </div>
                        </div>
                        {/* Interactive Packing Checklist */}
                        <div className="text-xs">
                          <span className="font-bold text-neutral-500 font-retro-mono block mb-2 uppercase tracking-wide text-[10px]">Packing Checklist:</span>
                          <div className="grid grid-cols-2 gap-2 font-retro-mono">
                            {outputs.travel.packing_list?.map((item, idx) => {
                              const isPacked = packedItems.includes(item);
                              return (
                                <label 
                                  key={idx} 
                                  className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-all border ${
                                    isPacked 
                                      ? 'bg-green-500/10 border-green-500/20 text-neutral-500 line-through' 
                                      : 'bg-(--bg-cream) border-transparent hover:bg-neutral-50/10 text-neutral-700'
                                  }`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isPacked}
                                    onChange={() => {
                                      if (isPacked) {
                                        setPackedItems(packedItems.filter(i => i !== item));
                                      } else {
                                        setPackedItems([...packedItems, item]);
                                      }
                                    }}
                                    className="accent-(--color-terracotta) h-3.5 w-3.5 rounded"
                                  />
                                  <span className="truncate">{item}</span>
                                </label>
                              );
                            })}
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

                {/* Node 01.5 Interactive Sightseeing & Itinerary Planner */}
                {outputs.travel && (
                  <div className="card-vintage p-5 flex flex-col justify-between min-h-55">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-retro-mono font-bold text-(--color-terracotta) uppercase tracking-wider">
                          NODE 01.5 // SIGHTSEEING
                        </span>
                        <span className="text-[10px] font-retro-mono font-bold px-2 py-0.5 rounded-full uppercase bg-green-500 text-white shadow-sm">
                          Completed
                        </span>
                      </div>

                      <h4 className="font-title font-bold text-xl text-neutral-700 mb-2">Sightseeing Planner</h4>
                      
                      <div className="space-y-2 text-xs font-retro-mono">
                        <p className="text-neutral-500 mb-2 italic">Select tourist sights to build your Day-by-Day itinerary:</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {getTouristSpots(outputs.travel.city).map((spot, idx) => {
                            const isChecked = selectedSpots.includes(spot);
                            return (
                              <label 
                                key={idx} 
                                className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${
                                  isChecked 
                                    ? 'panel-neu-inset border-(--color-terracotta)/30 bg-(--bg-cream-dark)/20 font-semibold text-neutral-800' 
                                    : 'bg-(--bg-cream) border-transparent hover:bg-neutral-50/10 text-neutral-600'
                                }`}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedSpots(selectedSpots.filter(s => s !== spot));
                                    } else {
                                      setSelectedSpots([...selectedSpots, spot]);
                                    }
                                  }}
                                  className="accent-(--color-terracotta) h-4 w-4 rounded"
                                />
                                <span>{spot}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}                {/* Finance Agent Card */}
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
                    
                    {outputs.flights && !outputs.flights.skipped && (
                      <div className="mb-4">
                        {/* Class Selection Tabs */}
                        <div className="flex justify-between gap-1 p-1 rounded-2xl panel-neu-inset text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
                          {['economy', 'premium_economy', 'business', 'first_class'].map((cls) => (
                            <button
                              key={cls}
                              onClick={() => setFlightClass(cls)}
                              className={`flex-1 py-1 rounded-xl transition-all duration-200 cursor-pointer text-center whitespace-nowrap px-1 ${
                                flightClass === cls
                                  ? 'text-neutral-800 bg-(--bg-cream) shadow-[2px_2px_4px_rgba(0,0,0,0.06),-2px_-2px_4px_#fff] font-bold'
                                  : 'hover:text-neutral-700'
                              }`}
                            >
                              {cls.replace('_', ' ')}
                            </button>
                          ))}
                        </div>

                        {/* Collapsible Filter Toggle */}
                        <div className="flex justify-between items-center mb-3">
                          <button
                            onClick={() => setIsFlightFiltersOpen(!isFlightFiltersOpen)}
                            className="btn-vintage-pill text-[10px] py-1 px-3 flex items-center gap-1"
                          >
                            <span>Filters & Sort</span>
                            <ChevronDown className={`h-3 w-3 transition-transform ${isFlightFiltersOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {/* Quick Reset */}
                          {(flightStopsFilter !== 'all' || flightMaxPrice !== '' || selectedAirlines.length > 0 || flightSort !== 'score' || flightSortOrder !== 'desc') && (
                            <button
                              onClick={() => {
                                setFlightStopsFilter('all');
                                setFlightMaxPrice('');
                                setSelectedAirlines([]);
                                setFlightSort('score');
                                setFlightSortOrder('desc');
                              }}
                              className="text-[9px] font-retro-mono text-(--color-terracotta) hover:underline"
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>

                        {/* Filter & Sort Drawer */}
                        {isFlightFiltersOpen && (
                          <div className="panel-neu-inset p-3 rounded-2xl mb-4 text-xs font-retro-mono text-neutral-600 space-y-3 animate-fade-in">
                            {/* Sorting */}
                            <div>
                              <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Sort By</span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: 'Best Match', value: 'score', defaultOrder: 'desc' },
                                  { label: 'Price', value: 'price', defaultOrder: 'asc' },
                                  { label: 'Duration', value: 'duration', defaultOrder: 'asc' },
                                  { label: 'Rating', value: 'rating', defaultOrder: 'desc' }
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      if (flightSort === opt.value) {
                                        setFlightSortOrder(flightSortOrder === 'asc' ? 'desc' : 'asc');
                                      } else {
                                        setFlightSort(opt.value);
                                        setFlightSortOrder(opt.defaultOrder);
                                      }
                                    }}
                                    className={`py-0.5 px-2 rounded-lg border transition-all text-[10px] font-bold cursor-pointer ${
                                      flightSort === opt.value
                                        ? 'bg-neutral-850 text-white border-neutral-850 shadow-sm'
                                        : 'bg-white/60 text-neutral-600 border-white/60 hover:bg-white'
                                    }`}
                                  >
                                    {opt.label} {flightSort === opt.value ? (flightSortOrder === 'asc' ? '▲' : '▼') : ''}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Max Price & Stops */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Max Price (INR)</span>
                                <input
                                  type="number"
                                  placeholder="e.g. 50000"
                                  value={flightMaxPrice}
                                  onChange={(e) => setFlightMaxPrice(e.target.value)}
                                  className="w-full p-1 rounded-xl bg-white/60 border border-white/60 text-xs px-2 focus:bg-white focus:outline-none shadow-inner"
                                />
                              </div>

                              <div>
                                <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Stops Limit</span>
                                <div className="flex gap-1">
                                  {[
                                    { label: 'Any', value: 'all' },
                                    { label: 'Non-stop', value: 'direct' },
                                    { label: 'Max 1', value: '1stop' }
                                  ].map((opt) => (
                                    <button
                                      key={opt.value}
                                      onClick={() => setFlightStopsFilter(opt.value)}
                                      className={`flex-1 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                                        flightStopsFilter === opt.value
                                          ? 'bg-neutral-850 text-white shadow-sm'
                                          : 'bg-white/60 text-neutral-500 border border-white/60 hover:bg-white'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Airlines Checkboxes */}
                            <div>
                              <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Filter Airlines</span>
                              <div className="flex flex-wrap gap-x-3 gap-y-1.5 p-1.5 bg-white/40 rounded-xl">
                                {(() => {
                                  const airlines = outputs.flights ? [...new Set(outputs.flights.map(f => f.airline))] : [];
                                  return airlines.map((airline) => {
                                    const checked = selectedAirlines.includes(airline);
                                    return (
                                      <label key={airline} className="flex items-center gap-1.5 cursor-pointer text-[10px]">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            if (checked) {
                                              setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                            } else {
                                              setSelectedAirlines([...selectedAirlines, airline]);
                                            }
                                          }}
                                          className="rounded border-neutral-300 text-(--color-terracotta) focus:ring-(--color-terracotta)"
                                        />
                                        <span>{airline}</span>
                                      </label>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Nearby Airport Banner */}
                    {outputs.airport_info && !outputs.airport_info.has_airport && (
                      <div className="p-3.5 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-neutral-700 text-xs font-retro-mono flex gap-2.5 items-start shadow-inner">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-amber-800 mb-0.5">No direct airport facility</div>
                          <p className="text-[11px] leading-relaxed text-neutral-600">
                            Showing flights to <strong>{outputs.airport_info.airport_city} ({outputs.airport_info.airport_code})</strong>, 
                            which is {outputs.airport_info.distance} away from {outputs.travel?.city || 'destination'}. 
                            Ground transit: {outputs.airport_info.transit_time}.
                          </p>
                          {/* Transit Booking Links */}
                          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-amber-500/20">
                            <span className="text-[9px] uppercase font-bold text-amber-800/70 block w-full mb-0.5">Book Ground Transit:</span>
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent('MakeMyTrip cab booking from ' + outputs.airport_info.airport_city + ' to ' + (outputs.travel?.city || ''))}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 font-bold px-2 py-0.5 rounded-md transition-all"
                            >
                              Taxi Cab ↗
                            </a>
                            <a 
                              href={`https://www.redbus.in/search?fromCityName=${encodeURIComponent(outputs.airport_info.airport_city)}&toCityName=${encodeURIComponent(outputs.travel?.city || '')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 font-bold px-2 py-0.5 rounded-md transition-all"
                            >
                              redBus Bus ↗
                            </a>
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent('MakeMyTrip trains from ' + outputs.airport_info.airport_city + ' to ' + (outputs.travel?.city || ''))}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 font-bold px-2 py-0.5 rounded-md transition-all"
                            >
                              IRCTC Train ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    {outputs.flights ? (
                      outputs.flights.skipped ? (
                        <div className="space-y-3 mt-2">
                          <div className="panel-neu-inset p-3 text-xs font-retro-mono text-neutral-500 italic text-center">
                            {outputs.flights.reason}
                          </div>
                          {outputs.travel && (
                            <div className="panel-neu-inset p-3 rounded-2xl bg-(--bg-cream) space-y-2 border border-white/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)]">
                              <span className="font-bold font-retro-mono text-neutral-500 block text-[9px] uppercase tracking-wide">Road Trip / Transit Search:</span>
                              <div className="flex flex-wrap gap-2">
                                <a 
                                  href={`https://www.google.com/search?q=${encodeURIComponent('MakeMyTrip cab booking to ' + outputs.travel.city)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 font-bold px-2 py-0.5 rounded-md transition-all"
                                >
                                  Book Cab ↗
                                </a>
                                <a 
                                  href={`https://www.redbus.in/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 font-bold px-2 py-0.5 rounded-md transition-all"
                                >
                                  redBus Search ↗
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 pt-3 mt-2 border-t border-white/50">
                          {(() => {
                            const classMultipliers = {
                              economy: 1.0,
                              premium_economy: 1.5,
                              business: 2.5,
                              first_class: 4.0
                            };
                            const multiplier = classMultipliers[flightClass] || 1.0;

                            let list = outputs.flights.map(f => ({
                              ...f,
                              displayedPrice: Math.round(f.price * multiplier)
                            }));

                            // Multi-leg filtering
                            const legs = outputs.travel?.legs;
                            if (legs && legs.length > 1 && legs[selectedLegIdx]) {
                              const activeLegCity = legs[selectedLegIdx].city.toLowerCase();
                              list = list.filter(f => 
                                f.destination.toLowerCase() === activeLegCity || 
                                f.destination.toLowerCase().includes(activeLegCity) || 
                                activeLegCity.includes(f.destination.toLowerCase())
                              );
                            }

                            // Apply filters
                            if (flightStopsFilter !== 'all') {
                              const maxStops = flightStopsFilter === 'direct' ? 0 : 1;
                              list = list.filter(f => f.stops <= maxStops);
                            }
                            if (flightMaxPrice !== '') {
                              const maxVal = parseFloat(flightMaxPrice);
                              if (!isNaN(maxVal)) {
                                list = list.filter(f => f.displayedPrice <= maxVal);
                              }
                            }
                            if (selectedAirlines.length > 0) {
                              list = list.filter(f => selectedAirlines.includes(f.airline));
                            }
                            // Apply sorting
                            list.sort((a, b) => {
                              let valA, valB;
                              if (flightSort === 'price') {
                                valA = a.displayedPrice;
                                valB = b.displayedPrice;
                              } else if (flightSort === 'duration') {
                                valA = a.duration;
                                valB = b.duration;
                              } else if (flightSort === 'rating') {
                                valA = a.rating;
                                valB = b.rating;
                              } else {
                                valA = a.score;
                                valB = b.score;
                              }
                              if (valA < valB) return flightSortOrder === 'asc' ? -1 : 1;
                              if (valA > valB) return flightSortOrder === 'asc' ? 1 : -1;
                              return 0;
                            });

                            if (list.length === 0) {
                              return (
                                <div className="p-4 text-center text-neutral-400 font-retro-mono italic">
                                  No flights matching active filters.
                                </div>
                              );
                            }

                            return list.map((flight, idx) => {
                              const flightSig = flight.airline + '_' + flight.price + '_' + flight.departure;
                              const isSelected = selectedFlightId === flightSig;
                              const searchUrl = getMakeMyTripFlightUrl(flight);
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setSelectedFlightId(flightSig)}
                                  className={`p-3.5 rounded-2xl font-retro-mono text-xs transition-all mb-2 cursor-pointer border ${
                                    isSelected 
                                      ? 'panel-neu-inset border-(--color-terracotta)/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08)] bg-(--bg-cream-dark)/30 font-semibold' 
                                      : 'card-vintage shadow-sm border-transparent hover:bg-neutral-50/20'
                                  }`}
                                >
                                  <div className="flex justify-between items-start font-bold text-neutral-700 mb-1">
                                    <span className="flex items-center gap-1.5 flex-wrap min-w-0 mr-2">
                                      <span className="truncate">✈️ {flight.airline}</span>
                                      {isSelected && (
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-(--color-terracotta) bg-(--color-terracotta)/10 px-1.5 py-0.5 rounded-md animate-fade-in shadow-inner shrink-0">
                                          Selected
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-(--color-terracotta) shrink-0 text-right">
                                      INR {flight.displayedPrice.toLocaleString()} 
                                      <span className="text-[9px] font-normal text-neutral-450 ml-1">
                                        ({flightClass.replace('_', ' ')})
                                      </span>
                                    </span>
                                  </div>
                                  <div className="text-neutral-500 text-xs mt-1.5">
                                    {flight.origin && flight.destination && (
                                      <div className="font-bold text-neutral-600 mb-1 text-[10px] uppercase tracking-wider">
                                        {flight.origin} ➔ {flight.destination}
                                      </div>
                                    )}
                                    {flight.departure} → {flight.arrival} ({flight.duration}h) • {flight.stops} stop(s)
                                  </div>
                                  <div className="flex justify-between items-center text-xs mt-3.5 text-neutral-450 pt-2 border-t border-white/40">
                                    <span>Rating: {flight.rating}⭐ • Score: {flight.score}</span>
                                    <a 
                                      href={searchUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-(--color-terracotta) hover:underline font-bold text-[10px] uppercase flex items-center gap-0.5"
                                    >
                                      Book on MakeMyTrip ↗
                                    </a>
                                  </div>
                                </div>
                              );
                            });
                          })()}
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
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-3 pt-3 mt-2 border-t border-white/50">
                          {(() => {
                            const legs = outputs.travel?.legs;
                            let list = outputs.hotels;
                            if (legs && legs.length > 1 && legs[selectedLegIdx]) {
                              const activeLegCity = legs[selectedLegIdx].city.toLowerCase();
                              list = list.filter(h => 
                                h.city?.toLowerCase() === activeLegCity || 
                                h.city?.toLowerCase().includes(activeLegCity) || 
                                activeLegCity.includes(h.city?.toLowerCase())
                              );
                            }
                            if (list.length === 0) {
                              return (
                                <div className="p-4 text-center text-neutral-400 font-retro-mono italic">
                                  No hotel options for this leg.
                                </div>
                              );
                            }
                            return list.map((hotel, idx) => {
                              const hotelSig = hotel.name + '_' + hotel.price;
                              const isSelected = selectedHotelId === hotelSig;
                              const searchUrl = getMakeMyTripHotelUrl(hotel);

                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setSelectedHotelId(hotelSig)}
                                  className={`p-3.5 rounded-2xl font-retro-mono text-xs transition-all mb-2 cursor-pointer border ${
                                    isSelected 
                                      ? 'panel-neu-inset border-(--color-terracotta)/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08)] bg-(--bg-cream-dark)/30 font-semibold' 
                                      : 'card-vintage shadow-sm border-transparent hover:bg-neutral-50/20 bg-(--bg-cream)'
                                  }`}
                                >
                                  <div className="flex justify-between items-start font-bold text-neutral-700 mb-1">
                                    <span className="flex items-center gap-1.5 flex-wrap min-w-0 mr-2">
                                      <span className="truncate">🏢 {hotel.name}</span>
                                      {isSelected && (
                                        <span className="text-[9px] uppercase font-bold tracking-wider text-(--color-terracotta) bg-(--color-terracotta)/10 px-1.5 py-0.5 rounded-md animate-fade-in shadow-inner shrink-0">
                                          Selected
                                        </span>
                                      )}
                                    </span>
                                    <span className="shrink-0 text-right">INR {hotel.price.toLocaleString()}/night</span>
                                  </div>
                                  <div className="text-neutral-500 text-xs mt-1">
                                    Category: {hotel.category} • Dist: {hotel.distance}km • Safety: {hotel.safety_score}/100
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {hotel.amenities?.map((am, i) => (
                                      <span key={i} className="text-[10px] px-2 py-0.5 bg-(--bg-cream) rounded-full shadow-sm text-neutral-600">{am}</span>
                                    ))}
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-neutral-400 border-t border-white/40 pt-2 mt-3.5">
                                    <span>Rating: {hotel.rating}⭐ • Score: {hotel.overall_score}</span>
                                    <a 
                                      href={searchUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-(--color-terracotta) hover:underline font-bold text-[10px] uppercase flex items-center gap-0.5"
                                    >
                                      Book on MakeMyTrip ↗
                                    </a>
                                  </div>
                                </div>
                              );
                            });
                          })()}
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

                        {(() => {
                          const flightObj = getSelectedFlight();
                          const hotelObj = getSelectedHotel();
                          
                          const flightCost = flightObj ? flightObj.displayedPrice : 0;
                          const hotelCost = hotelObj ? (hotelObj.price * 3) : 0;
                          const activityCost = selectedSpots.length * 1500;
                          
                          const hasWarning = outputs.airport_info && !outputs.airport_info.has_airport;
                          const transitCost = hasWarning ? 2000 : 0;
                          
                          const totalSelectedCost = flightCost + hotelCost + activityCost + transitCost;
                          const percent = Math.min(Math.round((totalSelectedCost / budgetLimit) * 100), 200);
                          
                          // Donut properties
                          const radius = 30;
                          const circumference = 2 * Math.PI * radius;
                          const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;
                          
                          // Colors based on percentage
                          const gaugeColor = percent > 100 ? 'stroke-red-500' : percent > 85 ? 'stroke-amber-500' : 'stroke-emerald-500';
                          const textColor = percent > 100 ? 'text-red-600' : percent > 85 ? 'text-amber-600' : 'text-emerald-600';

                          return (
                            <div className="space-y-4">
                              <div className="panel-neu-inset bg-(--bg-cream) p-4 rounded-2xl space-y-4 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)] border border-white/40">
                                <div className="flex items-center gap-4">
                                  {/* SVG Donut Chart */}
                                  <div className="relative h-16 w-16 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                                      <circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
                                      <circle 
                                        cx="40" 
                                        cy="40" 
                                        r={radius} 
                                        className={`transition-all duration-500 ${gaugeColor}`} 
                                        strokeWidth="6" 
                                        strokeDasharray={circumference} 
                                        strokeDashoffset={strokeDashoffset} 
                                        strokeLinecap="round" 
                                        fill="transparent" 
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center font-retro-mono text-center">
                                      <span className={`text-[11px] font-bold ${textColor}`}>{percent}%</span>
                                      <span className="text-[6px] text-neutral-450 uppercase font-bold tracking-wide">Used</span>
                                    </div>
                                  </div>
                                  
                                  {/* Quick budget stats */}
                                  <div className="flex-1 text-xs space-y-1 font-retro-mono">
                                    <div className="flex justify-between">
                                      <span className="text-neutral-450 uppercase text-[9px]">TOTAL BUDGET:</span>
                                      <span className="font-bold text-neutral-700">INR {budgetLimit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-450 uppercase text-[9px]">SELECTED COST:</span>
                                      <span className={`font-bold ${textColor}`}>INR {totalSelectedCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-dashed border-neutral-350 mt-1">
                                      {percent > 100 ? (
                                        <span className="text-red-500 font-bold uppercase tracking-wide animate-pulse">⚠️ OVER BUDGET LIMIT</span>
                                      ) : (
                                        <span className="text-emerald-600 font-bold uppercase tracking-wide">✓ WITHIN BUDGET LIMIT</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Cost allocation breakdown */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-retro-mono pt-2 border-t border-white/50">
                                  <div className="flex items-center gap-1.5 text-neutral-600 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-terracotta) shrink-0"></span>
                                    <span className="truncate">Flights: INR {flightCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-neutral-600 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-olive) shrink-0"></span>
                                    <span className="truncate">Lodging: INR {hotelCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-neutral-600 min-w-0 col-span-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                    <span className="truncate">Activities: INR {activityCost.toLocaleString()} ({selectedSpots.length} spots)</span>
                                  </div>
                                  {transitCost > 0 && (
                                    <div className="flex items-center gap-1.5 text-neutral-600 min-w-0 col-span-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                      <span className="truncate">Ground Transit: INR {transitCost.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Target range slider widget */}
                              <div className="panel-neu-inset bg-(--bg-cream) p-3 rounded-2xl space-y-2 border border-white/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                                  <span>Adjust Budget Target:</span>
                                  <span className="text-(--color-terracotta) font-retro-mono font-bold">INR {budgetLimit.toLocaleString()}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="5000"
                                  max="100000"
                                  step="1000"
                                  value={budgetLimit}
                                  onChange={(e) => setBudgetLimit(parseInt(e.target.value, 10))}
                                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-(--color-terracotta) slider-neu-track"
                                />
                              </div>

                              {/* Auto-optimize helper button */}
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleAutoOptimize}
                                  className="btn-vintage-pill text-[10px] py-1 px-3 flex items-center gap-1 font-retro-mono font-bold uppercase text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer shadow-[2px_2px_4px_var(--shadow-dark)]"
                                >
                                  <span>✨ Auto-Optimize Booking</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}

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
                          {outputs.calendar_conflicts.hasConflict && !selectedAlternateSlot ? (
                            <div className="bg-red-50/80 rounded-2xl p-3 text-red-900 space-y-1.5 border border-red-200/50 shadow-sm">
                              <span className="font-bold block text-[9px] uppercase tracking-wider">CONFLICT DETECTED:</span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {outputs.calendar_conflicts.conflicts?.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-green-50/80 rounded-2xl p-3 text-green-900 text-xs font-bold flex items-center gap-1.5 border border-green-200/50 shadow-sm">
                              <span>✔</span>
                              <span>{selectedAlternateSlot ? "Conflict resolved manually via slot override." : "No scheduling conflicts detected. Slots clear."}</span>
                            </div>
                          )}
                          {outputs.calendar_conflicts.suggestedSlots?.length > 0 && (
                            <div>
                              <span className="font-bold text-neutral-450 block uppercase text-[10px] mb-1.5">ALTERNATES SUGGESTED:</span>
                              <div className="space-y-1.5">
                                {outputs.calendar_conflicts.suggestedSlots.map((slot, i) => {
                                  const isSelectedSlot = selectedAlternateSlot === slot;
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => handleSelectAlternateSlot(slot)}
                                      className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border text-xs font-bold ${
                                        isSelectedSlot
                                          ? 'panel-neu-inset border-green-500/40 bg-green-500/10 text-neutral-850 dark:text-white'
                                          : 'bg-(--bg-cream) border-transparent hover:bg-neutral-50/15 text-neutral-650'
                                      }`}
                                    >
                                      {isSelectedSlot ? '✅ ' : '⏰ '} {slot}
                                    </button>
                                  );
                                })}
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
                        <div className="panel-neu-inset p-3 text-xs font-retro-mono max-h-48 overflow-y-auto whitespace-pre-line text-neutral-650 bg-(--bg-cream)">
                          {getUpdatedEmailBody(outputs.email.body, getSelectedFlight(), getSelectedHotel())}
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

      {/* PROFILE / MEMORY SETTINGS DRAWER OVERLAY */}
      {isMemoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsMemoryOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-(--bg-cream) shadow-[-10px_0_30px_rgba(0,0,0,0.15)] p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-vintage-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-(--color-terracotta)" />
                  <h3 className="font-title font-bold text-xl text-neutral-800">Memory Preferences</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMemoryOpen(false)}
                  className="btn-vintage-pill py-1 px-3 text-xs"
                >
                  Close
                </button>
              </div>

              <form className="space-y-4 font-retro-mono text-xs text-neutral-600">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Home City:</label>
                  <input
                    type="text"
                    value={memoryForm.home_city}
                    onChange={(e) => setMemoryForm({ ...memoryForm, home_city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Preferred Airline:</label>
                  <input
                    type="text"
                    value={memoryForm.preferred_airline}
                    onChange={(e) => setMemoryForm({ ...memoryForm, preferred_airline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Preferred Hotel Class:</label>
                  <select
                    value={memoryForm.preferred_hotel_type}
                    onChange={(e) => setMemoryForm({ ...memoryForm, preferred_hotel_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Business">Business</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-455 uppercase text-[9px]">Seat Preference:</label>
                    <input
                      type="text"
                      value={memoryForm.seat}
                      onChange={(e) => setMemoryForm({ ...memoryForm, seat: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-455 uppercase text-[9px]">Meal Preference:</label>
                    <input
                      type="text"
                      value={memoryForm.meal}
                      onChange={(e) => setMemoryForm({ ...memoryForm, meal: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Target Budget limit (INR):</label>
                  <input
                    type="number"
                    value={memoryForm.budget}
                    onChange={(e) => setMemoryForm({ ...memoryForm, budget: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Travel Style / Notes:</label>
                  <input
                    type="text"
                    value={memoryForm.travel_style}
                    onChange={(e) => setMemoryForm({ ...memoryForm, travel_style: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-(--bg-cream) panel-neu-inset focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-455 uppercase text-[9px]">Frequently Visited Cities:</label>
                  <div className="panel-neu-inset p-3 rounded-2xl flex flex-wrap gap-1.5 min-h-16 max-h-32 overflow-y-auto bg-(--bg-cream)">
                    {memoryForm.frequently_visited_cities.map((city, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-(--bg-cream) dark:bg-(--bg-cream-dark) rounded-full shadow-sm text-neutral-700 font-bold border border-white/20">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-vintage-t flex gap-3">
              <button
                type="button"
                onClick={() => setIsMemoryOpen(false)}
                className="btn-vintage flex-1 justify-center text-center font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMemory}
                className="btn-vintage btn-vintage-primary flex-1 justify-center text-center font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

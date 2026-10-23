import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Eye, Maximize2, Navigation, Layers } from 'lucide-react';

// City Geo Coordinate Registry with Precise Landmarks
const CITY_COORDINATES = {
  'london': {
    lat: 51.5074, lng: -0.1278,
    code: 'LON',
    airport: { name: 'Heathrow International (LHR)', code: 'LHR', lat: 51.4700, lng: -0.4543 },
    hotelOffset: { lat: 51.5135, lng: -0.1415 } // Mayfair / Soho district
  },
  'paris': {
    lat: 48.8566, lng: 2.3522,
    code: 'PAR',
    airport: { name: 'Charles de Gaulle (CDG)', code: 'CDG', lat: 49.0097, lng: 2.5479 },
    hotelOffset: { lat: 48.8698, lng: 2.3080 } // Champs-Élysées
  },
  'bangalore': {
    lat: 12.9716, lng: 77.5946,
    code: 'BLR',
    airport: { name: 'Kempegowda Intl (BLR)', code: 'BLR', lat: 13.1986, lng: 77.7066 },
    hotelOffset: { lat: 12.9750, lng: 77.6050 } // Indiranagar / MG Road
  },
  'mumbai': {
    lat: 19.0760, lng: 72.8777,
    code: 'BOM',
    airport: { name: 'Chhatrapati Shivaji (BOM)', code: 'BOM', lat: 19.0896, lng: 72.8656 },
    hotelOffset: { lat: 18.9220, lng: 72.8347 } // Colaba
  },
  'chennai': {
    lat: 13.0827, lng: 80.2707,
    code: 'MAA',
    airport: { name: 'Chennai International (MAA)', code: 'MAA', lat: 12.9941, lng: 80.1709 },
    hotelOffset: { lat: 13.0500, lng: 80.2500 }
  },
  'tokyo': {
    lat: 35.6762, lng: 139.6503,
    code: 'TYO',
    airport: { name: 'Tokyo Haneda (HND)', code: 'HND', lat: 35.5494, lng: 139.7798 },
    hotelOffset: { lat: 35.6895, lng: 139.6917 } // Shinjuku
  },
  'new york': {
    lat: 40.7128, lng: -74.0060,
    code: 'NYC',
    airport: { name: 'John F. Kennedy Intl (JFK)', code: 'JFK', lat: 40.6413, lng: -73.7781 },
    hotelOffset: { lat: 40.7580, lng: -73.9855 } // Midtown Manhattan
  },
  'leh': {
    lat: 34.1526, lng: 77.5771,
    code: 'IXL',
    airport: { name: 'Kushok Bakula Rimpochee (IXL)', code: 'IXL', lat: 34.1359, lng: 77.5465 },
    hotelOffset: { lat: 34.1600, lng: 77.5850 }
  },
  'kodaikanal': {
    lat: 10.2381, lng: 77.4892,
    code: 'KOD',
    airport: { name: 'Madurai International (IXM)', code: 'IXM', lat: 9.8345, lng: 78.0934 },
    hotelOffset: { lat: 10.2350, lng: 77.4900 }
  },
  'goa': {
    lat: 15.2993, lng: 74.1240,
    code: 'GOI',
    airport: { name: 'Dabolim Airport (GOI)', code: 'GOI', lat: 15.3808, lng: 73.8314 },
    hotelOffset: { lat: 15.4989, lng: 73.8278 }
  }
};

// Generates realistic offsets around downtown core
const getSpotCoords = (baseLat, baseLng, index) => {
  const radii = [0.012, 0.018, 0.015, 0.022, 0.017];
  const angles = [0.6, 2.1, 3.8, 5.0, 1.4];
  const r = radii[index % radii.length];
  const theta = angles[index % angles.length];
  return [baseLat + r * Math.cos(theta), baseLng + r * Math.sin(theta)];
};

export default function JourneyMap({ city = 'London', hotel, spots = [], className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('dark'); // 'dark' or 'satellite'

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const cityKey = (city || 'London').toLowerCase().trim();
    const cityData = CITY_COORDINATES[cityKey] || {
      lat: 51.5074,
      lng: -0.1278,
      code: 'DEST',
      airport: { name: 'Metropolitan Terminal', code: 'AIR', lat: 51.4700, lng: -0.4543 },
      hotelOffset: { lat: 51.5135, lng: -0.1415 }
    };

    // 1. Initialize Leaflet Map once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [cityData.lat, cityData.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Executive Dark Gray Canvas (High-res, muted obsidian slate for elite telemetry)
      const baseDark = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        subdomains: ['server', 'services']
      }).addTo(map);

      // Fine typography overlay labels
      const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.85
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Smoothly glide camera
    map.flyTo([cityData.lat, cityData.lng], 12, { duration: 1.2 });

    const routePoints = [];

    // ==========================================
    // 1. LUXURY AERONAUTICAL HUB / AIRPORT
    // ==========================================
    if (cityData.airport) {
      const airportHtml = `
        <div class="luxury-marker airport-marker" style="position: relative; cursor: pointer;">
          <div style="position: absolute; -inset: 6px; border-radius: 9999px; background: rgba(56, 189, 248, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.95); border: 1.5px solid #38bdf8; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 8px 24px -4px rgba(56, 189, 248, 0.45), 0 0 12px rgba(56, 189, 248, 0.3); backdrop-filter: blur(8px);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
            </svg>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #f8fafc; letter-spacing: 0.08em; text-transform: uppercase;">
              ${cityData.airport.code || 'AIR'}
            </span>
          </div>
        </div>
      `;

      const airportIcon = L.divIcon({
        className: 'luxury-marker-container',
        html: airportHtml,
        iconSize: [80, 32],
        iconAnchor: [40, 16]
      });

      L.marker([cityData.airport.lat, cityData.airport.lng], { icon: airportIcon })
        .bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px; color: #f8fafc; min-width: 180px;">
            <div style="font-size: 9px; font-weight: 700; color: #38bdf8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px;">Flight Gateway</div>
            <div style="font-size: 13px; font-weight: 600; line-height: 1.3;">${cityData.airport.name}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span> Telemetry Online
            </div>
          </div>
        `, { className: 'executive-dark-popup' })
        .addTo(markersLayer);

      routePoints.push([cityData.airport.lat, cityData.airport.lng]);
    }

    // ==========================================
    // 2. LUXURY ACCOMMODATION / HOTEL PIN
    // ==========================================
    const hPos = cityData.hotelOffset || { lat: cityData.lat + 0.008, lng: cityData.lng - 0.006 };
    const hotelName = hotel?.name || `Executive Suites (${city})`;

    const hotelHtml = `
      <div class="luxury-marker hotel-marker" style="position: relative; cursor: pointer;">
        <div style="position: relative; display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg, rgba(24, 24, 27, 0.96), rgba(9, 9, 11, 0.98)); border: 1.5px solid #f59e0b; padding: 5px 12px; border-radius: 9999px; box-shadow: 0 10px 25px -3px rgba(245, 158, 11, 0.35), 0 0 16px rgba(245, 158, 11, 0.2); backdrop-filter: blur(8px);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 18h12"/>
            <path d="M6 14h12"/>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #fef3c7; letter-spacing: 0.06em; white-space: nowrap;">
            HOTEL // LODGING
          </span>
        </div>
        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #f59e0b;"></div>
      </div>
    `;

    const hotelIcon = L.divIcon({
      className: 'luxury-marker-container',
      html: hotelHtml,
      iconSize: [140, 34],
      iconAnchor: [70, 36]
    });

    L.marker([hPos.lat, hPos.lng], { icon: hotelIcon })
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 4px; color: #f8fafc; min-width: 200px;">
          <div style="font-size: 9px; font-weight: 700; color: #f59e0b; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px;">Reserved Lodging</div>
          <div style="font-size: 13px; font-weight: 600; line-height: 1.3;">${hotelName}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            <span style="color: #fbbf24;">★ ★ ★ ★ ★</span> Luxury Stay Selected
          </div>
        </div>
      `, { className: 'executive-dark-popup' })
      .addTo(markersLayer);

    routePoints.push([hPos.lat, hPos.lng]);

    // ==========================================
    // 3. CURATED SIGHTSEEING WAYPOINTS
    // ==========================================
    const curatedSpots = (spots && spots.length > 0) ? spots.slice(0, 5) : [
      'Historic Citadel & Palace',
      'National Fine Art Gallery',
      'Panoramic Skydeck Observation',
      'Riverside Heritage Esplanade'
    ];

    curatedSpots.forEach((spot, i) => {
      const [sLat, sLng] = getSpotCoords(cityData.lat, cityData.lng, i);
      const indexStr = String(i + 1).padStart(2, '0');

      const spotHtml = `
        <div class="luxury-marker spot-marker" style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
          <div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #09090b; border: 1.5px solid #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45); transition: transform 0.2s ease;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; color: #34d399;">
              ${indexStr}
            </span>
          </div>
          <div style="position: absolute; top: -16px; white-space: nowrap; background: rgba(9, 9, 11, 0.9); border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 6px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; color: #d1fae5; pointer-events: none; opacity: 0.9;">
            ${spot.length > 20 ? spot.substring(0, 18) + '...' : spot}
          </div>
        </div>
      `;

      const spotIcon = L.divIcon({
        className: 'luxury-marker-container',
        html: spotHtml,
        iconSize: [26, 42],
        iconAnchor: [13, 26]
      });

      L.marker([sLat, sLng], { icon: spotIcon })
        .bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px; color: #f8fafc; min-width: 190px;">
            <div style="font-size: 9px; font-weight: 700; color: #10b981; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px;">Waypoint ${indexStr}</div>
            <div style="font-size: 13px; font-weight: 600; line-height: 1.3;">${spot}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Curated Travel Stop</div>
          </div>
        `, { className: 'executive-dark-popup' })
        .addTo(markersLayer);

      routePoints.push([sLat, sLng]);
    });

    // ==========================================
    // 4. EXECUTIVE AERO-GLOW ROUTE VECTOR
    // ==========================================
    if (routePoints.length > 1) {
      // Background Glow Corridor
      L.polyline(routePoints, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(markersLayer);

      // Foreground Crisp Laser Route
      L.polyline(routePoints, {
        color: '#38bdf8',
        weight: 2,
        opacity: 0.95,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(markersLayer);
    }

  }, [city, hotel, spots]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#0c0f17] shadow-2xl ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-84 z-0" style={{ background: '#0b0f19' }} />

      {/* Top HUD: Geopath Telemetry Bar */}
      <div className="absolute top-3 left-3 z-1000 flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-700/60 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-retro-mono tracking-wider text-neutral-300 font-semibold uppercase">
          {city} <span className="text-neutral-500">//</span> EXECUTIVE RADAR
        </span>
      </div>

      {/* Top Right: Status Badge */}
      <div className="absolute top-3 right-3 z-1000 hidden sm:flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800 text-[10px] font-retro-mono text-cyan-400">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>ESRI TELEMETRY // ACTIVE</span>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-1000 flex items-center gap-3.5 bg-neutral-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 shadow-xl text-[11px] font-retro-mono">
        <div className="flex items-center gap-1.5 text-sky-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          <span>Aero Hub</span>
        </div>
        <div className="w-px h-3 bg-neutral-700" />
        <div className="flex items-center gap-1.5 text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span>Accommodations</span>
        </div>
        <div className="w-px h-3 bg-neutral-700" />
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>Waypoints ({spots?.length || 4})</span>
        </div>
      </div>

      {/* Dark Leaflet Popup Overrides Style */}
      <style>{`
        .executive-dark-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #f8fafc !important;
          border: 1px solid rgba(56, 189, 248, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.15) !important;
          backdrop-filter: blur(12px) !important;
        }
        .executive-dark-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(56, 189, 248, 0.3) !important;
        }
        .luxury-marker-container {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

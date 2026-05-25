"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, X, Loader2, Navigation, MousePointer2, LocateFixed, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const defaultCenter = [17.3850, 78.4867]; // Hyderabad

// Component to handle map center changes smoothly
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
        map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function MapEvents({ onMapClick, readOnly }) {
  useMapEvents({
    click: (e) => {
      if (!readOnly) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation, readOnly = false }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(13);
  const [isLocating, setIsLocating] = useState(false);
  const markerRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      const pos = [parseFloat(initialLocation.lat), parseFloat(initialLocation.lng)];
      setPosition(pos);
      setMapCenter(pos);
      setAddress(initialLocation.address || "");
      setZoom(17);
    }
  }, [initialLocation]);

  // Reverse Geocoding (Lat/Lng -> Address)
  const reverseGeocode = useCallback(async (lat, lng, isDragEnd = false) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        const readableAddress = data.display_name;
        setAddress(readableAddress);
        onLocationSelect({
          lat,
          lng,
          address: readableAddress
        });
        
        if (!isDragEnd) {
             setMapCenter([lat, lng]);
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  }, [onLocationSelect]);

  // Handle Map Click
  const handleMapClick = (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    reverseGeocode(latlng.lat, latlng.lng);
  };

  // Handle Marker Drag
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
          reverseGeocode(latLng.lat, latLng.lng, true);
        }
      },
    }),
    [reverseGeocode],
  );

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        setMapCenter(newPos);
        setZoom(18);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
        alert("Wait! We couldn't detect your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Handle Search Input (Debounced)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3 || isSearching) {
        setSearchResults([]);
        return;
    }

    const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const pos = [lat, lng];
    setPosition(pos);
    setMapCenter(pos);
    setZoom(17);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
    onLocationSelect({
      lat,
      lng,
      address: result.display_name
    });
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="relative z-[1001]">
          <div className="flex gap-2">
            <div className="relative group flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Search size={18} />
                </div>
                <input
                type="text"
                placeholder="Search pickup point (e.g. Hitech City, LB Nagar...)"
                className="w-full h-14 pl-12 pr-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:outline-none font-bold text-slate-900 dark:text-slate-100 transition-all shadow-xl shadow-slate-200/50"
                value={searchQuery}
                onFocus={() => { if(searchQuery.length >= 3) setIsSearching(false) }}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                {(isSearching || searchQuery) && (
                <button 
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <X size={18} />}
                </button>
                )}
            </div>
            
            <Button 
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-blue-600 hover:bg-blue-50 hover:border-blue-200 shrink-0 shadow-lg"
                title="Use Current Location"
            >
                {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed size={24} />}
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden z-[1002] animate-in fade-in slide-in-from-top-4 duration-300">
               {searchResults.map((result, idx) => (
                 <button
                    key={idx}
                    onClick={() => selectResult(result)}
                    className="w-full text-left p-5 hover:bg-blue-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-0 flex items-start gap-4 transition-all group"
                 >
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all">
                        <Navigation size={18} className="text-slate-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 block truncate group-hover:text-blue-600 transition-colors">{result.display_name.split(',')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-400 truncate block uppercase tracking-widest">{result.display_name}</span>
                    </div>
                 </button>
               ))}
            </div>
          )}
        </div>
      )}

      <div className={`overflow-hidden rounded-[2.5rem] border-4 ${readOnly ? 'border-slate-100 shadow-none' : 'border-white dark:border-slate-800 shadow-2xl shadow-slate-300/50'} relative h-[450px] z-0 transition-all duration-700`}>
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={!readOnly}
          scrollWheelZoom={!readOnly}
          doubleClickZoom={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={mapCenter} zoom={zoom} />
          <MapEvents onMapClick={handleMapClick} readOnly={readOnly} />
          {position && (
            <Marker 
              position={position} 
              icon={DefaultIcon} 
              draggable={!readOnly}
              eventHandlers={eventHandlers}
              ref={markerRef}
            />
          )}
        </MapContainer>
        
        {/* Swiggy/Uber Style Location Panel */}
        <div className="absolute bottom-6 left-6 right-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col gap-4 z-[400] transition-all transform hover:scale-[1.01]">
           <div className="flex items-start gap-4">
               <div className={`h-12 w-12 shrink-0 ${readOnly ? 'bg-slate-900' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 ring-4 ring-blue-50 dark:ring-blue-900/20`}>
                  <MapPin size={24} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pinned Reporting Location</p>
                    {address && !readOnly && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg border border-green-100 shrink-0 scale-90 origin-right">
                           <Check size={10} className="stroke-[4px]" />
                           <span className="text-[9px] font-black uppercase tracking-tighter">Selected</span>
                        </div>
                    )}
                  </div>
                  <h3 className="text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">
                    {address || (isLocating ? "Acquiring precision GPS..." : "Search or click on map to fix location")}
                  </h3>
               </div>
           </div>

           {position && (
             <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Latitude Coordinate</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{position[0].toFixed(8)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Longitude Coordinate</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{position[1].toFixed(8)}</span>
                </div>
             </div>
           )}

           {!readOnly && !address && !isLocating && (
             <p className="text-[10px] font-bold text-slate-400 text-center italic mt-1">
                Tip: Drag the marker to fine-tune the exact spot of the issue
             </p>
           )}
        </div>
      </div>
    </div>
  );
}

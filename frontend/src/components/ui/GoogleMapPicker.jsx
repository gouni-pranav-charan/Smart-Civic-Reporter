"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867 // Hyderabad
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function GoogleMapPicker({ onLocationSelect, initialLocation, readOnly = false }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const geocodePosition = useCallback((latLng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect({
            lat: latLng.lat(),
            lng: latLng.lng(),
            address: formattedAddress
          });
        }
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  }, [onLocationSelect]);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
        setCenter(location);
        setMarker(location);
        setAddress(place.formatted_address);
        map.panTo(location);
        map.setZoom(17);
        onLocationSelect({
          ...location,
          address: place.formatted_address
        });
      }
    }
  };

  const onMapClick = useCallback((e) => {
    if (readOnly) return;
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarker(newPos);
    geocodePosition(e.latLng);
  }, [readOnly, geocodePosition]);

  const onMarkerDragEnd = (e) => {
    if (readOnly) return;
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarker(newPos);
    geocodePosition(e.latLng);
  };

  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      const pos = {
        lat: parseFloat(initialLocation.lat),
        lng: parseFloat(initialLocation.lng)
      };
      setMarker(pos);
      setCenter(pos);
      setAddress(initialLocation.address || "");
    }
  }, [initialLocation]);

  if (loadError) return <div className="p-4 text-red-500 font-black bg-red-50 rounded-2xl border-2 border-red-100 italic">Error loading Google Maps API</div>;
  if (!isLoaded) return <div className="h-[350px] w-full bg-slate-100 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 italic font-bold">Initializing Google Maps...</div>;

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="relative z-10">
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search for an exact address..."
                className="w-full h-14 pl-12 pr-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:outline-none font-bold text-slate-900 dark:text-slate-100 transition-all shadow-xl shadow-slate-200/50"
              />
            </div>
          </Autocomplete>
        </div>
      )}

      <div className={`overflow-hidden rounded-[2.5rem] border-4 ${readOnly ? 'border-slate-100 shadow-none' : 'border-white dark:border-slate-800 shadow-2xl shadow-slate-300/50'} relative h-[400px]`}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            ...options,
            draggable: !readOnly,
            scrollwheel: !readOnly,
            gestureHandling: readOnly ? 'none' : 'greedy'
          }}
        >
          {marker && (
            <Marker
              position={marker}
              draggable={!readOnly}
              onDragEnd={onMarkerDragEnd}
              animation={window.google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        {/* Location Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-start md:items-center gap-4 z-10 transition-all hover:scale-[1.01]">
           <div className={`h-12 w-12 shrink-0 ${readOnly ? 'bg-slate-900' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50`}>
              <MapPin size={24} />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Selected Location Context</p>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                {address || "Click on the map or search to select a precise location"}
              </p>
              {marker && (
                <div className="flex gap-4 mt-2">
                   <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500">LAT: {marker.lat.toFixed(6)}</span>
                   <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500">LNG: {marker.lng.toFixed(6)}</span>
                </div>
              )}
           </div>
           {!readOnly && address && (
             <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-700 uppercase">Localized</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

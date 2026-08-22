'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck, Check, Save, RotateCcw, AlertCircle } from 'lucide-react';

export interface WorkerLocationMapProps {
  /** Latitude coordinate (-90 to 90) */
  latitude?: number | null;
  /** Longitude coordinate (-180 to 180) */
  longitude?: number | null;
  /** Home city name */
  city?: string | null;
  /** Specific street address or locality */
  address?: string | null;
  /** Service coverage radius in km */
  serviceRadiusKm?: number;
  /** Editable mode for Worker Dashboard */
  editable?: boolean;
  /** Callback when location is saved (in editable mode) */
  onSaveLocation?: (locationData: {
    latitude: number;
    longitude: number;
    home_city: string;
    address: string;
    service_radius_km: number;
  }) => Promise<void> | void;
  /** Optional container class overrides */
  className?: string;
}

// Popular Indian City Coordinates for quick preset selection
const CITY_PRESETS: Record<string, { lat: number; lng: number; name: string }> = {
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, name: 'Delhi NCR' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  'Chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  'Pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
};

export default function WorkerLocationMap({
  latitude,
  longitude,
  city = 'Delhi NCR',
  address = 'Sector 62, Industrial Area',
  serviceRadiusKm = 10,
  editable = false,
  onSaveLocation,
  className = ''
}: WorkerLocationMapProps) {

  // Current coordinate states (defaulting to city preset or Delhi if null)
  const defaultCityObj = CITY_PRESETS[city || 'Delhi NCR'] || CITY_PRESETS['Delhi NCR'];
  const [lat, setLat] = useState<number>(latitude ?? defaultCityObj.lat);
  const [lng, setLng] = useState<number>(longitude ?? defaultCityObj.lng);
  const [homeCity, setHomeCity] = useState<string>(city || 'Delhi NCR');
  const [localityAddress, setLocalityAddress] = useState<string>(address || 'Main Work Hub');
  const [radius, setRadius] = useState<number>(serviceRadiusKm || 10);

  // Status indicators
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync props if changed externally
  useEffect(() => {
    if (latitude !== undefined && latitude !== null) setLat(latitude);
    if (longitude !== undefined && longitude !== null) setLng(longitude);
    if (city) setHomeCity(city);
    if (address) setLocalityAddress(address);
    if (serviceRadiusKm) setRadius(serviceRadiusKm);
  }, [latitude, longitude, city, address, serviceRadiusKm]);

  // Handle GPS detection using browser geolocation API
  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLat = Number(position.coords.latitude.toFixed(6));
        const detectedLng = Number(position.coords.longitude.toFixed(6));

        setLat(detectedLat);
        setLng(detectedLng);
        setIsDetectingGps(false);
        setSaveSuccessMsg(`📍 Live GPS Detected: ${detectedLat}°, ${detectedLng}°`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      },
      (error) => {
        setIsDetectingGps(false);
        setGpsError(error.message || 'Unable to retrieve your current location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle preset city change
  const handleCityChange = (cityName: string) => {
    setHomeCity(cityName);
    if (CITY_PRESETS[cityName]) {
      setLat(CITY_PRESETS[cityName].lat);
      setLng(CITY_PRESETS[cityName].lng);
    }
  };

  // Handle Save Location
  const handleSave = async () => {
    if (!onSaveLocation) return;
    setIsSaving(true);
    setGpsError(null);
    try {
      await onSaveLocation({
        latitude: lat,
        longitude: lng,
        home_city: homeCity,
        address: localityAddress,
        service_radius_km: radius
      });
      setSaveSuccessMsg('✓ Location updated successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      setGpsError(err.message || 'Failed to update location.');
    } finally {
      setIsSaving(false);
    }
  };

  // Construct embed OpenStreetMap iframe URL safely
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden font-sans ${className}`}>
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              Work Location & Service Radius Map
            </h3>
            <p className="text-xs text-slate-300">
              {editable ? 'Set your exact GPS coordinates and coverage area' : 'Verified service area and location coordinates'}
            </p>
          </div>
        </div>

        {/* Live GPS Detection Button (in Edit mode) */}
        {editable && (
          <button
            type="button"
            onClick={handleDetectGpsLocation}
            disabled={isDetectingGps}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Detecting GPS...' : '📍 Detect Live GPS Location'}</span>
          </button>
        )}
      </div>

      {/* Map Display Box */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100 overflow-hidden group">
        
        {/* Interactive OpenStreetMap Iframe */}
        <iframe
          title="Worker Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapIframeUrl}
          className="w-full h-full filter contrast-[1.05]"
        />

        {/* Custom Location Overlay Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/90 text-white p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl max-w-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
            <h4 className="text-xs font-black tracking-tight text-white">{homeCity}</h4>
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">{localityAddress}</p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-indigo-300 border-t border-slate-700/60 font-mono">
            <span>Lat: {lat.toFixed(4)}°</span>
            <span>Lng: {lng.toFixed(4)}°</span>
            <span className="font-sans text-amber-300 font-bold">{radius} km radius</span>
          </div>
        </div>

        {/* External Link Overlay */}
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border border-slate-200 transition-colors inline-flex items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-600" /> Open Full Map ↗
        </a>
      </div>

      {/* Editable Location Form Controls */}
      {editable && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-5">
          
          {/* Notifications / Errors */}
          {gpsError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* City Preset Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Home City Location
              </label>
              <select
                value={homeCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {Object.keys(CITY_PRESETS).map((cityName) => (
                  <option key={cityName} value={cityName}>
                    📍 {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Address / Locality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Street Address / Locality
              </label>
              <input
                type="text"
                value={localityAddress}
                onChange={(e) => setLocalityAddress(e.target.value)}
                placeholder="e.g. Sector 62, Near Metro Station"
                className="w-full bg-white text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Latitude Coordinate */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Latitude Coordinate
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-white font-mono text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Longitude Coordinate */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Longitude Coordinate
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-white font-mono text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Service Radius Slider */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Service Radius Coverage:</span>
              <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {radius} km radius
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 km (Local)</span>
              <span>25 km (Citywide)</span>
              <span>50 km (Metropolitan)</span>
            </div>
          </div>

          {/* Save Location Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Location...' : 'Save Location & Coverage Radius'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Footer Info (in Read-only mode) */}
      {!editable && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Service Radius Coverage: <strong>{radius} km</strong> from {homeCity}</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            GPS: {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </span>
        </div>
      )}

    </div>
  );
}

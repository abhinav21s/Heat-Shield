'use client';

import React, { useState, useEffect } from 'react';
import { Search, Navigation, MapPin, Building, Flame, Check, Loader2, Compass } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/context/LocationContext';
import { HOT_US_CITIES, PredefinedCity } from '@/lib/mockHeatData';

interface GeocodedResult {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

export function LocationSelectorModal() {
  const { isLocationModalOpen, closeLocationModal, setLocationByCity, setLocationByCoordinates, requestGeolocation, report } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<GeocodedResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Live Geocoding Search Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.results)) {
            setLiveResults(json.results);
          }
        }
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPresetCities = HOT_US_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectGeocoded = (item: GeocodedResult) => {
    setLocationByCoordinates(item.lat, item.lng, item.name);
    closeLocationModal();
  };

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    try {
      await requestGeolocation();
      closeLocationModal();
    } finally {
      setIsLocating(false);
    }
  };

  const handleCustomCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocationByCoordinates(lat, lng, `Coordinates (${lat}, ${lng})`);
    }
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title="Select Heat Monitoring Location"
      description="Search any city or neighborhood, use GPS geolocation, or select a heat hotspot."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Geolocation Trigger Button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E07A5F]/15 to-[#F2CC8F]/20 border border-brand/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-soft">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-primary">Use My Current Location</h4>
              <p className="text-xs text-ink-secondary">Auto-detect GPS coordinates to compute hyperlocal risk</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleUseMyLocation}
            isLoading={isLocating}
            className="w-full sm:w-auto"
          >
            Locate Me Now
          </Button>
        </div>

        {/* City Search Box */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input
            type="text"
            placeholder="Type any city or neighborhood (e.g. Manhattan, Indiana, Chicago, Austin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-brand-surface border border-brand-border rounded-xl text-sm text-ink-primary placeholder:text-ink-secondary/70 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-brand animate-spin" />
          )}
        </div>

        {/* Live Search Results (When typing) */}
        {searchQuery.trim().length >= 2 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-brand" /> Live Search Results
            </h4>

            {liveResults.length > 0 ? (
              <div className="divide-y divide-brand-border/60 rounded-xl border border-brand-border bg-white/70 overflow-hidden shadow-sm">
                {liveResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectGeocoded(item)}
                    className="w-full px-4 py-3 text-left hover:bg-brand/10 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-primary group-hover:text-brand transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-ink-secondary">
                          Lat: {item.lat.toFixed(4)}, Lng: {item.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            ) : !isSearching ? (
              <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border text-center text-xs text-ink-secondary">
                No matching locations found for "{searchQuery}".
              </div>
            ) : null}
          </div>
        )}

        {/* Hotspot Cities Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-brand" /> Major Urban Heat Hotspots
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredPresetCities.map((city: PredefinedCity) => {
              const isSelected = report?.location.city.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => setLocationByCity(city.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-brand/10 border-brand shadow-soft'
                      : 'bg-brand-surface/60 border-brand-border hover:bg-white hover:border-brand/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-ink-primary">
                      <Building className="w-3.5 h-3.5 text-brand" />
                      <span>{city.name}</span>
                      <span className="text-xs font-normal text-ink-secondary">({city.state})</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-1 leading-snug">{city.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand-dark">
                        Avg {city.baseTempF}°F
                      </span>
                      <span className="text-[10px] font-medium text-ink-secondary">
                        {city.urbanHeatIslandIntensity}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Coordinates Manual Input */}
        <div className="pt-3 border-t border-brand-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand" /> Drop Custom Coordinates
          </h4>
          <form onSubmit={handleCustomCoordinatesSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 33.448)"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs text-ink-primary focus:ring-2 focus:ring-brand/40 outline-none"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. -112.074)"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs text-ink-primary focus:ring-2 focus:ring-brand/40 outline-none"
              required
            />
            <Button size="sm" type="submit" variant="secondary">
              Compute Risk
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

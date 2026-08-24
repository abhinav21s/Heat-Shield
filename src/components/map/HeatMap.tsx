'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { HeatZone, CoolingCenter, RiskLevel } from '@/lib/types';
import { formatTemp } from '@/lib/utils';
import { ZoneDetailSheet } from './ZoneDetailSheet';
import { Layers, MapPin, Navigation, Eye, Droplets, Shield, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeatMap() {
  const { report, tempUnit, setLocationByCoordinates, selectedZoneId, setSelectedZoneId } = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'high-extreme' | 'cooling'>('all');
  const [isDropPinMode, setIsDropPinMode] = useState(false);

  const selectedZone = report?.zones.find(z => z.id === selectedZoneId) || null;
  const nearestCoolingCenter = report?.coolingCenters[0];

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet to avoid SSR window errors
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const centerLat = report?.location.lat || 33.4484;
        const centerLng = report?.location.lng || -112.0740;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        // TomTom Map Display API integration
        const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY;
        const tomtomTileUrl = tomtomKey
          ? `https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomKey}&view=Unified`
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        const tomtomAttribution = tomtomKey
          ? '&copy; <a href="https://www.tomtom.com" target="_blank" rel="noopener noreferrer">TomTom</a>'
          : '&copy; <a href="https://carto.com/">CARTO</a> &copy; TomTom';

        L.tileLayer(tomtomTileUrl, {
          attribution: tomtomAttribution,
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 19,
          tileSize: 256,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;

        // Click map event for pin dropping
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setLocationByCoordinates(lat, lng);
        });
      }

      // Re-render markers and zones when report or filter changes
      if (mapInstanceRef.current && layerGroupRef.current && report) {
        const map = mapInstanceRef.current;
        const lg = layerGroupRef.current;
        lg.clearLayers();

        map.setView([report.location.lat, report.location.lng], 13);

        // User Pin Marker
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-[#E07A5F]/40 animate-ping"></div>
              <div class="w-7 h-7 rounded-full bg-[#E07A5F] border-2 border-white text-white flex items-center justify-center shadow-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        L.marker([report.location.lat, report.location.lng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(lg)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; text-align: center;">
              <strong style="color: #2D2A26; font-size: 13px;">Your Selected Location</strong><br/>
              <span style="color: #E07A5F; font-weight: bold; font-size: 14px;">${formatTemp(report.metrics.temperatureF, tempUnit)}</span><br/>
              <span style="color: #6B6560; font-size: 11px;">Risk: ${report.analysis.riskLevel.toUpperCase()}</span>
            </div>
          `);

        // Heat Zones
        if (filterMode !== 'cooling') {
          report.zones.forEach((zone: HeatZone) => {
            if (filterMode === 'high-extreme' && (zone.riskLevel === 'low' || zone.riskLevel === 'moderate')) {
              return;
            }

            const colorMap: Record<RiskLevel, string> = {
              low: '#81B29A',
              moderate: '#F2CC8F',
              high: '#E07A5F',
              extreme: '#D62828',
            };

            const color = colorMap[zone.riskLevel];

            // Heat Zone Circle
            const circle = L.circle([zone.lat, zone.lng], {
              color: color,
              weight: 2,
              fillColor: color,
              fillOpacity: zone.riskLevel === 'extreme' ? 0.45 : zone.riskLevel === 'high' ? 0.35 : 0.25,
              radius: zone.radiusMeters,
            }).addTo(lg);

            // Interactive Click on Zone
            circle.on('click', (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedZoneId(zone.id);
            });

            // Zone Tag / Pill Marker
            const tagIcon = L.divIcon({
              className: 'zone-pill-marker',
              html: `
                <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-md border cursor-pointer whitespace-nowrap transition-transform hover:scale-105 flex items-center gap-1.5"
                     style="background-color: white; border-color: ${color}; color: ${color};">
                  <span class="w-2 h-2 rounded-full" style="background-color: ${color};"></span>
                  <span>${formatTemp(zone.tempF, tempUnit)}</span>
                </div>
              `,
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });

            const marker = L.marker([zone.lat, zone.lng], { icon: tagIcon }).addTo(lg);
            marker.on('click', (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedZoneId(zone.id);
            });
          });
        }

        // Cooling Centers Markers
        if (filterMode === 'all' || filterMode === 'cooling') {
          report.coolingCenters.forEach((cc: CoolingCenter) => {
            const ccIcon = L.divIcon({
              className: 'cooling-marker',
              html: `
                <div class="w-8 h-8 rounded-2xl bg-[#81B29A] border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                     title="${cc.name}">
                  <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m-9-9h18M6 6l12 12M6 18L18 6"/>
                  </svg>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            L.marker([cc.lat, cc.lng], { icon: ccIcon })
              .addTo(lg)
              .bindPopup(`
                <div style="font-family: sans-serif; padding: 4px;">
                  <strong style="color: #2C5242; font-size: 13px;">❄️ ${cc.name}</strong><br/>
                  <span style="color: #6B6560; font-size: 11px;">${cc.address}</span><br/>
                  <span style="color: #2D2A26; font-size: 11px; font-weight: bold;">${cc.hours}</span><br/>
                  <div style="margin-top: 4px; font-size: 10px; color: #81B29A; font-weight: bold;">Status: ${cc.capacityStatus}</div>
                </div>
              `);
          });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [report, tempUnit, filterMode, setLocationByCoordinates, setSelectedZoneId]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden border border-brand-border shadow-card bg-brand-surface">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[600px] z-0" />

      {/* Top Floating Overlay: Map Controls & Layer Filters */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border shadow-soft">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all' ? 'bg-brand text-white shadow-sm' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => setFilterMode('high-extreme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'high-extreme'
                ? 'bg-risk-extreme text-white shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            High Risk Only
          </button>
          <button
            onClick={() => setFilterMode('cooling')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'cooling'
                ? 'bg-[#81B29A] text-white shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Cooling Shelters
          </button>
        </div>

        {/* Pin Drop Notice Button */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border text-xs font-bold text-ink-primary shadow-soft">
          <MapPin className="w-3.5 h-3.5 text-brand" />
          <span>Click anywhere to measure heat risk</span>
        </div>

        {/* TomTom Map Provider Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-brand-border text-[11px] font-bold text-ink-secondary shadow-soft">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>TomTom Maps</span>
        </div>
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:block bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border p-3 shadow-soft space-y-1.5 text-[11px] font-semibold text-ink-primary">
        <div className="text-[10px] font-black uppercase text-ink-secondary tracking-wider pb-1 border-b border-brand-border/60">
          Thermal Overlay Key
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D62828]" />
          <span>Extreme Danger (&gt;105°F)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E07A5F]" />
          <span>High Hazard (95–104°F)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F2CC8F]" />
          <span>Moderate Heat (85–94°F)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#81B29A]" />
          <span>Safe / Shaded Corridor</span>
        </div>
      </div>

      {/* Zone Detail Slide-Over Sheet */}
      <ZoneDetailSheet
        zone={selectedZone}
        nearestCoolingCenter={nearestCoolingCenter}
        tempUnit={tempUnit}
        onClose={() => setSelectedZoneId(null)}
      />
    </div>
  );
}

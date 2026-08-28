'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { HeatZone, CoolingCenter, RiskLevel } from '@/lib/types';
import { formatTemp } from '@/lib/utils';
import { ZoneDetailSheet } from './ZoneDetailSheet';
import { Layers, MapPin, Navigation, Eye, Droplets, Shield, Sparkles, Filter, X, ArrowLeftRight, Trees, Thermometer, Building, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeatMap() {
  const { report, tempUnit, setLocationByCoordinates, selectedZoneId, setSelectedZoneId, activeRouteCcId, setActiveRouteCcId } = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'high-extreme' | 'cooling'>('all');
  const [isDropPinMode, setIsDropPinMode] = useState(false);
  const [routesData, setRoutesData] = useState<{
    stdPoints: [number, number][];
    coolPoints: [number, number][];
  } | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [L, setL] = useState<any>(null);
  const [optimisticLocation, setOptimisticLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Clear optimistic location once the report coordinates catch up to it
  useEffect(() => {
    if (report && optimisticLocation) {
      const latDiff = Math.abs(report.location.lat - optimisticLocation.lat);
      const lngDiff = Math.abs(report.location.lng - optimisticLocation.lng);
      if (latDiff < 0.0001 && lngDiff < 0.0001) {
        setOptimisticLocation(null);
      }
    }
  }, [report, optimisticLocation]);

  const selectedZone = report?.zones.find(z => z.id === selectedZoneId) || null;
  const nearestCoolingCenter = report?.coolingCenters[0] || null;

  // Async Routing calculation using TomTom Routing API
  useEffect(() => {
    if (!activeRouteCcId || !report) {
      setRoutesData(null);
      return;
    }

    const activeCc = report.coolingCenters.find(cc => cc.id === activeRouteCcId);
    if (!activeCc) {
      setRoutesData(null);
      return;
    }

    const startLat = report.location.lat;
    const startLng = report.location.lng;
    const endLat = activeCc.lat;
    const endLng = activeCc.lng;

    const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY;

    // Manhattan grid fallback generator to avoid direct diagonal line flying
    const generateGridFallback = () => {
      const stdPoints: [number, number][] = [
        [startLat, startLng],
        [startLat, endLng],
        [endLat, endLng]
      ];

      const coolZone = report.zones.find(z => z.type === 'park-canopy' || z.type === 'waterfront-cooling');
      let coolPoints: [number, number][];
      if (coolZone) {
        const midLat = (startLat + endLat) / 2;
        const midLng = (startLng + endLng) / 2;
        // Detour only slightly towards the park canopy from the midpoint
        const waypointLat = midLat + (coolZone.lat - midLat) * 0.35;
        const waypointLng = midLng + (coolZone.lng - midLng) * 0.35;

        coolPoints = [
          [startLat, startLng],
          [startLat, waypointLng],
          [waypointLat, waypointLng],
          [waypointLat, endLng],
          [endLat, endLng]
        ];
      } else {
        coolPoints = [
          [startLat, startLng],
          [endLat, startLng],
          [endLat, endLng]
        ];
      }

      return { stdPoints, coolPoints };
    };

    if (!tomtomKey) {
      setRoutesData(generateGridFallback());
      return;
    }

    setIsRouteLoading(true);
    const coolZone = report.zones.find(z => z.type === 'park-canopy' || z.type === 'waterfront-cooling');

    const fetchRoutes = async () => {
      try {
        // Fetch Standard Route (direct pedestrian road routing)
        const stdUrl = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLng}:${endLat},${endLng}/json?key=${tomtomKey}&travelMode=pedestrian&routeType=fastest`;
        const stdRes = await fetch(stdUrl);
        let stdPoints: [number, number][] = [];
        if (stdRes.ok) {
          const stdJson = await stdRes.json();
          stdPoints = stdJson?.routes?.[0]?.legs?.[0]?.points.map(
            (p: any) => [p.latitude, p.longitude] as [number, number]
          ) || [];
        }

        // Fetch Cool Route (routing through the blended canopy waypoint)
        let coolPoints: [number, number][] = [];
        if (coolZone) {
          const midLat = (startLat + endLat) / 2;
          const midLng = (startLng + endLng) / 2;
          // Interpolate a waypoint 35% of the way towards the park canopy from the direct midpoint
          const waypointLat = midLat + (coolZone.lat - midLat) * 0.35;
          const waypointLng = midLng + (coolZone.lng - midLng) * 0.35;

          const coolUrl = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLng}:${waypointLat},${waypointLng}:${endLat},${endLng}/json?key=${tomtomKey}&travelMode=pedestrian&routeType=fastest`;
          const coolRes = await fetch(coolUrl);
          if (coolRes.ok) {
            const coolJson = await coolRes.json();
            coolPoints = coolJson?.routes?.[0]?.legs?.flatMap(
              (leg: any) => leg.points.map((p: any) => [p.latitude, p.longitude] as [number, number])
            ) || [];
          }
        }

        if (stdPoints.length === 0 || (coolZone && coolPoints.length === 0)) {
          const fallback = generateGridFallback();
          setRoutesData({
            stdPoints: stdPoints.length > 0 ? stdPoints : fallback.stdPoints,
            coolPoints: coolPoints.length > 0 ? coolPoints : fallback.coolPoints,
          });
        } else {
          setRoutesData({
            stdPoints,
            coolPoints: coolPoints.length > 0 ? coolPoints : stdPoints
          });
        }
      } catch (err) {
        console.warn("TomTom Routing failed, falling back to grid paths:", err);
        setRoutesData(generateGridFallback());
      } finally {
        setIsRouteLoading(false);
      }
    };

    fetchRoutes();
  }, [activeRouteCcId, report]);

  // 1. Dynamic import Leaflet exactly once on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((module) => {
      delete (module.Icon.Default.prototype as any)._getIconUrl;
      module.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(module);
    });
  }, []);

  // 2. Initialize map instance exactly once
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = report?.location.lat || 33.4484;
    const initialLng = report?.location.lng || -112.0740;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.TOMTOM_API_KEY;
    const tomtomTileUrl = tomtomKey
      ? `https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomKey}&view=Unified`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tomtomAttribution = tomtomKey
      ? '&copy; <a href="https://www.tomtom.com" target="_blank" rel="noopener noreferrer">TomTom</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

    L.tileLayer(tomtomTileUrl, {
      attribution: tomtomAttribution,
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19,
      tileSize: 256,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setOptimisticLocation({ lat, lng });
      setLocationByCoordinates(lat, lng);
      setSelectedZoneId('pinned-location');
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L]);

  // 3. Update markers and routes synchronously on data change
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !layerGroupRef.current || !report) return;

    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;

    const activeLat = optimisticLocation?.lat ?? report.location.lat;
    const activeLng = optimisticLocation?.lng ?? report.location.lng;

    // Pan smoothly. Retain user's current manual zoom level if they clicked the map,
    // otherwise reset to 13 if they changed to a new preset city.
    const targetZoom = report.location.isUserLocation ? map.getZoom() : 13;
    map.setView([activeLat, activeLng], targetZoom);

    lg.clearLayers();

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

    L.marker([activeLat, activeLng], { icon: userIcon, zIndexOffset: 1000 })
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
        // Skip user pinned location zone from circular markers since it's already shown by user pin
        if (zone.id === 'pinned-location') return;

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

        const marker = L.marker([cc.lat, cc.lng], { icon: ccIcon }).addTo(lg);

        // Programmatically construct Leaflet popup content with a routing button
        const popupContainer = document.createElement('div');
        popupContainer.style.fontFamily = 'sans-serif';
        popupContainer.style.padding = '4px';
        popupContainer.style.minWidth = '200px';

        popupContainer.innerHTML = `
          <strong style="color: #2C5242; font-size: 13px; display: block; margin-bottom: 2px;">❄️ ${cc.name}</strong>
          <span style="color: #6B6560; font-size: 11px; display: block; margin-bottom: 2px;">${cc.address}</span>
          <span style="color: #2D2A26; font-size: 11px; font-weight: bold; display: block; margin-bottom: 4px;">${cc.hours}</span>
          <div style="font-size: 10px; color: #81B29A; font-weight: bold; margin-bottom: 8px;">Status: ${cc.capacityStatus}</div>
        `;

        const planRouteBtn = document.createElement('button');
        planRouteBtn.className = 'w-full px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer';
        
        const isCurrentlyRouting = activeRouteCcId === cc.id;
        if (isCurrentlyRouting) {
          planRouteBtn.className += ' bg-stone-200 hover:bg-stone-300 text-stone-800';
          planRouteBtn.style.backgroundColor = '#E2E8F0';
          planRouteBtn.style.color = '#334155';
          planRouteBtn.textContent = 'Cancel Routing';
          planRouteBtn.onclick = (e) => {
            e.stopPropagation();
            setActiveRouteCcId(null);
            marker.closePopup();
          };
        } else {
          planRouteBtn.className += ' text-white';
          planRouteBtn.style.backgroundColor = '#E07A5F';
          planRouteBtn.style.color = '#FFFFFF';
          planRouteBtn.textContent = 'Plan Cool Route';
          planRouteBtn.onclick = (e) => {
            e.stopPropagation();
            setActiveRouteCcId(cc.id);
            marker.closePopup();
          };
        }

        popupContainer.appendChild(planRouteBtn);
        marker.bindPopup(popupContainer);
      });
    }

    // Draw active routes if a cooling center is selected for routing and routesData is loaded
    if (activeRouteCcId && routesData) {
      const activeCc = report.coolingCenters.find(cc => cc.id === activeRouteCcId);
      if (activeCc && routesData.stdPoints.length > 0 && routesData.coolPoints.length > 0) {
        // Draw Standard Route polyline (Red/Orange)
        const stdPolyline = L.polyline(routesData.stdPoints, {
          color: '#D62828',
          weight: 4,
          opacity: 0.75,
          dashArray: '5, 8',
        }).addTo(lg);
        
        stdPolyline.bindTooltip("Standard Route (Concrete Heat)", {
          permanent: true,
          direction: 'top',
          className: 'route-tooltip std-route-tooltip'
        });
        
        // Draw Cool Route polyline (Emerald Green)
        const coolPolyline = L.polyline(routesData.coolPoints, {
          color: '#2E7D32',
          weight: 6,
          opacity: 0.9,
        }).addTo(lg);
        
        coolPolyline.bindTooltip("❄&nbsp;Canopy Cool Corridor", {
          permanent: true,
          direction: 'bottom',
          className: 'route-tooltip cool-route-tooltip'
        });
        
        // Fit bounds to the actual polyline paths dynamically so it frames the routes perfectly
        const combinedBounds = coolPolyline.getBounds().extend(stdPolyline.getBounds());
        map.fitBounds(combinedBounds, { maxZoom: 15, padding: [60, 60] });
      }
    }
  }, [L, report, tempUnit, filterMode, activeRouteCcId, routesData, setLocationByCoordinates, setSelectedZoneId, optimisticLocation]);

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

      {/* Route Corridor Comparison Panel (Overlay) */}
      {activeRouteCcId && report && (() => {
        const activeCc = report.coolingCenters.find(cc => cc.id === activeRouteCcId);
        if (!activeCc) return null;

        const ambientTemp = report.metrics.temperatureF;
        const feelsLike = report.metrics.feelsLikeF;
        const surfaceTemp = report.metrics.surfaceTempF;
        const baseCanopy = report.zones.find(z => z.type === 'park-canopy')?.treeCanopyCoverage || 20;

        // Dynamic metrics derivation based on active location profile
        const stdFeelsLike = Math.round(feelsLike + 3.5);
        const stdCanopy = Math.max(1, Math.round(baseCanopy * 0.2));
        const stdPavement = Math.round(surfaceTemp + 6);
        
        const coolFeelsLike = Math.round(feelsLike - 6.8);
        const coolCanopy = Math.min(95, Math.round(baseCanopy * 2.2 + 25));
        const coolPavement = Math.round(ambientTemp + 9.5);
        const tempSavings = Math.round(stdFeelsLike - coolFeelsLike);

        const formatValue = (fVal: number, type: 'temp' | 'pct') => {
          if (type === 'temp') {
            return tempUnit === 'F' ? `${fVal}°F` : `${Math.round((fVal - 32) * 5 / 9)}°C`;
          }
          return `${fVal}%`;
        };

        return (
          <div className="absolute top-20 right-4 z-20 w-[calc(100%-2rem)] sm:w-[380px] bg-white/95 backdrop-blur-md rounded-3xl border border-brand-border shadow-2xl p-5 space-y-4 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-brand-border/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-brand/10 text-brand">
                  <ArrowLeftRight className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-dark">
                    Corridor Route Analysis
                  </h4>
                  <span className="text-[10px] font-semibold text-ink-secondary">
                    Hyperlocal Thermal Exposure Index
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveRouteCcId(null)}
                className="p-1 rounded-full hover:bg-brand-border/60 text-ink-secondary hover:text-ink-primary transition-colors"
                aria-label="Close routing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Destination summary */}
            <div className="p-3 rounded-2xl bg-brand-surface border border-brand-border/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-ink-secondary block font-bold uppercase">Destination</span>
                <span className="font-extrabold text-ink-primary leading-tight line-clamp-1 font-mono">
                  {isRouteLoading ? 'Calculating street routes...' : activeCc.name}
                </span>
              </div>
              {!isRouteLoading ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-brand-border text-brand-dark flex-shrink-0 ml-2">
                  {activeCc.distanceMiles} mi away
                </span>
              ) : (
                <span className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
                  <span className="text-[9px] font-bold text-brand uppercase">Routing</span>
                </span>
              )}
            </div>

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Standard Route */}
              <div className="p-3 rounded-2xl border border-red-200 bg-red-50/40 space-y-2">
                <span className="text-[9px] font-black uppercase text-red-600 block tracking-wider">
                  ⚠️ Direct Highway Path
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-500" /> Feels Like
                    </span>
                    <strong className="text-red-700">{formatValue(stdFeelsLike, 'temp')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Trees className="w-3.5 h-3.5 text-red-500" /> Canopy
                    </span>
                    <strong className="text-ink-primary">{formatValue(stdCanopy, 'pct')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-red-500" /> Pavement
                    </span>
                    <strong className="text-red-600">{formatValue(stdPavement, 'temp')}</strong>
                  </div>
                </div>
              </div>

              {/* Cool Corridor */}
              <div className="p-3 rounded-2xl border border-green-200 bg-green-50/40 space-y-2">
                <span className="text-[9px] font-black uppercase text-green-700 block tracking-wider">
                  ❄️ Canopy Cool Corridor
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-green-600" /> Feels Like
                    </span>
                    <strong className="text-green-800 font-black">{formatValue(coolFeelsLike, 'temp')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Trees className="w-3.5 h-3.5 text-green-600" /> Canopy
                    </span>
                    <strong className="text-green-800 font-extrabold">{formatValue(coolCanopy, 'pct')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-green-600" /> Pavement
                    </span>
                    <strong className="text-green-700">{formatValue(coolPavement, 'temp')}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-xs text-green-800 font-medium leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                Choosing the <strong className="text-green-900">Canopy Cool Corridor</strong> reduces your feels-like exposure by <strong className="text-green-900">{tempSavings}°F</strong> and features tree shade protection.
              </div>
            </div>

            {/* Hydration advice */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-ink-secondary pt-1 border-t border-brand-border/60">
              <span>Hydration Advisory</span>
              <span className="text-brand-dark font-black">Drink 12-16 oz / hr</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

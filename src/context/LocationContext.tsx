'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HeatReportData, LocationInfo } from '@/lib/types';
import { HOT_US_CITIES, buildHeatReportForLocation } from '@/lib/mockHeatData';

interface LocationContextType {
  report: HeatReportData | null;
  isLoading: boolean;
  error: string | null;
  tempUnit: 'F' | 'C';
  toggleTempUnit: () => void;
  hasStarted: boolean;
  startApp: () => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setLocationByCity: (cityId: string) => Promise<void>;
  setLocationByCoordinates: (lat: number, lng: number, label?: string) => Promise<void>;
  requestGeolocation: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [report, setReport] = useState<HeatReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const fetchHeatData = useCallback(async (params: { lat?: number; lng?: number; city?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = '/api/heat-data';
      const searchParams = new URLSearchParams();
      if (params.lat !== undefined && params.lng !== undefined) {
        searchParams.append('lat', params.lat.toString());
        searchParams.append('lng', params.lng.toString());
      } else if (params.city) {
        searchParams.append('city', params.city);
      }
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch heat data (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      console.error('Heat data fetch error:', err);
      // Fallback directly to local generator so the user always has a seamless experience
      const defaultCity = HOT_US_CITIES[0];
      const fallbackReport = buildHeatReportForLocation({
        name: `${defaultCity.name}, ${defaultCity.state}`,
        city: defaultCity.name,
        state: defaultCity.state,
        country: defaultCity.country,
        lat: defaultCity.lat,
        lng: defaultCity.lng,
      });
      setReport(fallbackReport);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHeatData({ city: 'Phoenix' });
  }, [fetchHeatData]);

  const toggleTempUnit = () => {
    setTempUnit(prev => (prev === 'F' ? 'C' : 'F'));
  };

  const startApp = () => {
    setHasStarted(true);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const setLocationByCity = async (cityId: string) => {
    setIsLocationModalOpen(false);
    setHasStarted(true);
    await fetchHeatData({ city: cityId });
  };

  const setLocationByCoordinates = async (lat: number, lng: number, label?: string) => {
    setIsLocationModalOpen(false);
    setHasStarted(true);
    await fetchHeatData({ lat, lng });
  };

  const requestGeolocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setHasStarted(true);
      return false;
    }

    return new Promise((resolve) => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasStarted(true);
        resolve(false);
      }, 3500);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timer);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await fetchHeatData({ lat, lng });
          setHasStarted(true);
          resolve(true);
        },
        (geoError) => {
          clearTimeout(timer);
          console.warn('Geolocation denied or unavailable:', geoError.message);
          setIsLoading(false);
          setHasStarted(true);
          resolve(false);
        },
        { timeout: 3000, enableHighAccuracy: false }
      );
    });
  };

  const refreshData = async () => {
    if (report) {
      await fetchHeatData({ lat: report.location.lat, lng: report.location.lng });
    }
  };

  return (
    <LocationContext.Provider
      value={{
        report,
        isLoading,
        error,
        tempUnit,
        toggleTempUnit,
        hasStarted,
        startApp,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        setLocationByCity,
        setLocationByCoordinates,
        requestGeolocation,
        refreshData,
        selectedZoneId,
        setSelectedZoneId,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

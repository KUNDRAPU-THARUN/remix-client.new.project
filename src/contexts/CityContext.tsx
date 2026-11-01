import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { CityConfig, CityId } from '../types';
import { CITIES, DEFAULT_CITY_ID, SUPPORTED_CITY_IDS } from '../config/cities';

interface CityContextValue {
  city: CityConfig;
  cityId: CityId;
  cities: CityConfig[];
  setCityId: (id: CityId) => void;
  isCityDomain: boolean;
}

const CityContext = createContext<CityContextValue | null>(null);

interface CityProviderProps {
  currentCityId: CityId;
  onCityChange: (newCityId: CityId) => void;
  isCityDomain?: boolean;
  children: React.ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({
  currentCityId,
  onCityChange,
  isCityDomain = false,
  children,
}) => {
  const city = useMemo(() => {
    return CITIES[currentCityId] || CITIES[DEFAULT_CITY_ID];
  }, [currentCityId]);

  const cities = useMemo(() => {
    return SUPPORTED_CITY_IDS.map((id) => CITIES[id]);
  }, []);

  const setCityId = useCallback(
    (newCityId: CityId) => {
      if (newCityId !== currentCityId) {
        onCityChange(newCityId);
      }
    },
    [currentCityId, onCityChange]
  );

  const value = useMemo(
    () => ({
      city,
      cityId: currentCityId,
      cities,
      setCityId,
      isCityDomain,
    }),
    [city, currentCityId, cities, setCityId, isCityDomain]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export function useCity(): CityContextValue {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}


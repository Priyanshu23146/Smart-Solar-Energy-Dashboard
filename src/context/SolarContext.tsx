import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  fetchConfig,
  fetchAppliances,
  updateConfig,
  addAppliance as addApplianceApi,
  deleteAppliance as deleteApplianceApi,
  fetchWeather,
} from "../api/client";

interface Appliance {
  id: number;
  name: string;
  power: number;
}

interface SolarState {
  city: string;
  panelCapacity: number;
  batteryCapacity: number;
  avgDailyConsumption: number;
  appliances: Appliance[];
  weather?: {
    temperature: number;
    cloudCover: number;
    rainProbability: number;
    sunHours: number;
  };
}

interface SolarContextType extends SolarState {
  setCity: (city: string) => void;
  setPanelCapacity: (value: number) => void;
  setBatteryCapacity: (value: number) => void;
  setAvgDailyConsumption: (value: number) => void;
  addAppliance: (appliance: Appliance) => void;
  removeAppliance: (id: number) => void;
}

const SolarContext = createContext<SolarContextType | undefined>(undefined);

export function SolarProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState("Delhi");
  const [panelCapacity, setPanelCapacityState] = useState(5);
  const [batteryCapacity, setBatteryCapacityState] = useState(10);
  const [avgDailyConsumption, setAvgDailyConsumptionState] = useState(18);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [weather, setWeather] = useState<any>(null); // Store weather data

  useEffect(() => {
    // Load initial data
    Promise.all([fetchConfig(), fetchAppliances()])
      .then(([config, apps]) => {
        setCityState(config.city);
        setPanelCapacityState(config.panelCapacity);
        setBatteryCapacityState(config.batteryCapacity);
        setAvgDailyConsumptionState(config.avgDailyConsumption);
        setAppliances(apps);
      })
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  // Fetch weather when city changes or initially
  // Fetch weather when city changes or initially
  useEffect(() => {
    fetchWeather().then((data) => {
      if (data) setWeather(data);
    });
  }, [city]);

  function setCity(city: string) {
    setCityState(city);
    updateConfig({ city }).then(() => {
      // Re-fetch weather after city update
      fetchWeather().then((data) => {
        if (data) setWeather(data);
      });
    });
  }

  function setPanelCapacity(value: number) {
    setPanelCapacityState(value);
    updateConfig({ panelCapacity: value });
  }

  function setBatteryCapacity(value: number) {
    setBatteryCapacityState(value);
    updateConfig({ batteryCapacity: value });
  }

  function setAvgDailyConsumption(value: number) {
    setAvgDailyConsumptionState(value);
    updateConfig({ avgDailyConsumption: value });
  }

  function addAppliance(appliance: Appliance) {
    // API call then update state.
    addApplianceApi(appliance.name, appliance.power).then((newApp) => {
      setAppliances((prev) => [...prev, newApp]);
    });
  }

  function removeAppliance(id: number) {
    deleteApplianceApi(id).then(() => {
      setAppliances((prev) => prev.filter((a) => a.id !== id));
    });
  }

  return (
    <SolarContext.Provider
      value={{
        city,
        panelCapacity,
        batteryCapacity,
        avgDailyConsumption,
        appliances,
        weather,
        setCity,
        setPanelCapacity,
        setBatteryCapacity,
        setAvgDailyConsumption,
        addAppliance,
        removeAppliance,
      }}
    >
      {children}
    </SolarContext.Provider>
  );
}

export function useSolar() {
  const context = useContext(SolarContext);
  if (!context) {
    throw new Error("useSolar must be used inside SolarProvider");
  }
  return context;
}

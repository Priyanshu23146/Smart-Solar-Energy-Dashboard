import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  fetchConfig,
  fetchAppliances,
  updateConfig,
  addAppliance as addApplianceApi,
  deleteAppliance as deleteApplianceApi,
  fetchWeather as clientFetchWeather,
} from "../api/client";

interface Appliance {
  id: number;
  name: string;
  power: number;
}

interface SolarState {
  city: string;
  country: string;
  state: string;
  pincode: string;
  panelCapacity: number;
  batteryCapacity: number;
  avgDailyConsumption: number;
  appliances: Appliance[];
  weather?: {
    current: {
      temperature: number;
      cloudCover: number;
      rainProbability: number;
      sunHours: number;
      humidity?: number;
      windSpeed?: number;
      predictedProduction?: number;
      prediction?: number;
    };
    today: Array<{ time: string; production: number }>;
    tomorrow: Array<{ time: string; production: number }>;
  };
}

interface SolarContextType extends SolarState {
  setCity: (city: string) => Promise<void>;
  setCountry: (country: string) => Promise<void>;
  setState: (state: string) => Promise<void>;
  setPincode: (pincode: string) => Promise<void>;
  setPanelCapacity: (value: number) => Promise<void>;
  setBatteryCapacity: (value: number) => Promise<void>;
  setAvgDailyConsumption: (value: number) => Promise<void>;
  addAppliance: (appliance: Appliance) => void;
  removeAppliance: (id: number) => void;
}

const SolarContext = createContext<SolarContextType | undefined>(undefined);

export function SolarProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState("Delhi");
  const [country, setCountryState] = useState("India");
  const [state, setStateState] = useState("");
  const [pincode, setPincodeState] = useState("");
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
        setCountryState(config.country || "India");
        setStateState(config.state || "");
        setPincodeState(config.pincode || "");
        setPanelCapacityState(config.panelCapacity);
        setBatteryCapacityState(config.batteryCapacity);
        setAvgDailyConsumptionState(config.avgDailyConsumption);
        setAppliances(apps);
      })
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  async function fetchWeather() {
    try {
      if (!city) return null;
      const data = await clientFetchWeather();
      // Handle legacy/new format mismatch safely
      if (data.current) return data;
      // Fallback if old API response
      return {
        current: data,
        today: [],
        tomorrow: []
      };
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      return null;
    }
  }
  // Fetch weather when city changes or initially
  // Fetch weather when city changes or initially
  useEffect(() => {
    fetchWeather().then((data) => {
      if (data) setWeather(data);
    });
  }, [city]);

  async function setCity(city: string) {
    setCityState(city);
    await updateConfig({ city });
    // Re-fetch weather after city update
    const data = await fetchWeather();
    if (data) setWeather(data);
  }

  async function setCountry(country: string) {
    setCountryState(country);
    await updateConfig({ country });
  }

  async function setState(state: string) {
    setStateState(state);
    await updateConfig({ state });
  }

  async function setPincode(pincode: string) {
    setPincodeState(pincode);
    await updateConfig({ pincode });
  }

  async function setPanelCapacity(value: number) {
    setPanelCapacityState(value);
    await updateConfig({ panelCapacity: value });
  }

  async function setBatteryCapacity(value: number) {
    setBatteryCapacityState(value);
    await updateConfig({ batteryCapacity: value });
  }

  async function setAvgDailyConsumption(value: number) {
    setAvgDailyConsumptionState(value);
    await updateConfig({ avgDailyConsumption: value });
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
        country,
        state,
        pincode,
        panelCapacity,
        batteryCapacity,
        avgDailyConsumption,
        appliances,
        weather,
        setCity,
        setCountry,
        setState,
        setPincode,
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

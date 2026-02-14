import { createContext, useContext, useState, type ReactNode } from "react";

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
  const [city, setCity] = useState("Delhi");
  const [panelCapacity, setPanelCapacity] = useState(5);
  const [batteryCapacity, setBatteryCapacity] = useState(10);
  const [avgDailyConsumption, setAvgDailyConsumption] = useState(18);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  function addAppliance(appliance: Appliance) {
    setAppliances((prev) => [...prev, appliance]);
  }

  function removeAppliance(id: number) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <SolarContext.Provider
      value={{
        city,
        panelCapacity,
        batteryCapacity,
        avgDailyConsumption,
        appliances,
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

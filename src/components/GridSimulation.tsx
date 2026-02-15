import { useState, useEffect } from "react";

export default function GridSimulation() {
    const [gridOnline, setGridOnline] = useState(true);

    // Toggle grid status
    const toggleGrid = () => {
        setGridOnline((prev) => !prev);
    };

    // Effect to visual change app state when grid is offline
    useEffect(() => {
        if (!gridOnline) {
            document.body.classList.add("grid-offline");
        } else {
            document.body.classList.remove("grid-offline");
        }
    }, [gridOnline]);

    return (
        <div className={`grid-sim-panel ${!gridOnline ? "offline" : ""}`}>
            <div className="grid-status">
                <span className="indicator"></span>
                <span className="label">
                    Grid Status: <strong>{gridOnline ? "ONLINE" : "OFFLINE (Battery Mode)"}</strong>
                </span>
            </div>
            <button onClick={toggleGrid} className="sim-btn">
                {gridOnline ? "Simulate Outage" : "Restore Grid"}
            </button>
        </div>
    );
}

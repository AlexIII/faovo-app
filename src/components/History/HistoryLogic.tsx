import { h } from 'preact';
import * as React from 'preact/compat';
import { useLocalStorage } from 'hooks';
import { ScooterDataModelContext } from 'components/App';
import { AppConfigContext } from 'components/AppConfig';

export interface HistoryEntry {
    tripStartTs: number;
    tripTimeMin: number;
    tripDistanceKm: number;
    tripStartBatteryLevel?: number;
    tripEndBatteryLevel: number;
}

interface HistoryContextType {
    entries: HistoryEntry[];
    clear: () => void;
}

export const HistoryContext = React.createContext<HistoryContextType>({ entries: [], clear: () => undefined });

const _HistoryLogic: React.FC = ({ children }) => {
    const [ history, setHistory ] = useLocalStorage<HistoryEntry[]>('tripHistory', []);
    const [ tripStarted, setTripStarted ] = React.useState(false);
    const [ config ] = React.useContext(AppConfigContext);
    const scooterData = React.useContext(ScooterDataModelContext);
    const tripTimeMin = scooterData['RIDE_TIME'];
    const tripStartTs = scooterData['RIDE_START_TS'];
    const tripDistanceKm = (v => typeof v === 'number'? v * config.distanceCorrectionMul : v)(scooterData['RIDE_MILAGE']);
    const batteryLevel = scooterData['BATTERY_LEVEL'];

    const updateLastEntry = (data: Partial<HistoryEntry>) => setHistory(([cur, ...hist]) => cur? [{ ...cur, ...data }, ...hist] : []);

    React.useEffect(() => {
        const activeTrip =  typeof tripTimeMin === 'number' && typeof tripDistanceKm === 'number' && typeof batteryLevel === 'number';
        console.log(`activeTrip: ${activeTrip}`);
        if(!tripStarted) {
            // Start current trip tracking
            if(activeTrip) {
                setHistory(hist => {
                    // Determine if continuing the previous trip
                    const lastTrip = hist[0];
                    if(lastTrip && lastTrip.tripDistanceKm <= tripDistanceKm && Math.abs(tripStartTs - lastTrip.tripStartTs) < 5 * 60 * 1000) {
                        console.log(`History: continuing previous entry ${new Date(lastTrip.tripStartTs).toLocaleString()}`);
                        return hist;
                    }
                    // Start new trip
                    const tripStartBatteryLevel = tripDistanceKm < 1? batteryLevel : undefined;
                    console.log(`History: starting new entry ${new Date(tripStartTs).toLocaleString()}`);
                    return [ { tripStartTs, tripTimeMin, tripDistanceKm, tripStartBatteryLevel, tripEndBatteryLevel: batteryLevel }, ...hist ];
                });
                setTripStarted(true);
            }
        } else if(activeTrip) {
            // Update current trip tracking
            updateLastEntry({ tripTimeMin, tripDistanceKm, tripEndBatteryLevel: batteryLevel });
            console.log(`History: entry update`);
        } else {
            // Stop current trip tracking
            setTripStarted(false);
            console.log(`History: entry closed`);
            // Remove short previous trips
            setHistory(hist => hist.filter((entry, idx) => idx === 0 || (entry.tripTimeMin > 3 && entry.tripDistanceKm > 0.5) ));
        }
    }, [ tripTimeMin, tripStartTs, tripDistanceKm, batteryLevel ]);

    return <HistoryContext.Provider value={{ entries: history, clear: () => (setHistory([]), setTripStarted(false)) }}>
        { children }
    </HistoryContext.Provider>;
};

const HistoryLogic = React.memo(_HistoryLogic);

export { HistoryLogic };

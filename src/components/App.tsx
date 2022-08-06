import { h } from 'preact';
import * as React from 'preact/compat';
import { LeMessageTag } from 'LeProtocol';
import { UI, NoSupportScreen } from './UI';
import { BLEService } from './BLEService';
import { useConnection } from 'hooks';
import * as Package from 'package.json';
import { AppConfigProvider } from './AppConfig';

const INVALIDATE_MODEL_DELAY_MS = 5000;

type LeScooterComputedData = { AVG_SPEED: number | undefined; };
export type LeScooterBLEData = Record<keyof typeof LeMessageTag, number | string | undefined> | null;
export type LeScooterDataModel = LeScooterBLEData & LeScooterComputedData;
export const ScooterDataModelContext = React.createContext({} as LeScooterDataModel);

export type BLEServiceControl = Omit<ReturnType<typeof useConnection>, 'connection'>;
export const BLEServiceControlContext = React.createContext<BLEServiceControl | undefined>(undefined);

const _PRERENDER = typeof window === "undefined";
const bluetoothSupported = typeof window !== "undefined" && 'bluetooth' in navigator;

const App = ({}) => {
    const [ scooterDataModel, setScooterBLEData ] = React.useReducer<LeScooterDataModel, LeScooterBLEData>(computeModel, {} as LeScooterDataModel);
    const [ bleServiceControl, setBleServiceControl ] = React.useState<BLEServiceControl | undefined>(undefined);

    // Invalidate data model on timeout
    React.useEffect(() => {
        const handle = setTimeout(() => setScooterBLEData(null), INVALIDATE_MODEL_DELAY_MS);
        return () => clearTimeout(handle);
    } , [ scooterDataModel ]);

    if(!_PRERENDER && !bluetoothSupported) {
        const message = 'Your browser does not support Bluetooth. \nTry latest Google Chrome.';
        return <NoSupportScreen message={message} />;
    }

    return <AppConfigProvider>
        <BLEServiceControlContext.Provider value={bleServiceControl}>
            <ScooterDataModelContext.Provider value={scooterDataModel}>
                <BLEService setScooterBLEData={setScooterBLEData} setBleServiceControl={setBleServiceControl} />
                <UI />
            </ScooterDataModelContext.Provider>
        </BLEServiceControlContext.Provider>
    </AppConfigProvider>;
};

export default App;

const computeModel = (prev: LeScooterDataModel, data: LeScooterBLEData): LeScooterDataModel => {
    if(!data) return {} as LeScooterDataModel;
    const newData = { ...prev, ...data };
    const AVG_SPEED = (typeof newData['RIDE_TIME'] === 'number') && (typeof newData['RIDE_MILAGE'] === 'number') && newData['RIDE_TIME'] > 2
        ? newData['RIDE_MILAGE'] / (newData['RIDE_TIME'] / 60)
        : undefined;
    return { ...newData, AVG_SPEED };
};

console.log(`${Package.name} v${Package.version}`);

import * as React from 'react';
import { UI, NoSupportScreen } from './UI';
import { BLEService, BLEServiceControl, LeScooterBLEData } from './BLEService';
import * as Package from 'package.json';
import { AppConfigProvider } from './AppConfig';
import { HistoryLogic } from './History';

type LeScooterComputedData = { AVG_SPEED: number | undefined; };
export type LeScooterDataModel = LeScooterBLEData & LeScooterComputedData;
export const ScooterDataModelContext = React.createContext({} as LeScooterDataModel);

export const BLEServiceControlContext = React.createContext<BLEServiceControl | undefined>(undefined);

const _PRERENDER = typeof window === "undefined";
const bluetoothSupported = typeof window !== "undefined" && 'bluetooth' in navigator;

const App = ({}) => {
    const [ scooterDataModel, setScooterBLEData ] = 
        React.useReducer<(prev: LeScooterDataModel, newData: LeScooterBLEData) => LeScooterDataModel>(computeModel, {} as LeScooterDataModel);
    const [ bleServiceControl, setBleServiceControl ] = React.useState<BLEServiceControl | undefined>(undefined);

    if(!_PRERENDER && !bluetoothSupported) {
        const message = 'Your browser does not support Bluetooth. \nTry latest Google Chrome.';
        return <NoSupportScreen message={message} />;
    }

    return <AppConfigProvider>
        <BLEServiceControlContext.Provider value={bleServiceControl}>
            <ScooterDataModelContext.Provider value={scooterDataModel}>
                <BLEService setScooterBLEData={setScooterBLEData} setBleServiceControl={setBleServiceControl} />
                <HistoryLogic>
                    <UI />
                </HistoryLogic>
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

import { h } from 'preact';
import * as React from 'preact/compat';
import { LeMessageTag } from 'LeProtocol';
import { UI, NoSupportScreen } from './UI';
import { BLEService } from './BLEService';
import { useConnection } from 'hooks';
import * as Package from 'package.json';

export type LeScooterDataModel = Record<keyof typeof LeMessageTag, number | string | undefined>;
export const ScooterDataModelContext = React.createContext({} as LeScooterDataModel);

export type BLEServiceControl = Omit<ReturnType<typeof useConnection>, 'connection'>;
export const BLEServiceControlContext = React.createContext<BLEServiceControl | undefined>(undefined);

const _PRERENDER = typeof window === "undefined";
const bluetoothSupported = typeof window !== "undefined" && 'bluetooth' in navigator;

const App = ({}) => {
    const [ scooterDataModel, setScooterDataModel ] = React.useState<LeScooterDataModel>({} as LeScooterDataModel);
    const [ bleServiceControl, setBleServiceControl ] = React.useState<BLEServiceControl | undefined>(undefined);

    if(!_PRERENDER && !bluetoothSupported) {
        const message = 'Your browser does not support Bluetooth. \nTry latest Google Chrome.';
        return <NoSupportScreen message={message} />;
    }

    return <BLEServiceControlContext.Provider value={bleServiceControl}>
        <ScooterDataModelContext.Provider value={scooterDataModel}>
            <BLEService setScooterDataModel={setScooterDataModel} setBleServiceControl={setBleServiceControl} />
            <UI />
        </ScooterDataModelContext.Provider>
    </BLEServiceControlContext.Provider>;
};

export default App;

console.log(`${Package.name} v${Package.version}`);

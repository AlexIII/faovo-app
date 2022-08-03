import { LeScooterDataModel, BLEServiceControl } from 'components/App';
import * as React from 'preact/compat';
import { useConnection, useThrottle } from 'hooks';
import { LeScooterBLE } from './LeScooterBLE';

const AUTO_RECONNECT_DELAY_MS = 2000;
const AUTO_RECONNECT_ATTEMPTS = 3;
const DATA_THROTTLE_DELAY_MS = 250;
const DATA_REQUEST_PERIOD_MS = 2000;

export interface BLEServiceProps {
    setScooterDataModel: (setter: (prev: LeScooterDataModel) => LeScooterDataModel) => void;
    setBleServiceControl: (bleServiceControl: BLEServiceControl) => void;
}

const _BLEService = ({ setScooterDataModel, setBleServiceControl }: BLEServiceProps) => {
    // Throttled data updater
    const setNewData = useThrottle(
        {} as LeScooterDataModel,
        delayedData => setScooterDataModel(prev => Object.keys(delayedData).length? {...prev, ...delayedData} : {} as LeScooterDataModel),
        DATA_THROTTLE_DELAY_MS
    );

    // Maintain connection
    const cacheDevice = React.useRef<BluetoothDevice>();
    const { connection, ...connectionControl } = useConnection(
        onDisconnect => LeScooterBLE.connect(onDisconnect, cacheDevice),
        conn => conn.disconnect(),
        AUTO_RECONNECT_DELAY_MS,
        false,
        AUTO_RECONNECT_ATTEMPTS
    );

    // Reset cached device on connection error
    React.useEffect(() => {
        if(!connection && !connectionControl.connecting && !connectionControl.reconnectPending)
            cacheDevice.current = undefined;
    }, [ connection, connectionControl.connecting, connectionControl.reconnectPending ]);


    // Subscribe to connection received data
    React.useEffect(() => {
        if(!connection) return;
        connection.setOnReceive((tag, value) => setNewData(prev => ({ ...prev, [tag]: value })));
        return () => {
            connection.setOnReceive(undefined);
            setNewData(() => ({} as LeScooterDataModel));
        };
    }, [ connection ]);

    // Update connection controls and status
    React.useEffect(() => setBleServiceControl(connectionControl), [ ...Object.values(connectionControl) ]);

    // Request data periodically
    React.useEffect(() => {
        if(!connection) return;
        const requestData = () => void connection.requestData().catch(() => connection.disconnect());
        requestData();
        const handle = setInterval(requestData, DATA_REQUEST_PERIOD_MS);
        return () => clearInterval(handle);
    }, [ connection ]);

    // Log error
    React.useEffect(() => {
        if(connectionControl.error) console.error(connectionControl.error);
    } , [ connectionControl.error ]);

    return null;
};

const BLEService = React.memo(_BLEService);

export { BLEService };


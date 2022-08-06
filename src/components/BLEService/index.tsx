import * as React from 'preact/compat';
import { LeScooterBLEData } from 'components/App';
import { useConnection, useThrottle } from 'hooks';
import { LeScooterBLE } from './LeScooterBLE';
import { LeMessageArg, LeMessageTag } from 'LeProtocol';

const AUTO_RECONNECT_DELAY_MS = 2000;
const AUTO_RECONNECT_ATTEMPTS = 3;
const DATA_THROTTLE_DELAY_MS = 250;
const DATA_REQUEST_PERIOD_MS = 2000;

export interface BLEServiceControl extends Omit<ReturnType<typeof useConnection>, 'connection'> {
    setLock(isOn: boolean): Promise<void>;
    setCruiseControl(isOn: boolean): Promise<void>;
}

export interface BLEServiceProps {
    setScooterBLEData: (data: LeScooterBLEData) => void;
    setBleServiceControl: (bleServiceControl: BLEServiceControl) => void;
}

const _BLEService = ({ setScooterBLEData, setBleServiceControl }: BLEServiceProps) => {
    // Throttled data updater
    const setNewData = useThrottle(null as LeScooterBLEData, setScooterBLEData, DATA_THROTTLE_DELAY_MS);

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
        connection.setOnReceive((tag, value) => setNewData(prev => ({ ...(prev ?? {}), [tag]: value } as LeScooterBLEData)));
        return () => {
            connection.setOnReceive(undefined);
            setNewData(null);
        };
    }, [ connection ]);

    // Update connection controls and status
    React.useEffect(() => {
        const setLock = (isOn: boolean) =>
            connection?.command(LeMessageTag.LOCK_MODE, [ isOn? LeMessageArg.LOCK_ON : LeMessageArg.LOCK_OFF ]) ?? Promise.reject("No connection");
        const setCruiseControl = (isOn: boolean) =>
            connection?.command(LeMessageTag.CRUISE_CONTROL, [ isOn? LeMessageArg.CRUISE_CONTROL_ON : LeMessageArg.CRUISE_CONTROL_OFF ]) ?? Promise.reject("No connection");
        setBleServiceControl({ ...connectionControl, setLock, setCruiseControl });
    }, [ connection, ...Object.values(connectionControl) ]);

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


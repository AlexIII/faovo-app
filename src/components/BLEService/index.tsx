import * as React from 'react';
import { useConnection, useThrottle } from 'hooks';
import { LeScooterBLE } from './LeScooterBLE';
import { LeMessageArg, LeMessageTag } from 'LeProtocol';
import * as U from 'Utils';

const AUTO_RECONNECT_DELAY_MS = 2000;
const AUTO_RECONNECT_ATTEMPTS = 3;
const DATA_THROTTLE_DELAY_MS = 250;
const DATA_REQUEST_PERIOD_MS = 2000;

export type LeScooterBLEData = Record<keyof typeof LeMessageTag, number | string | undefined> & { RIDE_START_TS: number; } | null;

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
        connection.setOnReceive((tag, value) => setNewData(prev => {
            const res = { ...prev, ...{ [tag]: value } };
            if(tag === LeMessageTag[LeMessageTag.RIDE_TIME] && typeof value === 'number') res.RIDE_START_TS = Date.now() - value * 60 * 1000;
            return res as LeScooterBLEData;
        }));
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
        const requestData = async () => {
            try { return await connection.requestData(); }
            catch(err) {
                console.error(err);
                await U.delay(DATA_REQUEST_PERIOD_MS / 3);
                return await connection.requestData();
            }
        };
        void requestData();
        const handle = setInterval(() => void requestData(), DATA_REQUEST_PERIOD_MS);
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


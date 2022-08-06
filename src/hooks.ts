import * as React from 'preact/compat';
import * as U from 'Utils';

declare module 'preact/compat' {
    function useReducer<S>(reducer: (prev: S) => S, initialState: S): [S, () => void];
}

/* Hook that maintains live connection */
export const useConnection = <Connection extends {}>(
    createConnection: (onDisconnect: (error?: Error) => void) => Promise<Connection>,
    destroyConnection: (connection: Connection) => void,
    reconnectOnErrorDelayMs?: number,
    connectOnStartUp = false,
    maxReconnectAttempts = Infinity
): {
    connection: Connection | undefined;
    connected: boolean;
    connecting: boolean;
    reconnectPending: boolean;
    error: Error | undefined;
    connect: () => void;
    disconnect: () => void;
} => {
    const [ state, setState ] = React.useState<{ connecting: boolean; autoReconnect: boolean; connection?: Connection; error?: Error; }>({ connecting: connectOnStartUp, autoReconnect: connectOnStartUp });
    const [ reconnectAttempts, setReconnectAttempts ] = React.useState(0);
    const componentDisposed = React.useRef(false);
    React.useEffect(() => () => componentDisposed.current = true, []);

    // Start connection
    React.useEffect(() => {
        console.log(`connecting = ${state.connecting}`);
        if(!state.connecting) return;
        const alive = { current: true };
        void createConnection(error => !componentDisposed.current && setState(prev => prev.connection? { error: error ?? new Error('Disconnected'), connecting: false, autoReconnect: true } : prev)).then(
            connection => alive.current? setState({ connection, connecting: false, autoReconnect: true }) : destroyConnection(connection),
            error => alive.current && setState({ error: error ?? new Error('Connection failed'), connecting: false, autoReconnect: true })
        );
        return () => alive.current = false;
    }, [ state.connecting ]);

    // Stable methods
    const connect = React.useCallback(() => setState({ connecting: true, autoReconnect: true }), []);
    const disconnect = React.useCallback(() => {
        setState(prev => (prev?.connection && destroyConnection(prev.connection), { connecting: false, autoReconnect: false, error: prev.error }));
        setReconnectAttempts(0);
    }, []);

    // Automatically reconnect on severed connection
    React.useEffect(() => {
        if(!state.connecting && !state.connection && state.autoReconnect) {
            if(reconnectAttempts < maxReconnectAttempts - 1) {
                const timer = setTimeout(() => (connect(), setReconnectAttempts(val => val + 1)), reconnectOnErrorDelayMs);
                return () => clearTimeout(timer);
            }
            disconnect();
        }
    }, [ state ]);

    return {
        connection: state.connection,
        connected: state.connection !== undefined,
        connecting: state.connecting,
        error: state.error,
        connect,
        disconnect,
        reconnectPending: !state.connecting && !state.connection && state.autoReconnect
    };
};

export const useThrottle = <S>(initialValue: S, update: (value: S) => void, delayMs: number): React.StateUpdater<S> => {
    const [ _, setDelayedValue ] = React.useState(initialValue);
    const valueUpdated = React.useRef(false);
    const firstMount = React.useRef(true);

    React.useEffect(() => {
        if(firstMount.current) {
            firstMount.current = false;
            valueUpdated.current = !valueUpdated.current;
            return;
        }
        const handler = setTimeout(() => {
            setDelayedValue(cur => (update(cur), cur));
            valueUpdated.current = !valueUpdated.current;
        }, delayMs);
        return () => clearTimeout(handler);
    }, [ delayMs, valueUpdated.current ]);

    return setDelayedValue;
};

const LocalStorageHookGlobalKeyPrefix = 'react-backed-state.';
export const LocalStoragePrefixContext = React.createContext('');
export const LocalStoragePrefix = LocalStoragePrefixContext.Provider;

/* Mimics React.useState, but restores last state value from localStorage after every component remount. */
function useLocalStorage<S>(key: string, initialState: S | (() => S)): [ S, React.StateUpdater<S> ];
function useLocalStorage<S = undefined>(key: string): [ S, React.StateUpdater<S | undefined> ];
function useLocalStorage(key: string, initialState?: any) {
    const prefix = React.useContext(LocalStoragePrefixContext);
    return React.useReducer<any, any, undefined>(
        (prvState: any, newState: any) => {
            const val = newState instanceof Function? newState(prvState) : newState;
            U.WEB.accessLocalStorage(LocalStorageHookGlobalKeyPrefix + prefix + key)[1](val);
            return val;
        },
        undefined,
        () => U.WEB.accessLocalStorage(LocalStorageHookGlobalKeyPrefix + prefix + key, initialState instanceof Function? initialState() : initialState)[0]()
    );
}
export { useLocalStorage };

/* Hook for modal element state */
export function useModal(initial?: boolean) : [isOpen: boolean, open: () => void, close: () => void];
export function useModal<T extends {}>(initial: T | null) : [isOpen: T | null, open: (arg: T) => void, close: () => void];
export function useModal(initial: any = false): [isOpen: any, open: (arg: any) => void, close: () => void] {
    const isNoArg = React.useRef(initial === false || initial === true).current;
    const [isOpen, setOpen] = React.useState(initial);
    const open = React.useCallback((arg: any) => setOpen(isNoArg? true : arg), []);
    const close = React.useCallback(() => setOpen(isNoArg? false : null), []);
    return [isOpen, open, close];
}

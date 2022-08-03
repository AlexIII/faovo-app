import * as React from 'preact/compat';

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

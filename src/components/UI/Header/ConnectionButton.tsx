import { h } from 'preact';
import * as React from 'preact/compat';
import { Button, Modal } from "antd-mobile";
import { BLEServiceControlContext } from 'components/App';

const _ConnectionButton = ({}) => {
    const bleServiceControl = React.useContext(BLEServiceControlContext);
    const status = bleServiceControl?.connected? "Online" : bleServiceControl?.connecting || bleServiceControl?.reconnectPending? "Connecting..." : "Offline";

    const onClick = React.useCallback(
        () => status === "Offline"? bleServiceControl?.connect() : bleServiceControl?.disconnect(),
        [ status, !!bleServiceControl ]
    );

    // Report connection error
    React.useEffect(() => {
        if(bleServiceControl?.error && !bleServiceControl?.connecting && !bleServiceControl?.reconnectPending) {
            Modal.alert({ content: 'Could not connect to Bluetooth device', confirmText: 'OK' });
        }
    }, [ bleServiceControl?.error, bleServiceControl?.connecting, bleServiceControl?.reconnectPending ]);

    return <Button shape='rounded' onClick={onClick}>
        <span className={`dot ${STATUS_TO_CSS_CLASS[status]}`} />
        <span style={{ letterSpacing: '0.1em' }} >{ status }</span>
    </Button>;
};

const ConnectionButton = React.memo(_ConnectionButton);
export { ConnectionButton };

const STATUS_TO_CSS_CLASS = {
    "Online":           "color-online",
    "Connecting...":    "color-wait",
    "Offline":          "color-offline"
};


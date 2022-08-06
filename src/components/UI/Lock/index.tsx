import { h } from 'preact';
import * as React from 'preact/compat';
import { Space, Switch } from 'antd-mobile';
import { UnlockOutline, LockFill } from 'antd-mobile-icons';
import { BLEServiceControlContext, ScooterDataModelContext } from 'components/App';

const _Lock = ({}) => {
    const bleServiceControl = React.useContext(BLEServiceControlContext);
    const scooterData = React.useContext(ScooterDataModelContext);

    const [ isLocked, setIsLocked ] = React.useState(!!scooterData['LOCK_MODE']);
    React.useEffect(() => setIsLocked(!!scooterData['LOCK_MODE']), [ !!scooterData['LOCK_MODE'] ]);
    const setLock = (isOn: boolean) => {
        setIsLocked(isOn);
        void bleServiceControl?.setLock(isOn);
    };

    return <Space block justify='center' align='center'>
        <Switch
            style={{'--checked-color': '#F33'}}
            disabled={!bleServiceControl?.connected}
            checked={isLocked}
            onChange={setLock}
            uncheckedText={<UnlockOutline />}
            checkedText={<LockFill />}
        />
    </Space>;
};

const Lock = React.memo(_Lock);

export { Lock };

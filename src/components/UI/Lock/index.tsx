import * as React from 'react';
import { Space } from 'antd-mobile';
import { UnlockOutline, LockFill } from 'antd-mobile-icons';
import { BLEServiceControlContext, ScooterDataModelContext } from 'components/App';
import { SwitchWithState } from 'components/SwitchWithState';

const _Lock = ({}) => {
    const bleServiceControl = React.useContext(BLEServiceControlContext);
    const scooterData = React.useContext(ScooterDataModelContext);

    return <Space block justify='center' align='center'>
        <SwitchWithState
            color='#F33'
            disabled={!bleServiceControl?.connected}
            isOn={!!scooterData['LOCK_MODE']}
            onChange={bleServiceControl?.setLock}
            uncheckedText={<UnlockOutline />}
            checkedText={<LockFill />}
        />
    </Space>;
};

const Lock = React.memo(_Lock);

export { Lock };

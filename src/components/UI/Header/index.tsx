import { h } from 'preact';
import * as React from 'preact/compat';
import * as U from 'Utils';
import { Button, Space, Modal } from 'antd-mobile';
import { SetOutline } from 'antd-mobile-icons';
import { ConnectionButton } from './ConnectionButton';
import { ScooterDataModelContext } from 'components/App';
import { Settings } from './Settings';
import { useModal } from 'hooks';

const Header = () => {
    const scooterData = React.useContext(ScooterDataModelContext);
    const [ settingsVisible, openSettings, closeSettings ] = useModal();

    return <Space align='center' justify='between' block>

        <Button onClick={openSettings} >
            <SetOutline />
            <Modal
                visible={settingsVisible}
                closeOnMaskClick
                onClose={closeSettings}
                content={<Settings onClose={closeSettings} />}
            /></Button>

        <ConnectionButton />

        <p>🔋{ U.valueToString(scooterData['BATTERY_CHARGE'], 0, '--', '%') }</p>
    </Space>;
};

export { Header };

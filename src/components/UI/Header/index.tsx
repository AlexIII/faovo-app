import { h } from 'preact';
import * as React from 'preact/compat';
import * as U from 'Utils';
import { Button, Space,Modal } from "antd-mobile";
import { SetOutline } from "antd-mobile-icons";
import { ConnectionButton } from './ConnectionButton';
import { ScooterDataModelContext } from 'components/App';

const Header = () => {
    const scooterData = React.useContext(ScooterDataModelContext);

    return <Space align='center' justify='between' block>
        <Button onClick={() => Modal.alert({ content: 'Not implemented', confirmText: 'OK' })}><SetOutline /></Button>
        <ConnectionButton />
        <p>🔋{ U.valueToString(scooterData['BATTERY_CHARGE'], 0, '--', '%') }</p>
    </Space>;
};

export { Header };

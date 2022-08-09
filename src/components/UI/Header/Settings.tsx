import * as React from 'react';
import { Button, Space, Form, Stepper } from 'antd-mobile';
import { AppConfigContext } from 'components/AppConfig';
import { BLEServiceControlContext, ScooterDataModelContext } from 'components/App';
import { SwitchWithState } from 'components/SwitchWithState';

export interface SettingsProps {
    onClose: () => void;
}

const _Settings = ({ onClose }: SettingsProps) => {
    const [ config, setConfig ] = React.useContext(AppConfigContext);
    const bleServiceControl = React.useContext(BLEServiceControlContext);
    const scooterData = React.useContext(ScooterDataModelContext);

    return <Space>
        <Form
            layout='horizontal'
            footer={
                <Button block type='submit' color='primary' size='large'>Close</Button>
            }
            onFinish={onClose}
            onValuesChange={changedValues => setConfig(conf => ({ ...conf, ...changedValues }))}
            initialValues={config}
        >
            <Form.Header>Settings</Form.Header>
            <Form.Item name='distanceCorrectionMul' label='Distance correction multiplier' childElementPosition='normal'>
                <Stepper digits={2} min={0.5} max={1.5} step={0.05} />
            </Form.Item>
            <Form.Item name='cruiseControlEnabled' label='Cruise control' childElementPosition='normal'>
                <SwitchWithState disabled={!bleServiceControl?.connected} isOn={!!scooterData['CRUISE_CONTROL']} onChange={bleServiceControl?.setCruiseControl} />
            </Form.Item>
        </Form>
    </Space>;
};

const Settings = React.memo(_Settings);

export { Settings };

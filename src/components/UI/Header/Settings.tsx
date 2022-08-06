import { h } from 'preact';
import * as React from 'preact/compat';
import { Button, Space, Form, Stepper, Switch } from 'antd-mobile';
import { AppConfig, AppConfigContext } from 'components/AppConfig';
import { BLEServiceControlContext, ScooterDataModelContext } from 'components/App';

export interface SettingsProps {
    onClose: () => void;
}

const _Settings = ({ onClose }: SettingsProps) => {
    const [ config, setConfig ] = React.useContext(AppConfigContext);
    const bleServiceControl = React.useContext(BLEServiceControlContext);
    const scooterData = React.useContext(ScooterDataModelContext);

    const [ cruiseControlEnabled, setCruiseControlEnabled ] = React.useState(!!scooterData['CRUISE_CONTROL']);
    React.useEffect(() => setCruiseControlEnabled(!!scooterData['CRUISE_CONTROL']), [ !!scooterData['CRUISE_CONTROL'] ]);
    const setCruiseControl = (isOn: boolean) => {
        setCruiseControlEnabled(isOn);
        void bleServiceControl?.setCruiseControl(isOn);
    };

    const apply = (data: Partial<AppConfig>) => {
        setConfig(conf => ({ ...conf, ...data}));
        onClose();
    };

    return <Space>
        <Form
            layout='horizontal'
            footer={
                <Button block type='submit' color='primary' size='large'>
                    Apply
                </Button>
            }
            onFinish={apply}
            initialValues={config}
        >
            <Form.Header>Settings</Form.Header>
            <Form.Item name='distanceCorrectionMul' label='Distance correction multiplier' childElementPosition='right'>
                <Stepper digits={2} min={0.5} max={1.5} step={0.05} />
            </Form.Item>
            <Form.Item name='cruiseControlEnabled' label='Cruise control' childElementPosition='left'>
                <Switch disabled={!bleServiceControl?.connected} checked={cruiseControlEnabled} onChange={setCruiseControl} />
            </Form.Item>
        </Form>
    </Space>;
};

const Settings = React.memo(_Settings);

export { Settings };

import { h } from 'preact';
import * as React from 'preact/compat';
import { Button, Space, Form, Stepper } from "antd-mobile";
import { AppConfig, AppConfigContext } from 'components/AppConfig';

export interface SettingsProps {
    onClose: () => void;
}

const _Settings = ({ onClose }: SettingsProps) => {
    const [ config, setConfig ] = React.useContext(AppConfigContext);

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
        </Form>
    </Space>;
};

const Settings = React.memo(_Settings);

export { Settings };

import { h } from 'preact';
import * as React from 'preact/compat';
import * as U from 'Utils';
import { Space } from 'antd-mobile';
import { ScooterDataModelContext } from 'components/App';
import { AppConfigContext } from 'components/AppConfig';

const MainStats = ({}) => {
    const scooterData = React.useContext(ScooterDataModelContext);
    const [ config ] = React.useContext(AppConfigContext);

    return <Space align='center' justify='evenly' block>
        <Space align='center'><p className='text-mine-meter'>
            { U.defApply(scooterData['RIDE_TIME'], min => typeof min === 'number'? `${(min / 60) | 0}:${String(min % 60).padStart(2, '0')}` : min) ?? '--' }
            <sub className='text-units'>hr:min</sub>
        </p></Space>

        <Space align='center'><p className='text-mine-meter'>
            { U.valueToString(scooterData['RIDE_MILAGE'], 1, '--', '', val => val * config.distanceCorrectionMul) }
            <sub className='text-units'>km</sub>
        </p></Space>
    </Space>;
};

export { MainStats };

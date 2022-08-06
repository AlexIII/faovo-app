import { h, Fragment } from 'preact';
import * as React from 'preact/compat';
import * as U from 'Utils';
import { Space, Grid } from "antd-mobile";
import { LeScooterDataModel, ScooterDataModelContext } from 'components/App';
import { AppConfigContext } from 'components/AppConfig';

const _SecondaryStats = ({}) => {
    const scooterData = React.useContext(ScooterDataModelContext);
    const [ config ] = React.useContext(AppConfigContext);

    return <Space align='center' justify='center' block>
        <Grid columns={3}>
            { StatsEntries.map(({ key, title, unit, applyCorrection }) => {
                const val = scooterData[key];
                const corVal = typeof val === 'number' && applyCorrection? val * config.distanceCorrectionMul : val;
                return <StatsEntry key={key} title={title} unit={unit} value={corVal} />;
            }) }
        </Grid>
    </Space>;
};

const SecondaryStats = React.memo(_SecondaryStats);

export { SecondaryStats };

const StatsEntries: { key: keyof LeScooterDataModel; title: string; unit?: string; applyCorrection?: boolean }[] = [
    { key: 'SPEED', title: 'Speed', unit: 'km/h', applyCorrection: true },
    { key: 'AVG_SPEED', title: 'Average speed', unit: 'km/h', applyCorrection: true },
    { key: 'TOTAL_MILAGE', title: 'Total milage', unit: 'km', applyCorrection: true },
];

export interface StatsEntryProps {
    title: string;
    value: string | number | undefined;
    unit?: string;
}

const _StatsEntry = ({ title, value, unit }: StatsEntryProps) => {
    return <>
        <Grid.Item><p className='text-secondary-meter'> { title } </p></Grid.Item>
        <Grid.Item />
        <Grid.Item><p className='text-secondary-meter'>{ U.valueToString(value, 1, '-', unit? ` ${unit}` : '') }</p></Grid.Item>
    </>;
};

const StatsEntry = React.memo(_StatsEntry);

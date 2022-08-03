import { h, Fragment } from 'preact';
import * as React from 'preact/compat';
import * as U from 'Utils';
import { Space, Grid } from "antd-mobile";
import { ScooterDataModelContext } from 'components/App';
import { LeMessageTag } from 'LeProtocol';

const _SecondaryStats = ({}) => {
    const scooterData = React.useContext(ScooterDataModelContext);

    return <Space align='center' justify='center' block>
        <Grid columns={3}>
            { StatsEntries.map(({ key, title, unit }) => <StatsEntry key={key} title={title} unit={unit} value={scooterData[key]} />) }
        </Grid>
    </Space>;
};

const SecondaryStats = React.memo(_SecondaryStats);

export { SecondaryStats };

const StatsEntries: { key: keyof typeof LeMessageTag; title: string; unit?: string; }[] = [
    { key: 'SPEED', title: 'Speed', unit: 'km/h' },
    { key: 'TOTAL_MILAGE', title: 'Total milage', unit: 'km' },
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

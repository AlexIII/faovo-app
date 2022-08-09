import * as React from 'react';
import { HistoryContext, HistoryEntry } from './HistoryLogic';
import { Space, Button, Divider } from 'antd-mobile';
import { DeleteOutline, CloseOutline } from 'antd-mobile-icons';

export interface HistoryViewProps {
    onClose: () => void;
}

// let fakeHistory: HistoryEntry[] = [
//     { tripStartTs: Date.now(), tripTimeMin: 98, tripDistanceKm: 24.79, tripStartBatteryLevel: 100, tripEndBatteryLevel: 12 },
//     { tripStartTs: Date.now() - 2 * 3600 * 1000, tripTimeMin: 26, tripDistanceKm: 9.27, tripStartBatteryLevel: 85, tripEndBatteryLevel: 49 },
//     { tripStartTs: Date.now() - 7 * 3600 * 1000, tripTimeMin: 67, tripDistanceKm: 12.6, tripEndBatteryLevel: 30 },
// ];
// fakeHistory = Array(10).fill(fakeHistory).flat();

const _HistoryView = ({ onClose }: HistoryViewProps) => {
    const { entries, clear } = React.useContext(HistoryContext);

    return <Space block direction='vertical'>
        { entries.length
            ? <Space align='center' justify='between' block>
                <Button onClick={clear}><DeleteOutline /></Button>
                <Button onClick={onClose}><CloseOutline /></Button>
            </Space>
            : <h4 style={{ letterSpacing: '0.1em' }}>NO ENTRIES</h4>
        }
        { entries.map((entry, idx, arr) => <HistoryEntryView key={`history-entry-${arr.length - idx}`} { ...entry } />) }
    </Space>;
};

const HistoryView = React.memo(_HistoryView);

export { HistoryView };

type HistoryEntryViewProps = HistoryEntry;

const _HistoryEntryView = ({ tripStartTs, tripTimeMin, tripDistanceKm, tripStartBatteryLevel, tripEndBatteryLevel }: HistoryEntryViewProps) => {
    return <>
        <Divider style={{ margin: '0 0 5px 0' }} />
        <Space block>
            <p className='history-entry-time'> { new Date(tripStartTs).toLocaleDateString() } </p>
            <p className='history-entry-time'> { new Date(tripStartTs).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) } </p>
        </Space>
        <Space block>
            <p className='history-entry-value'> { `${(tripTimeMin / 60) | 0}:${String(tripTimeMin % 60).padStart(2, '0')}` } </p>
            <p className='history-entry-value'> { `${tripDistanceKm.toFixed(1)} km` } </p>
            <p className='history-entry-value'> { `${(tripTimeMin > 0? tripDistanceKm / (tripTimeMin / 60) : 0).toFixed(1)} km/h` } </p>
            <p className='history-entry-value'> { `🔋${tripStartBatteryLevel ?? '?'}→${tripEndBatteryLevel}` + (tripStartBatteryLevel? ` (${tripEndBatteryLevel-tripStartBatteryLevel})` : '') + ' %' } </p>
        </Space>
    </>;
};

const HistoryEntryView = React.memo(_HistoryEntryView);

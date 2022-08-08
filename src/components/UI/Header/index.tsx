import { h } from 'preact';
import { Button, Space, Modal } from 'antd-mobile';
import { SetOutline, HistogramOutline } from 'antd-mobile-icons';
import { ConnectionButton } from './ConnectionButton';
import { Settings } from './Settings';
import { useModal } from 'hooks';
import { HistoryView } from 'components/History';

const Header = () => {
    const [ settingsVisible, openSettings, closeSettings ] = useModal();
    const [ historyVisible, openHistory, closeHistory ] = useModal();

    return <Space align='center' justify='between' block>
        <Button onClick={openSettings} >
            <SetOutline />
            <Modal
                visible={settingsVisible}
                closeOnMaskClick
                onClose={closeSettings}
                content={<Settings onClose={closeSettings} />}
            />
        </Button>

        <ConnectionButton />

        <Button onClick={openHistory} >
            <HistogramOutline />
            <Modal
                visible={historyVisible}
                closeOnMaskClick
                onClose={closeHistory}
                content={<HistoryView onClose={closeHistory} />}
            />
        </Button>
    </Space>;
};

export { Header };

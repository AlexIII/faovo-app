import * as React from 'react';
import { Card, Divider } from 'antd-mobile';
import { Header } from './Header';
import { MainStats } from './MainStats';
import { SecondaryStats } from './SecondaryStats';
import { Lock } from './Lock';
import * as Package from 'package.json';

// Activate dark theme
if (typeof window !== "undefined") {
    window.document.documentElement.setAttribute('data-prefers-color-scheme', 'dark');
}

const _UI = ({}) =>
    <MainContainer>
        <Header />
        <Divider />
        <MainStats />
        <Divider />
        <SecondaryStats />
        <Lock />
    </MainContainer>
;

const UI = React.memo(_UI);

export { UI };

export interface NoSupportScreenProps {
    message: string;
}

const NoSupportScreen = ({ message }: NoSupportScreenProps) =>
    <MainContainer>
        <p style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }}>{ message }</p>
    </MainContainer>
;

const MainContainer = ({ children }: React.PropsWithChildren<{}>) =>
    <>
        <Card bodyStyle={{ minWidth: '80vw' }}>
            { children }
        </Card>
        <p className='text-footer'>{ `${Package.description}` }</p>
        <a href={Package.homepage} className='text-footer'>© { Package.author.name }</a>
    </>
;

export { NoSupportScreen };

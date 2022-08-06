import { h } from 'preact';
import * as React from 'preact/compat';
import { useLocalStorage, LocalStoragePrefix } from 'hooks';
import * as Package from 'package.json';

export interface AppConfig {
    distanceCorrectionMul: number;
}

const DEFAULT_CONFIG: AppConfig = {
    distanceCorrectionMul: 1
};

export const AppConfigContext = React.createContext<[ AppConfig, React.StateUpdater<AppConfig> ]>([ DEFAULT_CONFIG, () => undefined ]);

const _AppConfigProvider: React.FC<{}> = ({ children }) => {
    const config = useLocalStorage('config', DEFAULT_CONFIG);

    return <LocalStoragePrefix value={Package.name}>
        <AppConfigContext.Provider value={config} >
            { children }
        </AppConfigContext.Provider>
    </LocalStoragePrefix>;
};

const AppConfigProvider = React.memo(_AppConfigProvider);

export { AppConfigProvider };

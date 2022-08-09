import * as React from 'react';
import { useLocalStorage, LocalStoragePrefix } from 'hooks';
import * as Package from 'package.json';

export interface AppConfig {
    distanceCorrectionMul: number;
}

const DEFAULT_CONFIG: AppConfig = {
    distanceCorrectionMul: 1
};

export const AppConfigContext = React.createContext<[ AppConfig, React.Dispatch<React.SetStateAction<AppConfig>> ]>([ DEFAULT_CONFIG, () => undefined ]);

const _AppConfigProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const config = useLocalStorage('config', DEFAULT_CONFIG);

    return <LocalStoragePrefix value={Package.name}>
        <AppConfigContext.Provider value={config} >
            { children }
        </AppConfigContext.Provider>
    </LocalStoragePrefix>;
};

const AppConfigProvider = React.memo(_AppConfigProvider);

export { AppConfigProvider };

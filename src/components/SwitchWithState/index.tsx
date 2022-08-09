import * as React from 'react';
import { Switch } from 'antd-mobile';
import { SwitchProps } from 'antd-mobile/es/components/switch';

export interface SwitchWithStateProps {
    isOn: boolean;
    onChange?: (isOn: boolean) => void;
    disabled?: boolean;
    color?: string;
    checkedText?: SwitchProps['checkedText'];
    uncheckedText?: SwitchProps['uncheckedText'];
}

const _SwitchWithState = ({ isOn, onChange, disabled, color, ...nativeSwitchProps }: SwitchWithStateProps) => {
    const [ intValue, setIntValue ] = React.useState(isOn);
    React.useEffect(() => setIntValue(isOn), [ isOn ]);

    const style = color? { '--checked-color': color } : undefined;

    return <Switch
        {...nativeSwitchProps}
        style={style}
        disabled={disabled}
        checked={intValue}
        onChange={isOn => { setIntValue(isOn); onChange?.(isOn); }}
    />
    ;
};

const SwitchWithState = React.memo(_SwitchWithState);

export { SwitchWithState };

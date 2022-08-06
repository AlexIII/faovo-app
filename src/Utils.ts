// Index array into a dictionary
export type Dict<T> = Record<string, T>;
export const index = <T>(arr: Array<T>, projection: (x: T) => string): Dict<T> => {
    const m: Dict<T> = {};
    arr.forEach(e => m[projection(e)] = e);
    return m;
};

/* Apply fun if not (undefined or null)  */
function defApply<T, V>(val: T, fun: (a: NonNullable<T>) => V): V | undefined;
function defApply<T, V>(val: T, fun: (a: NonNullable<T>) => V, def: V) : V;
function defApply<T, V>(val: T, fun: (a: NonNullable<T>) => V, def?: V) : V | undefined {
    return val !== undefined && val !== null ? fun(val as NonNullable<T>) : def;
}
export { defApply };

export const valueToString = (value: string | number | undefined, fractionDigits = 0, placeholder = '-', suffix = '', convertNumber = (val: number) => val) =>
    value === undefined ? placeholder : ( (typeof value === 'number' ? convertNumber(value).toFixed(fractionDigits) : value) + suffix );

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace WEB {
    /* Access localStorage. The function returns tuple of getter and setter */
    export const accessLocalStorage = <S>(key: string, initialValue?: S): [() => S, (value: S) => void] => {
        return [
            () => {
                const str = localStorage.getItem(key);
                if(str) {
                    try { return JSON.parse(str); } catch {}
                }
                return initialValue;
            },
            value => {
                if(value === undefined) localStorage.removeItem(key);
                else localStorage.setItem(key, JSON.stringify(value));
            }
        ];
    };
}

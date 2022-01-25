import useLocalStorageJson from 'react-use-localstorage';
import { LocalDateTime } from '@js-joda/core';

export type LocalStorage<T> = {
    timestamp: string,
    value: T,
};

const stringify = <T extends object>(value: T) => JSON.stringify({ timestamp: LocalDateTime.now().toString(), value });

const useLocalStorage = <T extends object>(key: string, defaults: T): [ LocalStorage<T>, (newItem: T) => void ] => {
    const [ itemJson, setItemJson ] = useLocalStorageJson(key, stringify(defaults));
    return [ JSON.parse(itemJson) as LocalStorage<T>, (newItem: T) => setItemJson(stringify(newItem)) ];
};

export default useLocalStorage;

import { useRef, useState, useEffect, RefObject } from 'react';

// Returns:
//   width: Will resolve to width of ref element when rendered
//   ref: Assign this ref object to the element being measured
const useWidth = <T extends HTMLElement>(): [number|undefined, RefObject<T>] => {
    const ref = useRef<T>(null);
    const [ width, setWidth ] = useState<number>();

    useEffect(() => {
        ref && ref.current && setWidth(ref.current.clientWidth);
    }, [ ref.current ]);

    return [ width, ref ];
};

export default useWidth;
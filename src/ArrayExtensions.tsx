import React, { ComponentType } from 'react';

declare global {
    interface Array<T> {
        min(): T,
        max(): T,
        separate(Separator: ComponentType): Array<T|ComponentType>,
    }
}

Array.prototype.min = function<T extends number>(): T {
    return Math.min(...this) as T;
}

Array.prototype.max = function<T extends number>(): T {
    return Math.max(...this) as T;
}

Array.prototype.separate = function<T extends any>(Separator: ComponentType): Array<T|ComponentType> {
    return this.reduce(
        (accumulator: T[]|null, value: T) => accumulator === null ? [value] : [...accumulator, <Separator key={`${accumulator.length}.5`}/>, value],
        null
    );
};

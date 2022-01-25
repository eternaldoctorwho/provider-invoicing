import { NoArgsCallback, OnChange } from '@dmg/core/src/common-types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { isUnsubmittableValue, Submit } from '../useFormState';

export type FormNextStepLinkProps = React.PropsWithChildren<{}>;
export type FormSubmitLinkProps = React.PropsWithChildren<{}>;

export type MultiStepData = {
    [key: string]: StepType | string | number | boolean | undefined;
}

export type StepType = {
    isComplete?: boolean,
};

//From https://fettblog.eu/typescript-hasownproperty/
function hasOwnProperty<X extends {}, Y extends PropertyKey>
  (obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

export const isStepType = (obj: any): obj is StepType =>
    typeof obj === 'object' && obj !== null && hasOwnProperty(obj, 'isComplete') && typeof obj['isComplete'] === 'boolean';

export const makeNextStepLink = <T extends StepType>(nextPath: string, value: T, onChange: OnChange<T>, callback?: NoArgsCallback) =>
    ({ children }: FormNextStepLinkProps) => {
        const isUnsubmittable = isUnsubmittableValue<T>(value);
        let history = useHistory();
        return (
            <a
                onClick={() => {
                    if (!isUnsubmittable) {
                        value.isComplete = true;
                        callback && callback();
                        onChange(value);
                        history.push(nextPath);
                    }
                }}
            >
                { React.cloneElement(children as React.ReactElement<any>, { disabled: isUnsubmittable }) }
            </a>
        );
    };

export const makeSubmitLink = <T extends object>(submit: Submit<T>, onSubmit: (v: T) => Promise<any>) => 
    ({ children }: FormSubmitLinkProps) => {
        return (
            <a {...submit(onSubmit)} >
                { children }
            </a>
        );
    };

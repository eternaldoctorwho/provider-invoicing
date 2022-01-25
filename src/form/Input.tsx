import React from 'react';
import classNames from 'classnames';
import { NOOP, OnChange, isArray } from '../../../@dmg/core/src/common-types';
import { isUnsubmittableValue, UseFieldProps, isFieldProp, initFieldProp } from '../useFormState';

export type ReactInputValue = React.InputHTMLAttributes<HTMLInputElement>['value'];
export type InputValue = ReactInputValue | UseFieldProps<ReactInputValue>;

export type InputProps = Omit<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>, 'onChange'> & {
    value: InputValue,
    onChange: OnChange<UseFieldProps<ReactInputValue>>,
    requiredError?: string,
};

const isReactInputValue = (value: any): value is ReactInputValue =>
    typeof value === 'string' || typeof value === 'number' || value === undefined || isArray<string>(value);

const Input = ({ className, value = "", onChange = NOOP, required, requiredError, ...otherProps}: InputProps) => 
    <>
        <input
            className={classNames(`h-8 rounded border border-formElementBorder p-2`, className)}
            value={isFieldProp<ReactInputValue>(value) ? value.value : value}
            onChange={v => {
                const newValue = isReactInputValue(value) ? initFieldProp<ReactInputValue>(v.currentTarget.value) : value;
                newValue.value = v.currentTarget.value;
                newValue.unsubmittableError = (required && !newValue.value) ? requiredError : undefined;
                onChange(newValue);
            }}
            required={required}
            { ...otherProps }
        />
        { isUnsubmittableValue(value) && <div className="mb-4 text-red text-center">{ value.unsubmittableError }</div>}
    </>;

export default Input;
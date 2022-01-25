import React from 'react';
import classNames from 'classnames';
import { UseFieldProps, isFieldProp, initFieldProp, isUnsubmittableValue } from '../useFormState';
import { OnChange, isArray, NOOP } from '@dmg/core/src/common-types';

export type ReactSelectValue = React.SelectHTMLAttributes<HTMLSelectElement>['value'];
export type SelectValue = ReactSelectValue | UseFieldProps<ReactSelectValue>;

type Props = Omit<Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'>, 'onChange'> & {
    value: SelectValue,
    onChange: OnChange<UseFieldProps<ReactSelectValue>>,
    options: Option[],
    placeholder?: string,
    requiredError?: string,
}

export type Option = {
    value: string,
    text: string,
}

const DEFAULT_KEY = '';

const isReactSelectValue = (value: any): value is ReactSelectValue =>
    typeof value === 'string' || typeof value === 'number' || value === undefined || isArray<string>(value);

const Select = ({ className, options = [], placeholder, value, onChange = NOOP, required, requiredError, ...otherProps }: Props) => {
    const optionClassName = classNames(`h-8 shadow-br rounded border border-formElementBorder`, className);
    return <>
        <select
            className={optionClassName}
            value={isFieldProp<ReactSelectValue>(value) ? value.value : value}
            onChange={v => {
                const newValue = isReactSelectValue(value) ? initFieldProp<ReactSelectValue>(v.currentTarget.value) : value;
                newValue.value = v.currentTarget.value;
                newValue.unsubmittableError = (required && newValue.value === DEFAULT_KEY) ? requiredError : undefined;
                onChange(newValue);
            }}
            { ...otherProps }
        >
            {placeholder && <option value={DEFAULT_KEY} className={classNames(optionClassName, 'text-gray' )}>{ placeholder }</option> }
            { options.map(option => <option key={option.value} value={option.value}>{ option.text }</option>)}
        </select>
        { isUnsubmittableValue(value) && <div className={classNames("mb-4 text-red text-center", className)}>{ value.unsubmittableError }</div>}
    </>;
};

export default Select;
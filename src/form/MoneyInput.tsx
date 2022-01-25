import React from 'react';
import { dollarFormat, dollarUnformat, isNumber } from '@dmg/core/src/formatting';
import FormattedInput from './FormattedInput';
import { isUnsubmittableValue, getRawValue, initFieldProp, UseFieldProps } from '../useFormState';
import { InputValue, InputProps, ReactInputValue } from './Input';
import { OnChange } from '@dmg/core/src/common-types';

export type MoneyInputProps = {} & Omit<Omit<InputProps, 'value'>, 'onChange'> & {
    value: InputValue,
    onChange: OnChange<UseFieldProps<ReactInputValue>>,
    requiredError?: string,
};

const formatMoney = (v: InputValue): string => {
    if (typeof v === "number")
        return v.toUSD() || "";
    else if (!isUnsubmittableValue(v) && isNumber(getRawValue(v)))
        return parseFloat(getRawValue(v)).toFixed(2);
    else
        return getRawValue(v);
}

const unformatMoney = (s: string): UseFieldProps<ReactInputValue> => {
    const d = dollarUnformat(s);
    const value = initFieldProp<ReactInputValue>(d);
    if (d === undefined || isNaN(d))
        value.unsubmittableError = "Invalid format";
    else
        value.value = Math.round(d * 100) / 100;
    return value;
}

const MoneyInput = ({onChange, ...props}: MoneyInputProps) => 
    <FormattedInput
        formatter={formatMoney}
        unformatter={unformatMoney}
        prefix="$"
        placeholder="0.00"
        {...props}
        onChange={v => {
            onChange && onChange(v);
        }}
    />;

    export default MoneyInput;
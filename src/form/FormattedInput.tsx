import React, { useReducer } from 'react';
import { OnChange, NoArgsCallback } from '@dmg/core/src/common-types';
import Input, { InputProps, InputValue, ReactInputValue } from './Input';
import { getRawValue, UseFieldProps, isUnsubmittableValue } from '../useFormState';

type Formatter = (value: InputValue) => string | undefined;
type Unformatter = (str: string) => UseFieldProps<ReactInputValue>;

export type FormattedInputProps = {
    formatter: Formatter,
    unformatter: Unformatter,
    prefix?: string,
    postfix?: string,
    className?: string,
    disabled?: boolean,
    value: InputValue,
    onChange?: OnChange<UseFieldProps<ReactInputValue>>,
    placeholder?: string,
    didFocus?: NoArgsCallback,
    didBlur?: NoArgsCallback,
    formattingError?: string,
    [otherProps: string]: any,
} & InputProps;

interface State {
    focus: boolean,
    textValue: string | undefined,
}

type Action = { type: "FOCUS" }
    | { type: "BLUR", textValue?: string }
    | { type: "CHANGE_TEXT", textValue?: string }
    | { type: "RESET_STATE", newState: State };
type Dispatch = React.Dispatch<Action>;

const composeFormat = (formatter: Formatter, prefix?: string, postfix?: string) => (v: InputValue | undefined) => {
    if (v === undefined)
        return undefined;
    const formatted = formatter(v);
    return formatted !== null && formatted !== undefined && formatted !== "" ? (prefix || "") + formatted + (postfix || "") : "";
};

const composeUnformat = (unformatter: Unformatter) => (t: string) => unformatter(t);

const onFocus = (dispatch: Dispatch, didFocus?: NoArgsCallback) => () => {
    dispatch({ type: "FOCUS" });
    didFocus && didFocus();
};

const onBlur = (dispatch: Dispatch, format: Formatter, value: InputValue|undefined, didBlur?: NoArgsCallback) => () => {
    dispatch({ type: "BLUR", textValue: format(value) });
    didBlur && didBlur();
};

const didEnterValue = (dispatch: Dispatch, props: FormattedInputProps, unformat: Unformatter) =>
    (nextValue: InputValue) => {
        const { value: prevValue, onChange } = props;
        const txt = getRawValue<string>(nextValue);
        const unformattedValue = unformat(txt);
        dispatch({ type: "CHANGE_TEXT", textValue: txt });
        if (onChange && txt !== getRawValue(unformattedValue)) {
            onChange(unformattedValue);
        }
    };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "FOCUS":
            return { ...state, focus: true };
        case "BLUR":
            return { focus: false, textValue: action.textValue };
        case "CHANGE_TEXT":
            return { ...state, textValue: action.textValue };
        case "RESET_STATE":
            return action.newState;
        default:
            throw new Error();
    }
};

const FormattedInput = (props: FormattedInputProps) => {
    const { prefix, postfix, formatter, unformatter, onChange, value, didFocus, didBlur, ...otherProps } = props;
    const format = composeFormat(formatter, prefix, postfix);
    const unformat = composeUnformat(unformatter);
    const initialState = { focus: false, textValue: format(value) };
    const [ { focus, textValue }, dispatch ] = useReducer(reducer, initialState);

    const formatted = focus ? textValue : format(value);

    return <>
        <Input
            value={formatted}
            onChange={didEnterValue(dispatch, props, unformat)}
            onFocus={onFocus(dispatch, didFocus)}
            onBlur={onBlur(dispatch, format, value, didBlur)}
            {...otherProps}
        />
        { isUnsubmittableValue(value) && <div className="mb-4 text-red text-center">{ value.unsubmittableError }</div>}
    </>;
};

export default FormattedInput;

import { useEffect, useRef } from "react";
import iassign from "immutable-assign";
import { Control, NOOP } from "@dmg/core/src/common-types";

export interface FormState<TValues extends object, ValidFormData extends object> {
    form: Form<TValues, ValidFormData>;
    field<K extends keyof TValues>(key: K): UseFieldProps<TValues[K]>;
    radio<K extends keyof TValues>(key: K, value: TValues[K]): Radio;
}

interface Radio {
    onClick: () => void;
    selected: boolean;
    touched: boolean;
    needsFocus: boolean;
}

export interface UseFieldProps<T> extends Control<T> {
    onBlur: () => void;
    touched: boolean;
    error: string;
    needsFocus: boolean;
    unsubmittableError?: string;
}

export interface UnsubmittableValue<T> extends UseFieldProps<T> {
    unsubmittableError: string,
}

export interface UseFormData<T> {
    values: T;
    touched: { [P in keyof T]?: boolean };
    errors: { [P in keyof T]?: string };
    status: FormStatus;
    isFormTouched: boolean; // If a form submission has been attempted
}

type FormStatus = "submitting" | "ready" | "complete";

export interface Form<TValues extends object, ValidFormData extends object> {
    ifValid(callback: (values: ValidFormData) => Promise<any>): Promise<any>;
    submit: Submit<ValidFormData>,
    values: TValues;
    setStatus(status: FormStatus): void;
    status: FormStatus;
}

export interface Submit<ValidFormData extends object> {
    (callback: (values: ValidFormData) => Promise<any>): SubmitProps,
}

export interface SubmitProps {
    onClick: () => void;
    loading: boolean;
}

export function isFieldProp<T>(value: any): value is UseFieldProps<T> {
    return !!(value && !!(value as UseFieldProps<T>).hasOwnProperty('value'));
}

export function isUnsubmittableValue<T>(value: any): value is UnsubmittableValue<T> {
    if (!isFieldProp<T>(value))
        return false;
    else 
        return !!(value && ((value as UnsubmittableValue<T>).unsubmittableError || isUnsubmittableValue<T>(value.value)));
}

export function initFieldProp<T>(v: T): UseFieldProps<T> {
    return isFieldProp<T>(v) ? v : {
        value: v,
        onChange: NOOP,
        onBlur: NOOP,
        touched: false,
        error: "",
        needsFocus: false,
    };
}

export function getRawValue<T>(value: any): T {
    if (isFieldProp(value))
        return isFieldProp(value.value) ? getRawValue(value.value) : value.value as T;
    else
        return value as T;
}

export function initialFormValues<T>(values: T): UseFormData<T> {
    return { values, touched: {}, errors: {}, status: "ready", isFormTouched: false };
}

export function useFormState<RawValues extends object, ValidFormData extends object>(
    state: UseFormData<RawValues>,
    setState: (state: UseFormData<RawValues>) => void,
    validate: (values: RawValues) => Errors<RawValues> | ValidFormData,
): FormState<RawValues, ValidFormData> {
    const needsFocus = useRef(false);

    useEffect(() => {
        if (needsFocus.current) {
            needsFocus.current = false;

            const first = document.querySelector("*[data-needs-focus=true]");
            if (first && "focus" in first) {
                (first as any).focus();
            }
        }
    });

    function ifValid(callback: (values: ValidFormData) => Promise<any>): Promise<any> {
        const validationResult = validate(state.values);
        if (validationResult instanceof Errors) {
            needsFocus.current = true;
            setState({ ...state, errors: validationResult.errors, isFormTouched: true });
            return Promise.reject();
        } else {
            return callback(validationResult);
        }
    }

    function setStatus(status: FormStatus) {
        setState({ ...state, status });
    }

    return {
        field<K extends keyof RawValues>(name: K) {
            return field<RawValues, K, ValidFormData>(state, setState, name, needsFocus.current, validate);
        },
        radio<K extends keyof RawValues>(name: K, value: RawValues[K]) {
            return radio<RawValues, K>(state, setState, name, value, needsFocus.current);
        },
        form: {
            ifValid,
            submit(callback: (values: ValidFormData) => Promise<any>) {
                return {
                    onClick() {
                        ifValid(callback).then(
                            () => setStatus("complete"),
                            () => setStatus("ready"),
                        );
                    },
                    loading: state.status === "submitting",
                };
            },
            setStatus,
            values: state.values,
            status: state.status,
        },
    };
}

function radio<TValues, K extends keyof TValues>(
    state: UseFormData<TValues>,
    setState: (state: UseFormData<TValues>) => void,
    name: K,
    value: TValues[K],
    needsFocus: boolean,
) {
    return {
        selected: state.values[name] === value,
        onClick() {
            const values = { ...state.values, [name]: value };
            const touched = { ...state.touched, [name]: true };
            setState({ ...state, values, touched });
        },
        touched: !!state.touched[name] || state.isFormTouched,
        needsFocus: needsFocus && !!state.errors[name],
    };
}

function field<TValues, K extends keyof TValues, TValid>(
    state: UseFormData<TValues>,
    setState: (state: UseFormData<TValues>) => void,
    name: K,
    needsFocus: boolean,
    validate: (values: TValues) => Errors<TValues> | TValid,
): UseFieldProps<TValues[K]> {
    return {
        onChange(value?: TValues[K]) {
            const values = { ...state.values, [name]: value }; //iassign(state, s => s.values[name], () => value);
            const errors = validate(values) || {};
            setState({ ...state, values, errors });
        },
        value: state.values[name],
        onBlur() {
            setState(
                iassign(
                    state,
                    s => s.touched[name],
                    () => true,
                ),
            );
        },
        touched: !!state.touched[name] || state.isFormTouched,
        needsFocus: needsFocus && !!state.errors[name],
        error: (state.errors[name] || "") as string,
    };
}

export class Errors<T> {
    public readonly errors: { [key in keyof T]: string };

    constructor(errors: { [key in keyof T]: string }) {
        this.errors = errors;
    }
}

type FormValidator<Raw, Valid> = (values: Raw) => Valid | Errors<Raw>;
type CombineValidatorsConfig<RawFormValues> = {
    [P in keyof RawFormValues]?: (value: RawFormValues[P], values: RawFormValues) => Invalid | any;
};

type ValidatorFunc<TValue, Raw, Result> = (value: TValue, values: Raw) => Invalid | Result;

type Valid<Raw, ValidatorObject extends CombineValidatorsConfig<Raw>> = {
    [P in keyof Raw]: ValidatorObject[P] extends ValidatorFunc<Raw[P], Raw, infer V> ? V : Raw[P];
};

export function combineValidators<ValidatorObject>(config: ValidatorObject) {
    return function<RawValues>(values: RawValues): Valid<RawValues, ValidatorObject> | Errors<RawValues> {
        return null as any; // !!! TODO
    };
}

export class Invalid {
    public readonly message: string;

    constructor(message: string) {
        this.message = message;
    }
}


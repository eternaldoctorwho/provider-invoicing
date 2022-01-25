import React from 'react';
import Input, { InputProps } from './Input';

export type NumericInputProps = {} & InputProps;

const NumericInput = (props: NumericInputProps) => 
    <Input
        {...props}
        placeholder={props.placeholder || "0"}
        type="number"
    />;

export default NumericInput;

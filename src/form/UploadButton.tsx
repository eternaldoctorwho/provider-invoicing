import React, { useRef } from 'react';
import Button from './Button';
import Input from './Input';

interface Props {

}

const UploadButton = (props: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return <>
        <Input type="file" hidden={true} value="" onChange={() => {}} />
        <Button color="darkgray" className="w-full">Attach Supporting Documents</Button>
    </>;
};
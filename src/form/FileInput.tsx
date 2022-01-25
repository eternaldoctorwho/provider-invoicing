import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OnChange } from '../../../@dmg/core/src/common-types';
import IconButton from '../IconButton';
import { getRawValue, UseFieldProps, initFieldProp } from '../useFormState';
import Button from './Button';
import { InputProps } from './Input';

export type FileInputValue = UploadedFiles | UseFieldProps<UploadedFiles>;

export type UploadedFiles = { [k: string]: UploadedFile };
export type UploadedFile = {
    id: string,
    fileName: string,
};

export type FileInputProps = {} & Omit<Omit<InputProps, 'value'>, 'onChange'> & {
    value?: FileInputValue,
    onChange: OnChange<UseFieldProps<UploadedFiles>>,
    requiredError?: string,
};

type FileInputAction = { type: 'ADD', fileToUpload: File } | { type: 'DELETE', fileId: string };

const ADD_ACTION = 'ADD';
const DELETE_ACTION = 'DELETE';

const constructUploadProgress = (value, onChange) => (uploadId, objectReference) => {
    const currentValue = value || [];
    const oldFile = currentValue.find(f => f.uploading === uploadId);
    if (!oldFile)
        return;
    const newFile = objectReference
        ? ({
            ...oldFile,
            uploading: null,
            objectReference: objectReference,
        })
        : null;
    const nextValue = currentValue.map(cv => cv === oldFile ? newFile : cv).filter(cv => cv);
    onChange(nextValue);
};

const upload = (filetoUpload: File, uploadProgress) => {
    // called with a file object when we should begin the upload process
    // create an identifier to track this particular upload
    const body = new FormData();
    body.append('file', file);
    return fetch(target, { method: 'POST', body })
        .then(r => r.status >= 200 && r.status < 300 ? r : Promise.reject(r))
        .then(r => r.json())
        .then(result => {
            uploadProgress(id, result[0]);
        })
        .then(() => {
            /*
            this.setState(state => ({
                uploadedFiles: (state.uploadedFiles || []).filter(f => !files.includes(f)),
            }));
            */
        })
        .catch(err => {
            console.error("error uploading:", err);
            uploadProgress(null);
        });
}

const useFileInputReducer = (value: FileInputValue, onChange: FileInputProps['onChange']) => {
    const uploadedFiles = getRawValue<UploadedFiles>(value);
    return [(action: FileInputAction) => {
            switch (action.type) {
                case ADD_ACTION: //Upload new file
                    upload(action.fileToUpload, constructUploadProgress(value, onChange));
                    const newFile: UploadedFile = { id: uuidv4(), fileName: action.fileToUpload.name}; //TODO: Replace call to uuid here with S3 ID
                    const newFiles = initFieldProp<UploadedFiles>({ ...uploadedFiles, [newFile.id]: newFile });
                    onChange({ ...value, ...newFiles });
                    break;
                case DELETE_ACTION: //Remove existing file upload
                    const { [action.fileId]: omit, ...remainingFiles } = uploadedFiles;
                    //TODO: Delete file from S3?
                    onChange(initFieldProp<UploadedFiles>({ ...remainingFiles }));
                    break;
                default:
                    break;
            }
        }];
};


const FileInput = ({ value = {}, onChange, className, requiredError, children, ...otherProps }: FileInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const uploadedFiles = getRawValue<UploadedFiles>(value);
    const [ dispatch ] = useFileInputReducer(value, onChange);
    return <>
        <Button
            color="blue"
            className={className}
            onClick={() => inputRef.current?.click()}
        >
            { children }
        </Button>
        <input
            className="hidden"
            type="file"
            multiple
            ref={inputRef}
            onChange={e => {
                if (e && e.target && e.target.files) {
                    for (let i=0; i < e.target.files.length; i++) {
                        const fileToUpload = e.target.files.item(i);
                        fileToUpload && dispatch({ type: ADD_ACTION, fileToUpload });
                    }
                }
            }}
            {...otherProps}
        />
        <div>
            { Object.values(uploadedFiles).flatMap(file =>
                <div key={`uploaded-file-${file.id}`} className="grid grid-cols-3 text-sm text-orange w-full">
                    <div className="grid-cols-2">{ file.fileName }</div>
                    <div className="grid-cols-1 flex justify-end">
                    <IconButton
                        icon={faTrashAlt}
                        color='red'
                        onClick={() => {
                            dispatch({ type: DELETE_ACTION, fileId: file.id });
                        }}
                    />
                    </div>
                    {!objectReference
                        ? <WaitOverlay />
                        : null
                    }
                </div>
            )}
        </div>
    </>;
};

export default FileInput;
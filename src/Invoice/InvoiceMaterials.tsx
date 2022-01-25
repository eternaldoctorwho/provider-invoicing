import { NOOP } from '@dmg/core/src/common-types';
import { dollarFormat } from '@dmg/core/src/formatting';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useContext } from 'react';
import Button from '../form/Button';
import Input, { ReactInputValue } from '../form/Input';
import MoneyInput from '../form/MoneyInput';
import { FormNextStepLinkProps, makeNextStepLink, StepType } from '../form/MultiStepFormUtils';
import NumericInput from '../form/NumericInput';
import Select, { Option, ReactSelectValue } from '../form/Select';
import IconButton from '../IconButton';
import { getRawValue, initFieldProp, isFieldProp, UseFieldProps } from '../useFormState';
import { InvoiceFormContext } from './Invoice';

export type InvoiceMaterialsProps = {} & UseFieldProps<InvoiceMaterialsValue|undefined>;
type LineItemsObject = { [k: string]: FormLineItem };
export type InvoiceMaterialsValue = {
    questionValue?: QuestionValue,
    materialsFormValue?: MaterialsFormValue,
} & StepType;

type QuestionProps = {
    NextStepLink: React.ComponentType<FormNextStepLinkProps>
} & UseFieldProps<QuestionValue|undefined>;
type QuestionValue = {
    hasMaterials?: boolean,
};

type MaterialsFormProps = {
    NextStepLink: React.ComponentType<FormNextStepLinkProps>,
} & UseFieldProps<MaterialsFormValue|undefined>;
type MaterialsFormValue = {
    materials?: LineItemsObject
};
type MaterialsFormAction = { type: 'ADD' }
    | { type: 'DELETE', lineItemId: string }
    | { type: 'UPDATE', lineItem: FormLineItem };

type LineItemRowProps = {
    dispatch: (a: MaterialsFormAction) => void,
} & UseFieldProps<FormLineItem|undefined>;

type FormLineItem = {
    id: string,
    type?: LineItemType,
    equipmentType?: UseFieldProps<ReactSelectValue>,
    description?: UseFieldProps<ReactInputValue>,
    quantity?: UseFieldProps<ReactInputValue>,
    unitPrice?: UseFieldProps<ReactInputValue>,
};

type LineItemType = typeof MATERIALS | typeof EQUIPMENT;

const MATERIALS = 'materials';
const EQUIPMENT = 'equipment';
const OTHER = 'other';
const NEW_ROW_PREFIX = 'NEW-';
const ADD_ACTION = 'ADD';
const UPDATE_ACTION = 'UPDATE';
const DELETE_ACTION = 'DELETE';
const DEFAULT_TYPE = MATERIALS;
const TYPE_OPTIONS: Option[] = [{ value: MATERIALS, text: 'Materials' }, { value: EQUIPMENT, text: 'Equipment' }];
const EQUIPMENT_OPTIONS: Option[] = [
    { value: '', text: 'Please select an option' },
    { value: 'A', text: 'A' },
    { value: 'B', text: 'B' },
    { value: 'C', text: 'C' },
    { value: 'other', text: 'Other' },
];

const Question = ({ onChange, NextStepLink }: QuestionProps) => 
    <>
        <div className="text-lg mb-4">Do you have any materials to add?</div>
        <div className="flex justify-center">
            <Button color="orange" className="mr-2" onClick={() => onChange({ hasMaterials: true })}>Yes, I would like to enter materials now</Button>
        </div>
        <div className="w-full flex justify-end">
            <NextStepLink><Button color="blue">Review Trip Charge {'>'}</Button></NextStepLink>
        </div>
    </>;

const generateNewRowId = (lineItems: FormLineItem[]): string => {
    const highestIdNum = lineItems
        .filter(lineItem => lineItem.id.startsWith(NEW_ROW_PREFIX))
        .map(lineItem => parseInt(lineItem.id.replace(NEW_ROW_PREFIX, '')))
        .max();
    return `${NEW_ROW_PREFIX}${highestIdNum >= 0 ? highestIdNum+1 : 0}`;
};

export const getMaterialType = (type?: string): string|undefined => TYPE_OPTIONS.find(option => option.value === type)?.text;

export const getMaterialDescription = (lineItem: FormLineItem): string => {
    const { description, equipmentType } = lineItem;
    const rawDescription = getRawValue<string>(description);
    const rawEquipmentType = getRawValue<string>(equipmentType);
    const equipmentTypeText = rawEquipmentType === OTHER ? `Other - ${rawDescription}`: EQUIPMENT_OPTIONS.find(option => option.value === rawEquipmentType)?.text;
    return equipmentTypeText || rawDescription;
};

export const getMaterialSubtotal = (lineItem: FormLineItem): string =>
    (getRawValue<number>(lineItem.quantity) * getRawValue<number>(lineItem.unitPrice)).toUSD();

export const getMaterialsTotal = (lineItemsObj?: LineItemsObject): string|undefined => {
    const lineItems = Object.values(lineItemsObj || {});
    return dollarFormat(lineItems.reduce((acc, lineItem) => {
        const quantity = lineItem.quantity ? parseFloat(getRawValue(lineItem.quantity)) : 0;
        const unitPrice = lineItem.unitPrice ? parseFloat(getRawValue(lineItem.unitPrice)) : 0;
        return acc + parseFloat(((isNaN(quantity) ? 0 : quantity) * (isNaN(unitPrice) ? 0 : unitPrice)).toFixed(2));
    }, 0));
};

const isLineItemType = (value: any): value is LineItemType => {
    const rawValue = isFieldProp(value) ? getRawValue(value) : value;
    return typeof rawValue === 'string' && (typeof rawValue === typeof MATERIALS || typeof rawValue === typeof EQUIPMENT);
};

const LineItemRow = ({ value = { id: '' }, dispatch }: LineItemRowProps) => {
    const { id, type, equipmentType } = value;
    const subtotal = getMaterialsTotal({ value });
    const rawType = getRawValue(type);
    const rawEquipment = getRawValue(equipmentType);
    return <>
        <div className='col-span-1'>
            <Select
                className='w-full'
                value={type}
                required={true}
                requiredError='Type must be selected'
                options={TYPE_OPTIONS}
                onChange={v => {
                    if (isLineItemType(v)) {
                        const newLineItem = { ...value, id, type: v };
                        if (getRawValue(v) !== getRawValue(value.type) && getRawValue(v) === EQUIPMENT)
                            newLineItem.equipmentType = undefined;
                        dispatch({ type: UPDATE_ACTION, lineItem: newLineItem });
                    }
                }}
            />
        </div>
        { rawType === EQUIPMENT && rawEquipment === OTHER ?
                <>
                    <div className='col-span-2'>
                        <Select
                            className='w-full'
                            value={value?.equipmentType}
                            required={true}
                            requiredError='Equipment type must be selected'
                            options={EQUIPMENT_OPTIONS}
                            onChange={v => {
                                const newLineItem = { ...value, id, equipmentType: v };
                                if (getRawValue(v) !== OTHER)
                                    newLineItem.description = undefined;
                                dispatch({ type: UPDATE_ACTION, lineItem: newLineItem });
                            }}
                        />
                    </div>
                    <div className='col-span-2'>
                        <Input
                            className='w-full'
                            placeholder='Equipment description'
                            value={value?.description}
                            required={true}
                            requiredError='Description is required'
                            onChange={v => {
                                dispatch({ type: UPDATE_ACTION,  lineItem: { ...value, id, description: v }});
                            }}
                        />
                    </div>
                </>
            : rawType === EQUIPMENT && rawEquipment !== OTHER ?
                <div className='col-span-4'>
                    <Select
                            className='w-full'
                            value={value?.equipmentType}
                            required={true}
                            requiredError='Equipment type must be selected'
                            options={EQUIPMENT_OPTIONS}
                            onChange={v => {
                                const newLineItem = { ...value, id, equipmentType: v };
                                if (getRawValue(v) !== OTHER)
                                    newLineItem.description = undefined;
                                dispatch({ type: UPDATE_ACTION, lineItem: newLineItem });
                            }}
                        />
                </div>
            : 
                <div className='col-span-4'>
                    <Input
                        className='w-full'
                        placeholder='Material description'
                        value={value?.description}
                        required={true}
                        requiredError='Description is required'
                        onChange={v => {
                            dispatch({ type: UPDATE_ACTION,  lineItem: { ...value, id, description: v }});
                        }}
                    />
                </div>
        }
        
        <div className='col-span-1'>
            <NumericInput
                className='w-full'
                required={true}
                requiredError='Quantity is required'
                value={value?.quantity}
                onChange={v => {
                    dispatch({ type: UPDATE_ACTION,  lineItem: { ...value, id, quantity: v }});
                }}
            />
        </div>
        <div className='col-span-2'>
            <MoneyInput
                className='w-full'
                required={true}
                requiredError='Unit Price is required'
                value={value?.unitPrice}
                onChange={v => {
                    dispatch({ type: UPDATE_ACTION,  lineItem: { ...value, id, unitPrice: v }});
                }}
            />
        </div>
        <div className="col-span-1 flex justify-between">
            <div className="font-bold flex content-center align-middle">$</div>
            <div className="">{ subtotal }</div>
        </div>
        <div className="col-span-1 flex justify-end"> 
            <IconButton
                icon={faTrashAlt}
                color='red'
                onClick={() => {
                    dispatch({ type: DELETE_ACTION,  lineItemId: id });
                }}
            />
        </div>
    </>;
};

const useMaterialsFormReducer = (value: MaterialsFormValue, onChange: MaterialsFormProps['onChange']) => {
    const { materials = {} } = value;
    return [(action: MaterialsFormAction) => {
            switch (action.type) {
                case ADD_ACTION:
                    const newId = generateNewRowId(Object.values(materials));
                    onChange({ ...value, materials: { ...materials, [newId]: { id: newId, type: DEFAULT_TYPE } } });
                    break;
                case DELETE_ACTION: //Remove row
                    const { [action.lineItemId]: omit, ...remainingLineItems } = materials;
                    onChange({ ...value, materials: remainingLineItems });
                    break;
                case UPDATE_ACTION: //Update row
                    const newLineItem = { ...action.lineItem };
                    const newType = getRawValue<string>(newLineItem.type);
                    if (getRawValue<string>(newLineItem.type) === EQUIPMENT) {
                        if (!!getRawValue<string>(newLineItem.description))
                            newLineItem.equipmentType = initFieldProp<ReactSelectValue>(OTHER);
                    } else
                        newLineItem.equipmentType = undefined;
                    onChange({ ...value, materials: { ...materials, [action.lineItem.id]: newLineItem } });
                    break;
                default:
                    break;
            }
        }];
};

const MaterialsForm = ({ value = {}, onChange, NextStepLink, ...otherFormProps }: MaterialsFormProps) => {
    const lineItems = value?.materials || {};
    if (Object.values(lineItems).length === 0) {
        const newId = `${NEW_ROW_PREFIX}0`;
        lineItems[newId] = { id: newId, type: DEFAULT_TYPE };
    }
    const total = getMaterialsTotal(lineItems);
    const [ dispatch ] = useMaterialsFormReducer(value, onChange);

    return <div className="w-full grid grid-cols-10 gap-2">
        <div className="text-orange col-span-5">Materials/Equipment</div>
        <div className="text-orange col-span-1">Quantity</div>
        <div className="text-orange col-span-2">Unit Price</div>
        <div className="text-orange col-span-2">Total Price</div>
        { Object.values(lineItems).flatMap(lineItem => 
            <LineItemRow
                key={`line-item-row-${lineItem.id}`}
                value={lineItem}
                dispatch={dispatch}
                onChange={NOOP} // Changes flow through dispatch prop instead
                {...otherFormProps}
            />
        )}

        <div className="col-span-8"></div>
        <div className="col-span-1 flex justify-between">
            <div className="font-bold flex content-center align-middle">$</div>
            <div className="">{ total }</div>
        </div>
        <div className="col-span-1 flex justify-end">
            <IconButton
                icon={faPlus}
                color='darkgreen'
                onClick={() => {
                    dispatch({ type: ADD_ACTION });
                }}
            />
        </div>

        <div className="col-span-10 flex justify-end mt-6">
            <NextStepLink>
                <Button color="blue" className="">Review Trip Charge {">"}</Button>
            </NextStepLink>
        </div>
    </div>;
};

const InvoiceMaterials = ({ value = {}, onChange, ...otherFormProps }: InvoiceMaterialsProps) => {
    const { jobId } = useContext(InvoiceFormContext);
    const nextStepPath = `/invoice/${jobId}/trip-charge`;
    const hasMaterials = value.questionValue?.hasMaterials;
    const NextStepLink = makeNextStepLink(nextStepPath, value, onChange, () => {
        if (!hasMaterials)
            value.materialsFormValue = {};
    });

    return <div className="shadow-top">
        <div className="bg-lightorange rounded-b shadow p-5">
            <div className="flex flex-col items-center">
                { !hasMaterials
                    ? <Question
                            value={value.questionValue}
                            onChange={v => {
                                value.questionValue = v;
                                if (v?.hasMaterials)
                                    value.isComplete = false;
                                onChange(value);
                            }}
                            NextStepLink={NextStepLink}
                            {...otherFormProps}
                        />
                    : <MaterialsForm
                            value={value.materialsFormValue}
                            onChange={v => {
                                const newValue = {...value};
                                if (v && v.materials && Object.values(v.materials).length === 0)
                                    newValue.questionValue = { hasMaterials: false };
                                newValue.materialsFormValue = v;
                                onChange(newValue);
                            }}
                            NextStepLink={NextStepLink}
                            {...otherFormProps}
                        />
                }
            </div>
        </div>
    </div>
};

export default InvoiceMaterials;
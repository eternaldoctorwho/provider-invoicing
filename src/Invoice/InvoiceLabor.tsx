import React, { useContext } from 'react';
import Button from '../form/Button';
import Input, { ReactInputValue } from '../form/Input';
import { FormNextStepLinkProps, makeNextStepLink, StepType } from '../form/MultiStepFormUtils';
import Select, { ReactSelectValue } from '../form/Select';
import { MockTypes } from '../mock-data';
import { getRawValue, isUnsubmittableValue, UseFieldProps } from '../useFormState';
import { InvoiceFormContext } from './Invoice';
import OnSiteActivityWidget from './OnSiteActivityWidget';
import FileInput, { UploadedFiles } from '../form/FileInput';
import { FileInputValue } from '../form/FileInput';

export type InvoiceLaborProps = {} & UseFieldProps<InvoiceLaborValue|undefined>;
export interface InvoiceLaborValue extends StepType {
    questionValue?: QuestionValue,
    disputeFormValue?: DisputeFormValue,
}

type QuestionProps = { NextStepLink: React.ComponentType<FormNextStepLinkProps> } & UseFieldProps<QuestionValue|undefined>;
export type QuestionValue = {
    isDisputed?: boolean,
};

type DisputeFormProps = {} & UseFieldProps<DisputeFormValue|undefined>;
export type DisputeFormValue = {
    disputeReason?: UseFieldProps<ReactSelectValue>,
    disputeReasonOther?: UseFieldProps<ReactInputValue>,
    disputeAttachments?: UseFieldProps<UploadedFiles>,
};

type LaborDisputeReasonTextProps = {
    value?: InvoiceLaborValue,
};

const OTHER = 'other';
const OPTIONS = [
    { value: `app-didnt-work`, text: `App didn't work` },
    { value: OTHER, text: `Other` },
];

const Question = ({ onChange, NextStepLink }: QuestionProps) => 
    <>
        <div className="text-lg mb-4">Is the above time on-site correct?</div>
        <div className="flex justify-center">
            <Button color="orange" onClick={() => onChange({ isDisputed: true })}>No, I would like to dispute</Button>
        </div>
        <div className="w-full flex justify-end">
            <NextStepLink><Button color="blue" className="mr-2">Enter Materials {'>'}</Button></NextStepLink>
        </div>
    </>;

const LaborDisputeForm = ({ value = {}, onChange }: DisputeFormProps) => 
    <div className="w-1/4 text-left">
        <div className="text-lg mb-4">What is incorrect?</div>
        <Select
            className="w-full mb-4"
            options={OPTIONS}
            value={value?.disputeReason}
            placeholder='Please select an option'
            required={true}
            requiredError='Dispute reason must be selected'
            onChange={v => {
                value.disputeReason = v;
                onChange(value);
            }}
        />
        { !isUnsubmittableValue(value) && getRawValue(value?.disputeReason) === OTHER &&
            <Input
                className="w-full mb-4"
                value={value?.disputeReasonOther}
                required={true}
                requiredError="You must provide a reason. Enter in the field above or select from the dropdown."
                onChange={v => {
                    value.disputeReasonOther = v;
                    onChange(value);
                }}
            />
        }
        <FileInput
            className="w-full"
            value={value?.disputeAttachments}
            onChange={v => {
                value.disputeAttachments = v;
                onChange(value);
            }}
        >
            Attach Supporting Documents
        </FileInput>
    </div>;

export const getLaborHoursTotal = (providerLaborLines: MockTypes.LineItem[] = []): string =>
    providerLaborLines?.reduce((acc, line) => acc + line.quantity, 0).toFixed(1);

export const getLaborTotal = (providerLaborLines: MockTypes.LineItem[] = []): string =>
    providerLaborLines?.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0).toUSD();

export const getLaborSubtotal = (lineItem: MockTypes.LineItem): string =>
    (lineItem.quantity * lineItem.unitPrice).toUSD();

export const LaborDisputeReasonText = ({ value = {} }: LaborDisputeReasonTextProps) => {
    const { disputeFormValue: { disputeReason = {}, disputeReasonOther = {} } = {} } = value || {};
    const reasonValue = getRawValue<string>(disputeReason);
    const reasonValueText = OPTIONS.find(option => option.value === reasonValue)?.text;
    const reasonOtherText = getRawValue<string>(disputeReasonOther);
    return <span>
        { reasonValueText }{ reasonValue === OTHER && !!reasonValueText && <span className="italic">{ ` - ${reasonOtherText}` }</span>}
    </span>;
};

const InvoiceLabor = ({ value = {}, onChange, ...otherFormProps }: InvoiceLaborProps) => {
    const { jobId, job } = useContext(InvoiceFormContext);
    const { providerLaborLines } = job || {};
    const isDisputed = value?.questionValue?.isDisputed;
    const nextStepPath = `/invoice/${jobId}/materials`;
    const NextStepLink = makeNextStepLink(nextStepPath, value, onChange);

    return <>
        <div className="bg-verylightgray rounded-t shadow p-5 grid grid-cols-5 gap-2">
            <div className="font-semibold col-span-2">Type/Item</div>
            <div className="font-semibold text-right">Man Hours</div>
            <div className="font-semibold text-right">Unit Price</div>
            <div className="font-semibold text-right">Amount</div>
            { providerLaborLines?.flatMap(line => ([
                <div key={`line-${line.id}-description`} className="col-span-2">{ line.description }</div>,
                <div key={`line-${line.id}-quantity`} className="text-right">{ line.quantity.toFixed(2) }</div>,
                <div key={`line-${line.id}-unitPrice`} className="text-right">{ line.unitPrice.toUSD() }</div>,
                <div key={`line-${line.id}-subtotal`} className="text-right">{ getLaborSubtotal(line) }</div>,
            ]))}
            <div className="font-semibold col-span-2">Total</div>
            <div className="font-semibold text-right">{ getLaborHoursTotal(providerLaborLines) }</div>
            <div className="font-semibold text-right"></div>
            <div className="font-semibold text-right">{ getLaborTotal(providerLaborLines) }</div>
        </div>
        <div className="shadow-top">
            <div className="bg-lightorange rounded-b shadow p-5">
                <div className="flex flex-col items-center">
                    { !isDisputed &&
                        <Question
                            value={value?.questionValue}
                            onChange={v => {
                                value.questionValue = v;
                                if (v?.isDisputed)
                                    value.isComplete = false;
                                onChange(value);
                            }}
                            NextStepLink={NextStepLink}
                            {...otherFormProps}
                        />
                    }
                    { isDisputed &&
                        <LaborDisputeForm
                            value={value?.disputeFormValue}
                            onChange={v => {
                                value.disputeFormValue = v;
                                onChange(value);
                            }}
                            {...otherFormProps}
                        />
                    }
                </div>
                <div className="flex justify-end">
                    { isDisputed &&
                        <Button color="orange" className="mr-2" onClick={() => {
                            value.questionValue = { isDisputed: false };
                            onChange(value);
                        }}>Cancel</Button>
                    }
                    { isDisputed &&
                        <NextStepLink>
                            <Button color="blue" className="">
                                Enter Materials {">"}
                            </Button>
                        </NextStepLink>
                    }
                </div>
            </div> 
        </div>

        <OnSiteActivityWidget job={job} />
    </>;
};
    
export default InvoiceLabor;
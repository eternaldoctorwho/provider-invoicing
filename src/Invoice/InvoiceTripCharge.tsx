import React, { useContext } from 'react';
import Button from '../form/Button';
import Input, { ReactInputValue } from '../form/Input';
import { FormNextStepLinkProps, makeNextStepLink, StepType } from '../form/MultiStepFormUtils';
import Select, { ReactSelectValue } from '../form/Select';
import { getRawValue, UseFieldProps } from '../useFormState';
import { InvoiceFormContext } from './Invoice';
import { MockTypes } from '../mock-data';

export type InvoiceTripChargeProps = {} & UseFieldProps<InvoiceTripChargeValue|undefined>;
export interface InvoiceTripChargeValue extends StepType {
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
};

const OPTIONS = [
    { value: `cancel-trip-charge`, text: `Cancel the trip charge` },
    { value: `other`, text: `Other` },
];

export const getTripChargeTotal = (tripChargeLines?: MockTypes.LineItem[]): string =>
    (tripChargeLines?.reduce((acc, line) => acc + line.unitPrice, 0) || 0).toUSD();

const Question = ({ onChange, NextStepLink }: QuestionProps) => 
    <>
        <div className="text-lg mb-4">Is the above trip charge information correct?</div>
        <div className="flex justify-center">
            <Button color="orange" onClick={() => onChange({ isDisputed: true })}>No, I would like to dispute</Button>
        </div>
        <div className="w-full flex justify-end">
            <NextStepLink><Button color="blue" className="mr-2">Review {'&'} Submit {'>'}</Button></NextStepLink>
        </div>
    </>;

const TripChargeDisputeForm = ({ value = {}, onChange }: DisputeFormProps) => 
    <div className="max-w-sm text-left">
        <div className="text-lg mb-4">What is incorrect?</div>
        <Select
            className="w-full mb-4"
            options={OPTIONS}
            value={value?.disputeReason}
            onChange={v => onChange({ ...value, disputeReason: v })}
        />
        { getRawValue<string>(value?.disputeReason) === 'other' &&
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
        <Button color="darkgray" className="w-full">Attach Supporting Documents</Button>
    </div>;

const InvoiceTripCharge = ({ value = {}, onChange, ...otherFormProps }: InvoiceTripChargeProps) => {
    const { jobId, job } = useContext(InvoiceFormContext);
    const { tripChargeLines } = job || {};
    const isDisputed = value?.questionValue?.isDisputed;
    const nextStepPath = `/invoice/${jobId}/review`;
    const NextStepLink = makeNextStepLink(nextStepPath, value, onChange);

    return <>
        <div className="bg-verylightgray rounded-t shadow p-5 grid grid-cols-4 gap-2">
            <div className="font-semibold col-span-3">Trip Charge</div>
            <div className="font-semibold text-right">Amount</div>
            { tripChargeLines?.flatMap(line => ([
                <div key={`line-${line.id}-description`} className="col-span-3">{ line.description }</div>,
                <div key={`line-${line.id}-amount`} className="text-right">{ line.unitPrice && line.unitPrice.toUSD() }</div>,
            ]))}
            <div className="font-semibold col-span-3">Total</div>
            <div className="font-semibold text-right">{ getTripChargeTotal(tripChargeLines) }</div>
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
                        <TripChargeDisputeForm
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
                            <Button color="blue" className="" {...otherFormProps}>
                                Review {'&'} Submit {">"}
                            </Button>
                        </NextStepLink>
                    }
                </div>
            </div> 
        </div>
    </>;
};
    
export default InvoiceTripCharge;
import React, { useContext } from 'react';
import { makeSubmitLink, StepType } from '../form/MultiStepFormUtils';
import { getRawValue, Submit, UseFieldProps } from '../useFormState';
import { InvoiceDraft, InvoiceFormContext } from './Invoice';
import { getLaborHoursTotal, getLaborSubtotal, getLaborTotal, LaborDisputeReasonText } from './InvoiceLabor';
import { getMaterialSubtotal, getMaterialType, getMaterialsTotal, getMaterialDescription } from './InvoiceMaterials';
import { getTripChargeTotal } from './InvoiceTripCharge';
import Input, { ReactInputValue } from '../form/Input';
import MoneyInput from '../form/MoneyInput';

export type InvoiceReviewProps = {
    draft: InvoiceDraft,
    submit: Submit<InvoiceDraft>,
} & UseFieldProps<InvoiceReviewValue|undefined>;
export type InvoiceReviewValue = {
    discount?: UseFieldProps<ReactInputValue>,
} & StepType;

type DisputeReasonProps = {
    disputeReasonText?: string,
    disputeReasonOther?: string,
};

const onSubmit = (draft: InvoiceDraft) => {
    // TODO: Add front-end call for gRPC data update
    return Promise.resolve();
};

const DisputeReason = ({ disputeReasonText, disputeReasonOther }: DisputeReasonProps) => {
    return <div>
        { disputeReasonText }
        { disputeReasonOther && <span className="italic">` - ${disputeReasonOther}`</span> }
    </div>;
};

const InvoiceReview = ({ value = {}, onChange, draft, submit, ...otherFormProps }: InvoiceReviewProps) => {
    const { jobId, job } = useContext(InvoiceFormContext);
    const { nte, providerLaborLines, tripChargeLines } = job || {};
    const {
        labor = {},
        materials: { materialsFormValue = {} } = {},
    } = draft;
    const { disputeFormValue: { disputeReason = {} } = {} } = labor;
    const { discount } = value;

    const laborHoursTotal = getLaborHoursTotal(providerLaborLines);
    const laborTotal = getLaborTotal(providerLaborLines);
    const materialsTotal = parseFloat(getMaterialsTotal(materialsFormValue.materials) || '0').toUSD();
    const tripChargeTotal = getTripChargeTotal(tripChargeLines);
    const grandTotal = laborTotal.fromUSD() + materialsTotal.fromUSD() + tripChargeTotal.fromUSD();

    const SubmitLink = makeSubmitLink(submit, onSubmit);

    return <div className="invoice-review">
        <div className="line-items border border-solid border-lightgray rounded-t shadow p-5 grid grid-cols-12 mb-6">
            <div className="col-span-6 text-lg font-bold mb-6">Labor</div>
            <div className="col-span-6 text-right text-lg font-bold mb-6"><span className="mr-6">Total</span> { laborTotal }</div>

            <div className="col-span-4 text-darkgray text-sm font-bold">Type/Item</div>
            <div className="col-span-2 text-darkgray text-sm font-bold">Man Hours</div>
            <div className="col-span-3 text-darkgray text-sm font-bold text-right">Unit Price</div>
            <div className="col-span-3 text-darkgray text-sm font-bold text-right">Amount</div>

            { providerLaborLines?.flatMap(lineItem => ([
                <div key={`line-${lineItem.id}-description`} className="row col-span-4">{ lineItem.description }</div>,
                <div key={`line-${lineItem.id}-quantity`} className="row col-span-2">{ lineItem.quantity.toFixed(1) }</div>,
                <div key={`line-${lineItem.id}-unitPrice`} className="row col-span-3 text-right">{ lineItem.unitPrice.toUSD() }</div>,
                <div key={`line-${lineItem.id}-subtotal`} className="row col-span-3 text-right">{ getLaborSubtotal(lineItem) }</div>,
            ]))}

            <div className="footer col-span-4 font-bold mb-6">Total</div>
            <div className="footer col-span-2 font-bold mb-6">{ laborHoursTotal }</div>
            <div className="footer col-span-6 text-right font-bold mb-6">{ laborTotal }</div>

            { !!getRawValue<string>(disputeReason) &&
                <div className="col-span-6 border border-solid border-infoBoxOrange bg-lightorange p-4 grid grid-cols-6 text-sm">
                    <div className="col-span-4 text-infoBoxOrange font-bold">Dispute</div>
                    <div className="col-span-2 text-infoBoxOrange font-bold">Attached Files</div>
                    <div className="col-span-4">
                        <LaborDisputeReasonText value={labor} />
                    </div>
                </div>
            }
        </div>

        <div className="line-items border border-solid border-lightgray rounded-t shadow p-5 grid grid-cols-12 mb-6">
            <div className="col-span-6 text-lg font-bold mb-6">Materials {'&'} Equipment</div>
            <div className="col-span-6 text-right text-lg font-bold mb-6"><span className="mr-6">Total</span> { materialsTotal }</div>

            <div className="col-span-2 text-darkgray text-sm font-bold">Materials or Equipment?</div>
            <div className="col-span-4 text-darkgray text-sm font-bold">Description</div>
            <div className="col-span-2 text-darkgray text-sm font-bold text-right">Quantity</div>
            <div className="col-span-2 text-darkgray text-sm font-bold text-right">Unit Price</div>
            <div className="col-span-2 text-darkgray text-sm font-bold text-right">Amount</div>

            { Object.values(materialsFormValue.materials || {}).flatMap(lineItem => ([
                <div key={`line-${lineItem.id}-type`} className="row col-span-2">
                    { getMaterialType(getRawValue<string>(lineItem.type)) }
                </div>,
                <div key={`line-${lineItem.id}-description`} className="row col-span-4">
                    { getMaterialDescription(lineItem) }
                </div>,
                <div key={`line-${lineItem.id}-quantity`} className="row col-span-2 text-right">
                    { getRawValue<number>(lineItem.quantity) }
                </div>,
                <div key={`line-${lineItem.id}-unitPrice`} className="row col-span-2 text-right">
                    { getRawValue<number>(lineItem.unitPrice).toUSD() }
                </div>,
                <div key={`line-${lineItem.id}-subtotal`} className="row col-span-2 text-right">
                    { getMaterialSubtotal(lineItem) }
                </div>,
            ]))}

            <div className="footer col-span-6 font-bold mb-6">Total</div>
            <div className="footer col-span-6 text-right font-bold">{ materialsTotal }</div>
        </div>

        <div className="line-items border border-solid border-lightgray rounded-t shadow p-5 grid grid-cols-12 mb-6">
            <div className="col-span-6 text-lg font-bold mb-6">Trip Charge(s)</div>
            <div className="col-span-6 text-right text-lg font-bold mb-6"><span className="mr-6">Total</span> { tripChargeTotal }</div>

            <div className="col-span-6 text-darkgray text-sm font-bold">Description</div>
            <div className="col-span-6 text-darkgray text-sm font-bold text-right">Amount</div>

            { tripChargeLines?.flatMap(lineItem => ([
                <div key={`line-${lineItem.id}-type`} className="row col-span-6">
                    { lineItem.description }
                </div>,
                <div key={`line-${lineItem.id}-description`} className="row col-span-6 text-right">
                    { lineItem.unitPrice.toUSD()}
                </div>,
            ]))}

            <div className="footer col-span-6 font-bold mb-6">Total</div>
            <div className="footer col-span-6 text-right font-bold">{ tripChargeTotal }</div>
        </div>

        <div className="grid grid-cols-5">
            <div className="col-span-4 flex justify-end">
                {/* <NTE
                    value={nte}
                    onChange={() => {
                        onChange({ ...value, discount: (grandTotal - nte) })
                    }}
                /> */}
            </div>
            <div className="col-span-1 rounded-t shadow p-5 flex flex-col">
                <div className="grid grid-cols-2">
                    <span className="p-2 pr-3 text-right">Discount</span>
                    <MoneyInput
                        className="text-right"
                        value={discount}
                        onChange={v => {
                            onChange({ ...value, discount: v });
                        }}
                    />
                </div>
                <div className="text-xl font-bold text-right">
                    <span className="pr-4">Grand Total</span>
                    {grandTotal.toUSD()}
                </div>
            </div>
        </div>
    </div>
};

export default InvoiceReview;
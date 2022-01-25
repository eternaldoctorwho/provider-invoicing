import { LocalProtoDate } from '@dmg/core/src/protocolTypes';
import { formatter, protoDateToLocalDate } from '@dmg/core/src/time';
import React from 'react';
import { Route, RouteComponentProps, Switch, useParams } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbLinks } from '../Breadcrumbs';
import CollapsibleText from '../CollapsibleText';
import { MultiStepData } from '../form/MultiStepFormUtils';
import Loading from '../Loading';
import { MockTypes } from '../mock-data';
import '../NumberExtensions';
import '../StringExtensions';
import { Location, ServiceType } from '../TextUtilities';
import { Errors, FormState, initialFormValues, useFormState } from '../useFormState';
import useLocalStorage from '../useLocalStorage';
import { isReadyWithData, useMockSubscription } from '../useMockSubscription';
import InvoiceLabor, { InvoiceLaborValue } from './InvoiceLabor';
import InvoiceMaterials, { InvoiceMaterialsValue } from './InvoiceMaterials';
import InvoiceReview, { InvoiceReviewValue } from './InvoiceReview';
import InvoiceTripCharge, { InvoiceTripChargeValue } from './InvoiceTripCharge';
import '../../style/invoice.css';
import { UploadedFile } from '../form/FileInput';

interface InvoiceProps extends RouteComponentProps<any> {   
}

interface InvoiceWithDataProps {
    pathname: string,
    jobId: string,
    job: MockTypes.ProviderJob,
}

interface InvoiceFormContext {
    jobId: string,
    job?: MockTypes.ProviderJob,
}

type InvoiceDraftStepKeys = 'labor' | 'materials' | 'tripCharge' | 'review';

export interface InvoiceDraft extends MultiStepData {
    jobId?: "",
    labor?: InvoiceLaborValue,
    materials?: InvoiceMaterialsValue, // TODO: Add types for other steps, including materials
    tripCharge?: InvoiceTripChargeValue,
    review?: InvoiceReviewValue,
}

type InvoiceFormErrors = { [key in keyof InvoiceDraft]: string };

const BREADCRUMBS: BreadcrumbLinks<InvoiceDraftStepKeys> = {
    labor: {
        label: 'Labor',
        link: '/invoice/:jobId/labor',
    },
    materials: {
        label: 'Materials',
        link: '/invoice/:jobId/materials',
    },
    tripCharge: {
        label: 'Trip Charge',
        link: '/invoice/:jobId/trip-charge',
    },
    review: {
        label: 'Review & Submit',
        link: '/invoice/:jobId/review',
    },
};

const DATE_FORMATTER = formatter("M/D/YYYY");

const DRAFT_DEFAULTS: InvoiceDraft = {
    labor: {},
    materials: {},
    tripCharge: {},
    review: {},
};

export const InvoiceFormContext = React.createContext<InvoiceFormContext>({ jobId: "" });

const formatDate = (d?: LocalProtoDate) => d ? protoDateToLocalDate(d).format(DATE_FORMATTER) : "";

const LandingPageRedirect = (draft: InvoiceDraft, { field }: FormState<InvoiceDraft, InvoiceDraft>) =>
    (props: RouteComponentProps<any>) => {
        if (!draft.labor?.isComplete)
            return <InvoiceLabor {...props} {...field('labor')} />;
        else if (!draft.materials?.isComplete)
            return <InvoiceMaterials {...props} {...field('materials')} />;
        else
            return <InvoiceLabor {...props} {...field('labor')} />;
    };

//TODO: Should this be generalized to a HOC (e.g. WithSubscription)?  Or a hook (e.g. useSubscription)?
const Invoice = ({ location: { pathname } }: InvoiceProps) => {
    const { jobId = "" } = useParams(); // TODO: Need to show an invalid data page when jobId is missing or incorrect or not found

    const subscription = useMockSubscription<string, MockTypes.ProviderJob>({ source: 'mock', subscription: 'provider-job' }, jobId);
    let job: MockTypes.ProviderJob|undefined = undefined;
    if (isReadyWithData(subscription)) {
        job = subscription.data[0].value as MockTypes.ProviderJob;
        if (job)
            return <InvoiceWithData pathname={pathname} jobId={jobId} job={job} />;
        else
            return <Loading/>; //TODO: This should be an error page, because the job was not found
    } else {
        return <Loading/>;
    }
};

const validate = (draft: InvoiceDraft) => {
    const { labor, materials, tripCharge, discounts } = draft;
    const errors: InvoiceFormErrors = {};

    if (!labor || !labor.isComplete)
        errors['labor'] = 'Labor must be reviewed before finalizing invoice';
    else if (!materials || !materials.isComplete)
        errors['materials'] = 'Materials must be reviewed before finalizing invoice';
    else if (!tripCharge || !tripCharge.isComplete)
        errors['tripCharge'] = 'Trip Charge must be reviewed before finalizing invoice';
    
    return Object.keys(errors).length > 0 ? new Errors(errors) : draft;
};

const InvoiceWithData = ({ pathname, jobId, job }: InvoiceWithDataProps) => {
    const urlBase = `/invoice/${jobId}`;

    const [ { timestamp, value: draft }, setDraft ] = useLocalStorage<InvoiceDraft>(`invoice-draft-${jobId}`, DRAFT_DEFAULTS);

    const breadcrumbs = (Object.keys(BREADCRUMBS) as InvoiceDraftStepKeys[])
        .reduce((acc, k) => {
            const b = BREADCRUMBS[k];
            acc[k] = { ...b, link: b.link.replace(':jobId', jobId)};
            return acc;
        }, {} as BreadcrumbLinks<InvoiceDraftStepKeys>);
    const currentStep = Object.values(breadcrumbs).findIndex(({ link }) => pathname === link.replace(':jobId', jobId)) + 1;

    const formState = useFormState<InvoiceDraft, InvoiceDraft>(
        initialFormValues<InvoiceDraft>(draft),
        state => setDraft(state.values),
        validate, // TODO: Validate fn
    );
    const { field, form } = formState;
    
    return (
        <InvoiceFormContext.Provider value={{ jobId, job }}>
            <div className="invoice-review p-8">
                <div className="text-xl font-semibold mb-6">Get Paid</div>
                <div className="text-blue font-semibold mb-2">{ job.purchaseOrderNumber }</div>
                <div className="text-orange mb-2">Revision Requested</div>
                <div className="text-sm text-darkgray mb-4">{ formatDate(job.invoiceDate) }</div>

                <div className="flex flex-col md:flex-row mb-4">
                    <Location className="mr-6 mb-2 md:mb-0" text={job.propertyName} />
                    <ServiceType text={job.serviceType} />
                </div>
                <CollapsibleText>{job.scope}</CollapsibleText>

                <Breadcrumbs<InvoiceDraftStepKeys, InvoiceDraft> breadcrumbs={breadcrumbs} data={form.values} currentStep={currentStep} />

                <div className="mb-20">
                    <Switch>
                        <Route exact path={urlBase} render={LandingPageRedirect(draft, formState)} />
                        <Route path={`${urlBase}/labor`} render={(props) => <InvoiceLabor {...props} {...field('labor')}/>} />
                        <Route path={`${urlBase}/materials`} render={(props) => <InvoiceMaterials {...props} {...field('materials')}/>} />
                        <Route path={`${urlBase}/trip-charge`} render={(props) => <InvoiceTripCharge {...props} {...field('tripCharge')}/>} />
                        <Route path={`${urlBase}/review`} render={(props) => <InvoiceReview {...props} {...field('review')} draft={form.values} submit={form.submit}/>} />
                        <Route render={(props) => <InvoiceLabor {...props} {...field('labor')}/>} />
                    </Switch>
                </div>
            </div>
        </InvoiceFormContext.Provider>
    );
};

export default Invoice;
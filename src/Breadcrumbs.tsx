import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import './ArrayExtensions';
import { BREADCRUMB_STATUS } from './Enum';
import { MultiStepData, isStepType } from './form/MultiStepFormUtils';

export type Breadcrumb = {
    label: string,
    link: string,
    enabled?: boolean,
};

export type BreadcrumbLinks<K extends string> = Record<K, Breadcrumb>;

interface BreadcrumbsProps<K extends string, T extends MultiStepData> {
    breadcrumbs: BreadcrumbLinks<K>,
    data?: T,
    currentStep?: number,
}

interface BreadcrumbProps {
    index: number,
    status: BREADCRUMB_STATUS,
    breadcrumb: Breadcrumb,
}

interface CircleProps {
    className?: string,
}

interface EditLinkProps {
    link?: string,
}

const Circle = ({ children, className }: React.PropsWithChildren<CircleProps>) =>
    <div className={classNames("rounded-full w-8 h-8 flex items-center justify-center text-white font-bold", className)}>
        { children }
    </div>;

const EditLink = ({ link }: EditLinkProps) => <Link to={link || '/'}><FontAwesomeIcon icon={faPen} /></Link>;

const Breadcrumb = ({ index, status, breadcrumb: { label, link }} : BreadcrumbProps) => {
    return <div className="breadcrumb flex flex-start">
        <Circle className={classNames({
            "bg-blue": status === BREADCRUMB_STATUS.COMPLETE,
            "bg-orange": status === BREADCRUMB_STATUS.IN_PROGRESS,
            "bg-gray": status === BREADCRUMB_STATUS.TO_DO,
        })}>
            { status === BREADCRUMB_STATUS.COMPLETE ? <EditLink link={link}/>:  index } 
        </Circle>
        <div className={classNames("flex items-center ml-2", {
            "font-bold": status === BREADCRUMB_STATUS.IN_PROGRESS,
        })}>
            { label }
        </div>
    </div>;
};

const Separator: React.ComponentType = () => <div className="pl-4 pr-4 flex flex-1 items-center"><hr className="flex-1"/></div>;

const Breadcrumbs = <K extends string, T extends MultiStepData>({ breadcrumbs, data, currentStep }: BreadcrumbsProps<K,T>) => {
    const currentStepNum = currentStep && currentStep >= 1 ? currentStep : 1;
    return <div className="breadcrumbs flex justify-between mt-8 mb-8">
        {
            Object.keys(breadcrumbs)
                .map((key, index) => {
                    let status = BREADCRUMB_STATUS.TO_DO;
                    if (index === currentStepNum - 1)
                        status = BREADCRUMB_STATUS.IN_PROGRESS;
                    else if (data) {
                        const breadcrumbData = data[key];
                        if (breadcrumbData && isStepType(breadcrumbData)) {
                            if (breadcrumbData.isComplete)
                                status = BREADCRUMB_STATUS.COMPLETE;
                            else
                                status = BREADCRUMB_STATUS.TO_DO;
                        }
                    }

                    return <Breadcrumb key={index} index={index+1} status={status} breadcrumb={breadcrumbs[key as K]}/>;
                })
                .separate(Separator)
        }
    </div>;
};

export default Breadcrumbs;
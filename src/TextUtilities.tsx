import React from 'react';
import { faMapMarkerAlt, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface TextUtilProps {
    className?: string,
    text?: string,
}

export const Location = ({ className, text }: TextUtilProps) =>
    <div className={className}>
        <FontAwesomeIcon className="text-orange mr-2" icon={faMapMarkerAlt}/>
        <span className="font-semibold">{ text }</span>
    </div>;

export const ServiceType = ({ className, text }: TextUtilProps) =>
    <div>
        <FontAwesomeIcon className="text-darkgray mr-2" icon={faWrench}/>
        <span className="font-semibold">{ text }</span>
    </div>
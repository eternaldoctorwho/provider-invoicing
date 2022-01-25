import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import classNames from 'classnames';

interface LoadingProps {
    className?: string,
}

const Loading = ({ className }: LoadingProps) => {
    return <div className={classNames("w-full h-full flex justify-center pt-6", className)}>
        <FontAwesomeIcon className="text-darkgray fa-spin" icon={faSync} size="3x"/>
    </div>;
};

export default Loading;
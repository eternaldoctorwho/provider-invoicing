import React, { useState } from 'react';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSpring, animated } from 'react-spring';
import classNames from 'classnames';

interface Props {

}

const CollapsibleText = ({ children }: React.PropsWithChildren<Props>) => {
    const [ isFullyVisible, setFullVisibility ] = useState<boolean>(false);
    const divProps = useSpring({
        maxHeight: isFullyVisible ? '36rem' : '3rem',
    });

    const actionText = isFullyVisible ? 'Hide Details' : 'Expand Details';
    const actionIcon = isFullyVisible ? faChevronUp : faChevronDown;

    return children
    ? <div>
        <animated.div style={divProps} className={classNames("whitespace-pre-line overflow-y-hidden", { "collapsed-text": !isFullyVisible })}>
            { children }
        </animated.div>
        <a href="#" onClick={() => setFullVisibility(!isFullyVisible)} className="text-blue flex justify-end">
            <span className="font-semibold pr-1">{ actionText }</span>
            <FontAwesomeIcon icon={actionIcon} />
        </a>
    </div>
    : null;
};

export default CollapsibleText;
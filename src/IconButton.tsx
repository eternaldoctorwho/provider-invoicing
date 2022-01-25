import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import Button, { Color } from './form/Button';

interface Props {
    icon: FontAwesomeIconProps['icon'],
    onClick: () => void,
    color?: Color,
    size?: FontAwesomeIconProps['size'],
    className?: string,
}

const IconButton = ({ icon, onClick, color = 'orange', size, className = "" }: Props) => 
    <Button
        color={color}
        className={classNames('h-8 w-8 flex justify-center content-center font-bold', className)}
        onClick={() => onClick()}>
        <FontAwesomeIcon icon={icon} size={size} />
    </Button>
;

export default IconButton;
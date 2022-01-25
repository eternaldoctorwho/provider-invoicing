import React from 'react';
import classNames from 'classnames';

export type Color = 'orange' | 'blue' | 'darkgray' | 'red' | 'darkgreen';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    color: Color,
};

const Button = ({ children, color, className, ...otherProps }: React.PropsWithChildren<Props>) =>
    <button className={classNames(`bg-${color} text-white font-medium rounded px-4 py-2 shadow-br`, className)} {...otherProps} >
        { children }
    </button>;

export default Button;
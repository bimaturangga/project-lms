import React from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outline' | 'ghost';
    padding?: 'sm' | 'md' | 'lg' | 'none';
    clickable?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    clickable = false,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                styles.card,
                styles[variant],
                padding === 'none' ? styles.noPadding : styles[padding],
                clickable && styles.clickable,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Card sub-components
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={cn(styles.cardHeader, className)} {...props}>
        {children}
    </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={cn(styles.cardBody, className)} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={cn(styles.cardFooter, className)} {...props}>
        {children}
    </div>
);

export default Card;

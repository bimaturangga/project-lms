import React from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    showDot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    showDot = false,
    className,
    ...props
}) => {
    return (
        <span
            className={cn(styles.badge, styles[variant], styles[size], className)}
            {...props}
        >
            {showDot && <span className={styles.dot} />}
            {children}
        </span>
    );
};

export default Badge;

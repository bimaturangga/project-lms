'use client';

import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            size = 'md',
            leftIcon,
            rightIcon,
            isRequired,
            type = 'text',
            className,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div
                className={cn(
                    styles.inputWrapper,
                    error && styles.error,
                    styles[size],
                    leftIcon && styles.hasLeftIcon,
                    (rightIcon || isPassword) && styles.hasRightIcon,
                    className
                )}
            >
                {label && (
                    <label className={styles.label}>
                        {label}
                        {isRequired && <span className={styles.required}>*</span>}
                    </label>
                )}

                <div className={styles.inputContainer}>
                    {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

                    <input
                        ref={ref}
                        type={inputType}
                        className={styles.input}
                        {...props}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            className={styles.rightIcon}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                        </button>
                    ) : (
                        rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>
                    )}
                </div>

                {error && <span className={styles.errorMessage}>{error}</span>}
                {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

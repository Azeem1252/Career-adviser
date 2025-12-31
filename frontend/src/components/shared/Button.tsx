import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'icon';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            loading = false,
            icon,
            iconPosition = 'left',
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        // Design System Compliant Styles
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

        const variantStyles = {
            // Primary: 40px height, 14px font, 8px radius
            primary: 'h-[40px] px-4 text-[14px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[#1d4ed8]',

            // Secondary: 36px height, 14px font, 8px radius
            secondary: 'h-[36px] px-4 text-[14px] font-medium rounded-lg bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-gray-50',

            // Icon: 32px × 32px
            icon: 'w-[32px] h-[32px] rounded-lg bg-transparent border-none hover:bg-gray-100',
        };

        const transitionStyle = 'duration-[150ms] ease-in-out';

        return (
            <button
                ref={ref}
                className={clsx(
                    baseStyles,
                    variantStyles[variant],
                    transitionStyle,
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {!loading && icon && iconPosition === 'left' && (
                    <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
                )}
                {children}
                {!loading && icon && iconPosition === 'right' && (
                    <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            icon,
            iconPosition = 'left',
            type = 'text',
            className,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword && showPassword ? 'text' : type;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={inputType}
                        className={clsx(
                            'w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 transition-all duration-200',
                            'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary',
                            'placeholder:text-slate-400 font-medium text-sm',
                            error
                                ? 'border-rose-500 focus:ring-rose-500/10'
                                : 'hover:border-slate-300',
                            icon && iconPosition === 'left' && 'pl-12',
                            icon && iconPosition === 'right' && 'pr-12',
                            isPassword && 'pr-12',
                            className
                        )}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && !isPassword && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

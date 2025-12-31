import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            variant = 'default',
            padding = 'md',
            hover = false,
            className,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'rounded-[2rem] transition-all duration-300';

        const variantStyles = {
            default: 'bg-card border border-border',
            glass: 'glass border-blue-500/10',
            gradient: 'premium-gradient text-white',
        };

        const paddingStyles = {
            none: '',
            sm: 'p-4',
            md: 'p-6 md:p-8',
            lg: 'p-8 md:p-12',
        };

        const hoverStyles = hover
            ? 'hover:shadow-xl hover:scale-[1.02] hover:border-blue-500/30 cursor-pointer'
            : '';

        return (
            <div
                ref={ref}
                className={clsx(
                    baseStyles,
                    variantStyles[variant],
                    paddingStyles[padding],
                    hoverStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx('mb-6', className)} {...props}>
        {children}
    </div>
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
        className={clsx(
            'text-xl md:text-2xl font-black uppercase tracking-tighter italic',
            className
        )}
        {...props}
    >
        {children}
    </h3>
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
    <p className={clsx('text-muted-foreground mt-2', className)} {...props}>
        {children}
    </p>
);

CardDescription.displayName = 'CardDescription';

export const CardContent = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div className={className} {...props}>
        {children}
    </div>
);

CardContent.displayName = 'CardContent';

export const CardFooter = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx('mt-6 pt-6 border-t border-border', className)} {...props}>
        {children}
    </div>
);

CardFooter.displayName = 'CardFooter';

import React from 'react';

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col group">
        <label className="text-xs tracking-[0.1em] text-muted-foreground uppercase mb-2 font-sans group-focus-within:text-gold transition-colors">
          {label}
        </label>
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 bg-[#FAFAFA] border border-border/60 rounded-sm text-foreground text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/40 resize-none ${
            error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-destructive text-[11px] mt-1.5 uppercase tracking-wider">{error}</span>}
      </div>
    );
  }
);
PremiumTextarea.displayName = 'PremiumTextarea';

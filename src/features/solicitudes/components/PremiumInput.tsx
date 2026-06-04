import React from 'react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col group">
        <label className="text-xs tracking-[0.1em] text-muted-foreground uppercase mb-2 font-sans group-focus-within:text-gold transition-colors">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-[#FAFAFA] border-b border-border/60 text-foreground text-sm focus:outline-none focus:border-gold focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/40 ${
            error ? 'border-destructive focus:border-destructive' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-destructive text-[11px] mt-1.5 uppercase tracking-wider">{error}</span>}
      </div>
    );
  }
);
PremiumInput.displayName = 'PremiumInput';

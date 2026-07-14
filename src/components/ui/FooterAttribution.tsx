import React from 'react';

export function FooterAttribution({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full py-8 text-center bg-transparent ${className}`}>
      <p className="text-sm font-sans text-inherit">
        <span className="opacity-60">Diseñado y desarrollado por</span>{' '}
        <a
          href="https://mursatsolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block relative transition-opacity duration-300 group opacity-70 hover:opacity-100"
        >
          <span className="relative z-10 font-medium tracking-wide">MurSat Solutions</span>
          <span className="absolute left-0 bottom-0 w-full h-[1px] bg-current scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left" />
        </a>
      </p>
    </div>
  );
}

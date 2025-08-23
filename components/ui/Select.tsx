import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  icon?: React.ReactElement<{ className?: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {React.cloneElement(icon, { className: 'h-5 w-5 text-slate-400' })}
           </div>
        )}
        <select
          className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-600 appearance-none ${icon ? 'pl-10 pr-8' : 'px-3 pr-8'} ${className}`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = (props) => {
    return <option {...props} />;
};
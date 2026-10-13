import * as React from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Admin form field: label above, input, error below linked by aria-describedby
 * (DESIGN.md §4.7). Inputs are 16 px so iOS Safari doesn't zoom on focus.
 */
export function TextField({
  label,
  error,
  multiline = false,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  label: string;
  error?: string;
  multiline?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputClass = cn(
    'w-full rounded-sm border border-rule bg-background px-3 text-lg text-foreground',
    'aria-invalid:border-danger disabled:bg-tint disabled:opacity-40',
    multiline ? 'min-h-20 py-2' : 'min-h-11',
  );
  const shared = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          className={inputClass}
          name={props.name}
          value={props.value}
          onChange={props.onChange as React.ChangeEventHandler<HTMLTextAreaElement> | undefined}
          maxLength={props.maxLength}
          required={props.required}
        />
      ) : (
        <input {...shared} className={inputClass} {...props} />
      )}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Native checkbox with a 44 px tall label as the touch target. */
export function CheckboxField({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { label: string }) {
  return (
    <label className={cn('inline-flex min-h-11 items-center gap-2 text-base', className)}>
      <input type="checkbox" className="size-5 accent-burgundy" {...props} />
      {label}
    </label>
  );
}

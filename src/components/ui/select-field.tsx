import { useId } from 'react';
import type { ComponentProps } from 'react';
export function SelectField({
  label,
  children,
  ...props
}: ComponentProps<'select'> & { readonly label: string }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select {...props} id={id} className="field-control">
        {children}
      </select>
    </div>
  );
}
export function TextareaField({
  label,
  ...props
}: ComponentProps<'textarea'> & { readonly label: string }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <textarea {...props} id={id} className="field-control" />
    </div>
  );
}

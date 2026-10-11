import { useId } from 'react';
import type { ComponentProps } from 'react';
export function Field({label,error,...props}:ComponentProps<'input'> & { readonly label:string; readonly error?:string | undefined }) {
  const generated=useId(); const id=props.id??generated;
  return <div className="min-w-0"><label className="mb-2 block text-sm font-medium" htmlFor={id}>{label}</label><input {...props} id={id} className="field-control" aria-invalid={Boolean(error)} aria-describedby={error?id+'-error':undefined}/>{error&&<p id={id+'-error'} className="mt-2 text-sm text-accent-text" role="alert">{error}</p>}</div>;
}

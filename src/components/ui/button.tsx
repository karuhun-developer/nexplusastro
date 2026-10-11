import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export const buttonVariants = cva(
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-control px-6 py-3 text-[.9375rem] font-semibold transition-colors duration-150 disabled:opacity-60 active:opacity-75',
  {
    variants: {
      variant: {
        default: 'bg-action text-white hover:bg-action-hover',
        outline: 'border border-rule hover:bg-raised',
        ghost: 'hover:bg-raised',
        link: 'px-0 justify-start hover:underline underline-offset-4',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { readonly asChild?: boolean }) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ variant, className }))} {...props} />;
}

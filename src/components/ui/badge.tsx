import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-[var(--brand-deep-blue)] to-[var(--brand-blue)] text-white [a&]:hover:from-[var(--brand-blue)] [a&]:hover:to-[var(--brand-light)]",
        secondary:
          "border-transparent bg-[var(--panel-bg)] text-[var(--foreground)] [a&]:hover:bg-[var(--accent-blue3)]",
        destructive:
          "border-transparent bg-[var(--error)] text-white [a&]:hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]",
        outline:
          "text-[var(--brand-blue)] border-[var(--border)] [a&]:hover:bg-[var(--brand-card-blue)] [a&]:hover:text-[var(--brand-deep-blue)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

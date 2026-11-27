import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 border-[#0f172a] dark:border-zinc-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000000] px-2.5 py-0.5 text-xs font-bold transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:translate-y-[-1px]",
        secondary: "bg-secondary text-secondary-foreground hover:translate-y-[-1px]",
        destructive: "bg-destructive text-destructive-foreground hover:translate-y-[-1px]",
        outline: "bg-background text-foreground hover:translate-y-[-1px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

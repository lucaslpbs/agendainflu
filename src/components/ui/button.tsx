import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF2D87] text-white hover:bg-[#e0246f] shadow-[0_0_20px_rgba(255,45,135,0.3)] hover:shadow-[0_0_30px_rgba(255,45,135,0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/25",
        secondary:
          "bg-[#7C3AED] text-white hover:bg-[#6d35d4] shadow-[0_0_20px_rgba(124,58,237,0.3)]",
        ghost:
          "hover:bg-white/8 hover:text-white text-white/60",
        link:
          "text-[#FF2D87] underline-offset-4 hover:underline",
        gold:
          "bg-gradient-to-r from-[#FF2D87] to-[#7C3AED] text-white hover:opacity-90 shadow-[0_0_20px_rgba(124,58,237,0.3)] font-semibold",
        hero:
          "gradient-rosa text-white hover:opacity-95 shadow-[0_0_24px_rgba(255,45,135,0.35)] font-semibold text-base hover:shadow-[0_0_36px_rgba(255,45,135,0.5)]",
        "hero-outline":
          "border-2 border-[#FF2D87] bg-transparent text-[#FF2D87] hover:bg-[#FF2D87] hover:text-white font-semibold text-base",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

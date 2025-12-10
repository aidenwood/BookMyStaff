import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange/20 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-cream hover:bg-charcoal/90 shadow-lg",
        destructive: "bg-red-500 text-cream hover:bg-red-500/90 shadow-lg",
        outline: "border-2 border-lightgray bg-transparent hover:bg-lightgray/20 text-charcoal hover:text-charcoal",
        secondary: "bg-lightgray text-charcoal hover:bg-lightgray/80",
        ghost: "hover:bg-lightgray/30 text-charcoal",
        link: "text-charcoal underline-offset-4 hover:underline",
        primary: "bg-orange text-cream hover:bg-orange/90 shadow-lg",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-16 px-10 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
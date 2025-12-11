import { jsx } from 'react/jsx-runtime';
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { createClient } from '@supabase/supabase-js';

function cn(...inputs) {
  return clsx(inputs);
}

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
        primary: "bg-orange text-cream hover:bg-orange/90 shadow-lg"
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-16 px-10 py-4 text-lg",
        icon: "h-12 w-12"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "button",
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

const supabaseUrl = "https://nmksjlhbpcunfsuyjusu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta3NqbGhicGN1bmZzdXlqdXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDI2NDksImV4cCI6MjA4MDkxODY0OX0.MSkMVVyx2rqOcgBNIoM2t0l-PSpK3eyyk6HS1q4KjVg";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export { Button as B, buttonVariants as b, cn as c, supabase as s };

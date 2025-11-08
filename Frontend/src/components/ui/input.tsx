import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, ...props }: React.ComponentProps<"input">, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If the consumer provided an onKeyDown, call it first.
      if (onKeyDown) {
        onKeyDown(e);
        return;
      }

      // Otherwise, prevent the default action for Enter to avoid
      // implicit form submits or navigation reloads in places where
      // no explicit form handling is implemented.
      if (e.key === "Enter") {
        e.preventDefault();
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

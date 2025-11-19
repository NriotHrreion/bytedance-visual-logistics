import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const hintVariants = cva(
  "pl-3 pr-4 py-1 border rounded-full flex justify-between items-center",
  {
    variants: {
      variant: {
        default: "bg-muted",
        success: "bg-green-100 border-0 [&>svg]:stroke-green-800 *:data-[slot=hint-content]:text-green-900",
        destructive: "bg-red-100 border-red-200 [&>svg]:stroke-red-800 *:data-[slot=hint-content]:text-red-900",
      }
    },
    defaultVariants: {
      variant: "default"
    },
  }
);

export function Hint({
  variant,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof hintVariants>) {
  return (
    <div
      data-slot="hint"
      className={hintVariants({ variant, className })}
      {...props}/>
  );
}

export function HintContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="hint-content"
      className={cn(
        "text-xs",
        className
      )}
      {...props}/>
  );
}

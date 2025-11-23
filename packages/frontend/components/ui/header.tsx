import { cn } from "@/lib/utils";

export function Header({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="header"
      className={cn(
        "pt-10 space-y-8",
        className
      )}
      {...props}/>
  );
}

export function HeaderTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="header-title"
      className={cn(
        "text-3xl font-semibold",
        className
      )}
      {...props}/>
  );
}

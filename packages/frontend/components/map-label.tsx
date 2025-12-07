import { cn } from "@/lib/utils";

export function MapLabel({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("w-fit px-2 py-1 text-sm whitespace-nowrap [&>svg]:inline bg-white border rounded-sm shadow-lg select-none", className)}>
      {children}
    </div>
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function Timeline({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline"
      className={cn(
        "flex flex-col gap-6 border-l-2 border-dashed",
        className
      )}
      {...props}/>
  );
}

const timelineItemVariants = cva(
  "pl-4 flex flex-col gap-1 relative",
  {
    variants: {
      variant: {
        default: "",
        secondary: "**:data-[slot=timeline-item-title]:hidden",
        active: "*:data-[slot=timeline-item-header]:before:border-amber-600 *:data-[slot=timeline-item-header]:before:bg-amber-600 **:data-[slot=timeline-item-title]:text-lg **:data-[slot=timeline-item-title]:text-amber-600",
        success: "*:data-[slot=timeline-item-header]:before:border-green-600 *:data-[slot=timeline-item-header]:before:bg-green-600 **:data-[slot=timeline-item-title]:text-lg **:data-[slot=timeline-item-title]:text-green-600",
        destructive: "*:data-[slot=timeline-item-header]:before:border-red-600 *:data-[slot=timeline-item-header]:before:bg-red-600 **:data-[slot=timeline-item-title]:text-lg **:data-[slot=timeline-item-title]:text-red-700",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export function TimelineItem({
  variant,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof timelineItemVariants>) {
  return (
    <div
      data-slot="timeline-item"
      data-variant={variant}
      className={timelineItemVariants({ variant, className })}
      {...props}/>
  );
}

export function TimelineMore({
  className,
  children,
  expanded = false,
  ...props
}: React.ComponentProps<typeof TimelineItemHeader> & {
  expanded?: boolean
}) {
  return (
    <TimelineItemHeader
      className={cn(
        "pl-4 relative text-sm text-muted-foreground cursor-pointer",
        className
      )}
      {...props}>
      {children}
      {
        expanded
        ? <ChevronUp size={18}/>
        : <ChevronDown size={18}/>
      }
    </TimelineItemHeader>
  );
}

export function TimelineItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item-header"
      className={cn(
        "flex items-center gap-2",
        "before:content-[''] before:w-2 before:h-2 before:rounded-full before:border-2 before:bg-white before:border-muted-foreground before:absolute before:left-[-5px]",
        className
      )}
      {...props}/>
  );
}

export function TimelineItemTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="timeline-item-title"
      className={cn(
        "font-semibold",
        className
      )}
      {...props}/>
  );
}

export function TimelineItemTime({
  time,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  time: Date
}) {
  return (
    <span
      data-slot="timeline-item-time"
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      title={time.toTimeString()}
      {...props}>
      {formatDate(time)}
    </span>
  );
}

export function TimelineItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item-content"
      className={cn(
        "text-muted-foreground",
        className
      )}
      {...props}/>
  );
}

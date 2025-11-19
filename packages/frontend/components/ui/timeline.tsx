import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function Timeline({
  reverse = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  reverse?: boolean
}) {
  return (
    <div
      data-slot="timeline"
      className={cn(
        "flex gap-6 border-l-2 border-dashed",
        reverse ? "flex-col-reverse" : "flex-col",
        className
      )}
      {...props}/>
  );
}

export function TimelineItem({
  active = false,
  success = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  active?: boolean
  success?: boolean
}) {
  return (
    <div
      data-slot="timeline-item"
      className={cn(
        "pl-4 flex flex-col gap-1 relative",
        active && "*:data-[slot=timeline-item-header]:before:border-amber-600 *:data-[slot=timeline-item-header]:before:bg-amber-600",
        active && "**:data-[slot=timeline-item-title]:text-lg **:data-[slot=timeline-item-title]:text-amber-600",
        success && "*:data-[slot=timeline-item-header]:before:border-green-600 *:data-[slot=timeline-item-header]:before:bg-green-600",
        success && "**:data-[slot=timeline-item-title]:text-lg **:data-[slot=timeline-item-title]:text-green-600",
        className
      )}
      data-active={active}
      {...props}/>
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
  format: formatStr = "yyyy-MM-dd hh:mm",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  time: Date,
  format?: string
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
      {format(time, formatStr)}
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

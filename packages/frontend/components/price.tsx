import { cn } from "@/lib/utils";

export function Price({
  price,
  className,
  intClassName,
  decClassName
}: {
  price: number
  className?: string
  intClassName?: string
  decClassName?: string
}) {
  const strSplitted = price.toString().split(".");

  return (
    <div className={className}>
      <span className={cn(`text-lg font-semibold before:content-['￥'] before:text-xs before:font-normal`, intClassName)}>
        {strSplitted[0]}
      </span>
      <span className={cn(`font-semibold before:content-['.']`, decClassName)}>
        {strSplitted.length > 1 ? strSplitted[1] : "00"}
      </span>
    </div>
  );
}

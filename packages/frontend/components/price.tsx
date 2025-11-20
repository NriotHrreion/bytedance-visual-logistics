export function Price({
  price,
  className
}: {
  price: number
  className?: string
}) {
  const strSplitted = price.toString().split(".");

  return (
    <div className={className}>
      <span className={`text-lg font-semibold before:content-['￥'] before:text-xs before:font-normal`}>{strSplitted[0]}</span>
      {strSplitted.length === 2 && <span className="font-semibold before:content-['.']">{strSplitted[1]}</span>}
    </div>
  );
}

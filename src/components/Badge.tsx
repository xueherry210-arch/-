import { cn } from "@/lib/utils";

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        color,
        className
      )}
    >
      {children}
    </span>
  );
}

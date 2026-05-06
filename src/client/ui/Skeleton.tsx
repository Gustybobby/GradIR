import { cn } from "@/client/ui/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-input ", className)}
      {...props}
    />
  );
}

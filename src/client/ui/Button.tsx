import { cn } from "@/client/ui/utils";

export function Button({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "bg-input hover:bg-border border border-border rounded-md transition-colors",
        "disabled:bg-input disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

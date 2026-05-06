import { cn } from "@/client/ui/utils";
import { Loader2Icon } from "lucide-react";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-6 animate-spin", className)}
      {...props}
    />
  );
}

import { cn } from "@/client/ui/utils";
import React from "react";

export function PrimaryHeading({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "w-fit text-xl md:text-2xl tracking-tight text-balance font-bold",
        className,
      )}
      {...props}
    />
  );
}

export function SecondaryHeading({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("md:text-lg tracking-tight", className)} {...props} />
  );
}

export function TertiaryHeading({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("md:text-lg font-semibold", className)} {...props} />
  );
}

export function Paragraph({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm md:text-base", className)} {...props} />;
}

export function ParagraphCaption({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("text-xs md:text-sm", className)} {...props} />;
}

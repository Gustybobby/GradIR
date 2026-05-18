import { cn } from "@/client/ui/utils";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { CheckIcon } from "lucide-react";

export const Combobox = ComboboxPrimitive.Root;

export function ComboboxInput({ ...props }: ComboboxPrimitive.Input.Props) {
  return <ComboboxPrimitive.Input {...props} />;
}

export function ComboboxContent({
  className,
  sideOffset = 6,
  alignOffset = 0,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, "sideOffset" | "alignOffset">) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side="bottom"
        sideOffset={sideOffset}
        align="start"
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width)",
            "min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) bg-card text-popover-foreground",
            "rounded-lg shadow-md ring-1 ring-border duration-50 slide-in-from-top-2 data-open:animate-in data-open:fade-in-0",
            "overflow-hidden data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))]",
        "scroll-py-1 overflow-y-auto overscroll-contain p-1",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none",
        "data-highlighted:bg-card-header",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            <CheckIcon className="pointer-events-none" />
          </span>
        }
      />
    </ComboboxPrimitive.Item>
  );
}

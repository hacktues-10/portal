import React from "react";
import { Button, ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { FaDiscord } from "react-icons/fa6";
import { LuMoreHorizontal } from "react-icons/lu";

export const DiscordButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    isLoading?: boolean;
  }
>(({ isLoading, disabled, className, size, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn("bg-blue-500 text-white hover:bg-blue-500/90", className)}
      size={size || "lg"}
      {...props}
    >
      {!props.asChild ? (
        <>
          <DiscordButtonIcon isLoading={isLoading} />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
});

DiscordButton.displayName = "DiscordButton";

export function DiscordButtonIcon({ isLoading }: { isLoading?: boolean }) {
  return !isLoading ? (
    <FaDiscord className="mr-2 h-5 w-5" />
  ) : (
    <LuMoreHorizontal className="mr-2 h-5 w-5 animate-pulse" />
  );
}

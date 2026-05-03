import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <div className="relative w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-7 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-[var(--main-color)] transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>

    
     {(value || 0) > 2 && <img src="/walking.gif" style={{ left: `${(value || 0) - 4}%` }} className=" absolute -translate-y-1/2 top-1/2 size-8 rounded-md object-cover ps-1" />}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

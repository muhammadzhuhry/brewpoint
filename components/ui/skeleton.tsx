import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,#ECEBE7_25%,#F6F5F2_37%,#ECEBE7_63%)] bg-size-[680px_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

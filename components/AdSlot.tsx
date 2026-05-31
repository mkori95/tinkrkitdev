interface AdSlotProps {
  variant?: "sidebar" | "below-output";
  className?: string;
}

export function AdSlot({ variant = "below-output", className = "" }: AdSlotProps) {
  const dimensions: Record<NonNullable<AdSlotProps["variant"]>, string> = {
    sidebar: "w-[300px] h-[600px]",
    "below-output": "w-full h-[100px]",
  };

  return (
    <div className={`${dimensions[variant]} ${className}`} aria-hidden="true">
      {/* AdSense slot — pending approval */}
    </div>
  );
}

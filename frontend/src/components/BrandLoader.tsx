import { cn } from "@/lib/utils";

const BrandLoader = ({ size = "md", className }: { size?: "sm" | "md"; className?: string }) => (
  <span
    className={cn("relative grid place-items-center", size === "sm" ? "h-10 w-10" : "h-[72px] w-[72px]", className)}
    role="status"
    aria-label="AGRIMIKA"
  >
    <span
      className="absolute inset-0 animate-spin rounded-full border-2 border-[#0b7a43]/15 border-t-[#0b7a43]"
      aria-hidden="true"
    />
    <img src="/brand/mark-color.png" alt="" className={size === "sm" ? "h-6 w-auto" : "h-10 w-auto"} />
  </span>
);

export default BrandLoader;

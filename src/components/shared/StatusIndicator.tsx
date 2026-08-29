import { cn } from "@/lib/utils";

export type FaceStatus = "none" | "tilted" | "aligned";

const config: Record<FaceStatus, { dot: string; text: string }> = {
  none: { dot: "bg-destructive", text: "No face detected — look at the camera" },
  tilted: { dot: "bg-warning", text: "Almost — keep your head straight" },
  aligned: { dot: "bg-success", text: "Face aligned — ready to verify" },
};

/** Live camera-alignment feedback: colour dot plus a text label. */
export function StatusIndicator({
  status,
  className,
}: {
  status: FaceStatus;
  className?: string;
}) {
  const { dot, text } = config[status];
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-3 rounded-full transition-colors", dot)}
      />
      {text}
    </p>
  );
}

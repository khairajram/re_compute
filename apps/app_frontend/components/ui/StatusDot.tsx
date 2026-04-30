interface StatusDotProps {
  status: "online" | "offline" | "busy" | "running" | "stopped" | "error" | "starting";
  className?: string;
}

const statusColors: Record<string, string> = {
  online: "bg-success",
  running: "bg-success",
  starting: "bg-warning",
  busy: "bg-warning",
  offline: "bg-muted-foreground",
  stopped: "bg-muted-foreground",
  error: "bg-destructive",
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className="relative flex h-2 w-2">
      {(status === "online" || status === "running") && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${statusColors[status]}`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${statusColors[status]}`} />
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  MS: "bg-green-500/20 text-green-700 border-green-500/30",
  TMS: "bg-red-500/20 text-red-700 border-red-500/30",
  OP: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  "N/A": "bg-gray-500/20 text-gray-500 border-gray-500/30",
  Release: "bg-green-500/20 text-green-700 border-green-500/30",
  Reject: "bg-red-500/20 text-red-700 border-red-500/30",
  Done: "bg-green-500/20 text-green-700 border-green-500/30",
  Drop: "bg-red-500/20 text-red-700 border-red-500/30",
  "On Progress": "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
};

export function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <Badge className={cn("text-xs font-medium", STATUS_COLORS[value] ?? "")}>
      {value}
    </Badge>
  );
}

export function StatusSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      <option value="">-- Pilih --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

export const RESULT_OPTIONS = ["MS", "TMS", "OP", "N/A"];
export const STATUS_OPTIONS = ["Release", "Reject", "OP", "N/A"];
export const PROJECT_STATUS_OPTIONS = ["Done", "Drop", "On Progress"];

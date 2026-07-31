import { EmailStatus } from "@/types";

interface BadgeProps {
  status: EmailStatus;
}

const statusConfig: Record<EmailStatus, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-yellow-100 text-yellow-800",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800",
  },
  sent: {
    label: "Sent",
    className: "bg-green-100 text-green-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
  },
};

export default function Badge({ status }: BadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

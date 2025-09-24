import { TransactionResponseDTO } from "@/types/transaction.dto";
import { Icon as IconifyIcon } from "@iconify/react";
import dayjs from "dayjs";

export type TransactionListProps = {
  title: string;
  subtitle: string;
  icon: string;
  iconClass?: string;
  items: TransactionResponseDTO[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export const TransactionList = ({
  title,
  subtitle,
  icon,
  iconClass,
  items,
  loading,
  page,
  totalPages,
  onPrev,
  onNext,
}: TransactionListProps) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-[2px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#111] text-white">
        <div className="flex items-center gap-2">
          <IconifyIcon icon={icon} className={`w-5 h-5 ${iconClass || ""}`} />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs opacity-80">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={page <= 1}
            className="px-2 py-1 text-xs rounded bg-rose-100 text-rose-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs">
            Page {page} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={onNext}
            disabled={page >= totalPages}
            className="px-2 py-1 text-xs rounded bg-rose-100 text-rose-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-neutral-100">
        {loading && (
          <div className="p-4 text-center text-rose-500 animate-pulse">
            Loading...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-6 text-center text-neutral-500">No transactions</div>
        )}

        {!loading &&
          items.length > 0 &&
          items.map((t) => (
            <div
              key={t._id}
              className="p-4 hover:bg-rose-50/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#111]">
                    {t.serviceName || "Service"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {t.customerName || "Customer"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-600">
                    {(t.amount ?? 0).toLocaleString()} ₫
                  </div>
                  <div className="text-xs text-neutral-500">
                    {t.bookingTime } {t.bookingDay ? `on ${dayjs(t.bookingDay).format("DD/MM/YYYY")}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
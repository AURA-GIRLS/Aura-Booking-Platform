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
    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-white to-rose-50/30 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-rose-200 bg-gradient-to-r from-rose-50 via-rose-100 to-rose-200/80 text-rose-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/80 rounded-lg shadow-sm">
            <IconifyIcon icon={icon} className={`w-5 h-5 ${iconClass || "text-rose-700"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-rose-800">{title}</h3>
            <p className="text-xs text-rose-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={page <= 1}
            className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-rose-600 px-2 font-medium">
            {page} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={onNext}
            disabled={page >= totalPages}
            className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-rose-100">
        {loading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-2 text-rose-600">
              <IconifyIcon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading transactions...</span>
            </div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <IconifyIcon icon="lucide:inbox" className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700">No transactions found</p>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          </div>
        )}

        {!loading &&
          items.length > 0 &&
          items.map((t, index) => (
            <div
              key={t._id}
              className="p-4 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">
                    {t.serviceName || "Service"}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <IconifyIcon icon="lucide:user" className="w-3 h-3" />
                    <span>{t.customerName || "Customer"}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-lg text-rose-700">
                    {(t.amount ?? 0).toLocaleString()} ₫
                  </div>
                  <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
                    <IconifyIcon icon="lucide:clock" className="w-3 h-3" />
                    <span>
                      {t.bookingTime} {t.bookingDate ? `on ${dayjs(t.bookingDate).format("DD/MM/YYYY")}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
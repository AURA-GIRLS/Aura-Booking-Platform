"use client";

import type { TransactionResponseDTO } from "@/types/transaction.dto";
import { TransactionList } from "./TransactionList";

interface WalletTransactionsProps {
  captured: {
    items: TransactionResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
  };
  hold: {
    items: TransactionResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
  };
  onLoadTransactions: (status: "CAPTURED" | "HOLD", page: number) => void;
}

export const WalletTransactions = ({
  captured,
  hold,
  onLoadTransactions,
}: WalletTransactionsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TransactionList
        title="Captured Transactions"
        subtitle="Successfully processed and added to wallet"
        icon="lucide:check-circle2"
        iconClass="text-emerald-600"
        items={captured.items}
        loading={captured.loading}
        page={captured.page}
        totalPages={captured.totalPages}
        onPrev={() => onLoadTransactions("CAPTURED", Math.max(1, captured.page - 1))}
        onNext={() => onLoadTransactions("CAPTURED", captured.page + 1)}
      />

      <TransactionList
        title="Hold Transactions"
        subtitle="Temporarily held pending verification"
        icon="lucide:hourglass"
        iconClass="text-amber-600"
        items={hold.items}
        loading={hold.loading}
        page={hold.page}
        totalPages={hold.totalPages}
        onPrev={() => onLoadTransactions("HOLD", Math.max(1, hold.page - 1))}
        onNext={() => onLoadTransactions("HOLD", hold.page + 1)}
      />
    </div>
  );
};
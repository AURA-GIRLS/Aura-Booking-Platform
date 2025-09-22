"use client";
import { useEffect, useState } from "react";
import { TransactionService } from "@/services/transaction";
import type {
  TransactionResponseDTO,
  WalletResponseDTO,
} from "@/types/transaction.dto";
import { Icon } from "@iconify/react";
import { TransactionList } from "./TransactionList";

type SectionState = {
  items: TransactionResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
};

interface WalletBoardProps {
  muaId: string;
}

export const WalletBoard = ({ muaId }: WalletBoardProps) => {
  const [wallet, setWallet] = useState<WalletResponseDTO | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [captured, setCaptured] = useState<SectionState>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
  });
  const [hold, setHold] = useState<SectionState>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
  });

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("currentUser");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Failed to parse currentUser from localStorage", e);
      }
    }
  }, []);

  const pageSize = 5;

  const loadWallet = async () => {
    setLoadingWallet(true);
    try {
      const res = await TransactionService.getWalletByMuaId(muaId);
      if (res.success && res.data) setWallet(res.data);
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadTransactions = async (status: "CAPTURED" | "HOLD", page: number) => {
    const setState = status === "CAPTURED" ? setCaptured : setHold;
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await TransactionService.getTransactionsByMuaId(muaId, {
        page,
        pageSize,
        status,
      });
      if (res.success && res.data) {
        setState({
          items: res.data.transactions ?? [],
          total: res.data.total,
          page: res.data.page,
          totalPages: res.data.totalPages,
          loading: false,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    if (!muaId) return;
    void loadWallet();
  }, [muaId]);

  useEffect(() => {
    if (!muaId) return;
    void loadTransactions("CAPTURED", 1);
    void loadTransactions("HOLD", 1);
  }, [muaId]);

  const formatMoney = (n: number) => (n ?? 0).toLocaleString();

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6 py-6">
      {/* Wallet summary */}
      <div className="rounded-xl border border-rose-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-[2px]">
        <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Icon icon="lucide:wallet" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-[#111]">
                Wallet Balance
              </h2>
              <p className="text-xs text-rose-500">Available balance (CAPTURED)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#111]">
              {loadingWallet ? (
                <span className="animate-pulse text-rose-400">•••</span>
              ) : (
                `${formatMoney(wallet?.balance || 0)} ₫`
              )}
            </div>
            <div className="text-xs text-neutral-500">
              Currency: {wallet?.currency || "VND"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-4 bg-white">
            <div className="text-xs text-neutral-500">Captured count</div>
            <div className="text-lg font-semibold text-[#111]">
              {captured.total}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 bg-white">
            <div className="text-xs text-neutral-500">Hold count</div>
            <div className="text-lg font-semibold text-[#111]">
              {hold.total}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 bg-white">
            <div className="text-xs text-neutral-500">Owner</div>
            {user && (
              <div className="text-lg font-semibold text-rose-600">
                MUA - {user.fullName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TransactionList
          title="Captured"
          subtitle="Added to wallet"
          icon="lucide:check-circle2"
          iconClass="text-green-600"
          items={captured.items}
          loading={captured.loading}
          page={captured.page}
          totalPages={captured.totalPages}
          onPrev={() =>
            loadTransactions("CAPTURED", Math.max(1, captured.page - 1))
          }
          onNext={() => loadTransactions("CAPTURED", captured.page + 1)}
        />

        <TransactionList
          title="On Hold"
          subtitle="Temporarily held"
          icon="lucide:hourglass"
          iconClass="text-rose-600"
          items={hold.items}
          loading={hold.loading}
          page={hold.page}
          totalPages={hold.totalPages}
          onPrev={() => loadTransactions("HOLD", Math.max(1, hold.page - 1))}
          onNext={() => loadTransactions("HOLD", hold.page + 1)}
        />
      </div>
    </div>
  );
};

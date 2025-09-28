"use client";
import { useEffect, useState } from "react";
import { TransactionService } from "@/services/transaction";
import { ProfileBankAccountService } from "@/services/profile.bankaccount";
import type {
  TransactionResponseDTO,
  WalletResponseDTO,
  WithdrawResponseDTO,
} from "@/types/transaction.dto";
import type { BankAccountResponseDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";
import { Icon } from "@iconify/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/lib/ui/tabs";
import PayoutConfirmDialog from "@/components/generalUI/PayoutConfirmDialog";
import NotificationDialog from "@/components/generalUI/NotificationDialog";
// Import modular components
import { WalletOverview } from "./WalletOverview";
import { BankAccountManager } from "./BankAccountManager";
import { PayoutSection } from "./PayoutSection";
import { WalletTransactions } from "./WalletTransactions";

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
  
  // Tab state for controlling active tab
  const [activeTab, setActiveTab] = useState<string>("wallet");
  
  // Bank account states
  const [bankAccount, setBankAccount] = useState<BankAccountResponseDTO | null>(null);
  const [loadingBankAccount, setLoadingBankAccount] = useState(false);
  const [bankAccountForm, setBankAccountForm] = useState<UpdateBankAccountDTO>({
    accountNumber: "",
    accountName: "",
    bankName: "",
    bankCode: "",
    bankBin: "",
    swiftCode: "",
    bankLogo: ""
  });

  
  // Payout states
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  }>({
    open: false,
    type: "success",
    title: "",
    description: "",
  });

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

  // Withdrawal states
  const [withdrawals, setWithdrawals] = useState<{
    items: WithdrawResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
  }>({
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

  const loadBankAccount = async () => {
    setLoadingBankAccount(true);
    try {
      const res = await ProfileBankAccountService.getBankAccount();
      if (res.success && res.data) {
        setBankAccount(res.data);
        setBankAccountForm({
          accountNumber: res.data.accountNumber,
          accountName: res.data.accountName,
          bankName: res.data.bankName,
          bankCode: res.data.bankCode,
          bankBin: res.data.bankBin,
          swiftCode: res.data.swiftCode || "",
          bankLogo: res.data.bankLogo || ""
        });
      }
    } catch (error) {
      console.error("Failed to load bank account", error);
    } finally {
      setLoadingBankAccount(false);
    }
  };

  const handleSaveBankAccount = async (data: UpdateBankAccountDTO) => {
    setLoadingBankAccount(true);
    try {
      console.log("bankAccountData", data);
      const res = bankAccount 
        ? await ProfileBankAccountService.updateBankAccount(data)
        : await ProfileBankAccountService.createBankAccount(data);
      
      if (res.success && res.data) {
        setBankAccount(res.data);
        // Update the form state with the new data
        setBankAccountForm({
          accountNumber: res.data.accountNumber,
          accountName: res.data.accountName,
          bankName: res.data.bankName,
          bankCode: res.data.bankCode,
          bankBin: res.data.bankBin,
          swiftCode: res.data.swiftCode || "",
          bankLogo: res.data.bankLogo || ""
        });
        showNotification("success", "Bank Account Saved", "Your bank account has been successfully updated.");
      }
    } catch (error) {
      console.error("Failed to save bank account", error);
      showNotification("error", "Save Failed", "An error occurred while saving your bank account.");
    } finally {
      setLoadingBankAccount(false);
    }
  };

  const handleDeleteBankAccount = async () => {
    setLoadingBankAccount(true);
    try {
      const res = await ProfileBankAccountService.deleteBankAccount();
      if (res.success) {
        setBankAccount(null);
        setBankAccountForm({
          accountNumber: "",
          accountName: "",
          bankName: "",
          bankCode: "",
          bankBin: "",
          swiftCode: "",
        });
        showNotification("success", "Bank Account Deleted", "Your bank account has been successfully removed.");
      }
    } catch (error) {
      console.error("Failed to delete bank account", error);
      showNotification("error", "Delete Failed", "An error occurred while deleting your bank account.");
    } finally {
      setLoadingBankAccount(false);
    }
  };

  const showNotification = (type: "success" | "error" | "warning" | "info", title: string, description: string) => {
    setNotification({
      open: true,
      type,
      title,
      description,
    });
  };

  const handlePayoutClick = () => {
    if (!bankAccount || !wallet || wallet.balance <= 0) return;
    setShowPayoutConfirm(true);
  };

  const handlePayoutConfirm = async () => {
    if (!bankAccount || !wallet || wallet.balance <= 0) return;
    
    setPayoutLoading(true);
    try {
      const res = await TransactionService.makeWithdrawal(muaId);
      if (res.success) {
        // Close confirm dialog
        setShowPayoutConfirm(false);
        
        // Show success notification
        showNotification(
          "success",
          "Payout Successful!",
          `${formatMoney(wallet.balance)} ₫ has been transferred to your bank account successfully.`
        );
        
        // Reload wallet to get updated balance
        await loadWallet();
        // Reload transactions
        await loadTransactions("CAPTURED", 1);
        await loadTransactions("HOLD", 1);
        // Reload withdrawals
        await loadWithdrawals(1);
      } else {
        // Close confirm dialog
        setShowPayoutConfirm(false);
        
        // Show error notification
        showNotification(
          "error",
          "Payout Failed",
          res.message || "An error occurred while processing your payout. Please try again."
        );
      }
    } catch (error) {
      console.error("Failed to make payout", error);
      
      // Close confirm dialog
      setShowPayoutConfirm(false);
      
      // Show error notification
      showNotification(
        "error",
        "Payout Failed",
        "An unexpected error occurred. Please check your connection and try again."
      );
    } finally {
      setPayoutLoading(false);
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
        console.log("Loaded transactions", status, res.data);
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

  const loadWithdrawals = async (page: number) => {
    setWithdrawals((s) => ({ ...s, loading: true }));
    try {
      const res = await TransactionService.getWithdrawalsByMuaId(muaId, {
        page,
        pageSize,
      });
      if (res.success && res.data) {
        console.log("Loaded withdrawals", res.data);
        setWithdrawals({
          items: res.data.withdrawals ?? [],
          total: res.data.total,
          page: res.data.page,
          totalPages: res.data.totalPages,
          loading: false,
        });
      } else {
        setWithdrawals((s) => ({ ...s, loading: false }));
      }
    } catch (e) {
      console.error("Failed to load withdrawals", e);
      setWithdrawals((s) => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    if (!muaId) return;
    void loadWallet();
    void loadBankAccount();
  }, [muaId]);

  useEffect(() => {
    if (!muaId) return;
    void loadTransactions("CAPTURED", 1);
    void loadTransactions("HOLD", 1);
    void loadWithdrawals(1);
  }, [muaId]);

  const formatMoney = (n: number) => (n ?? 0).toLocaleString();

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6 py-6 bg-gradient-to-br from-rose-50/30 to-white min-h-screen">
      {/* Wallet Overview */}
      <WalletOverview
        wallet={wallet}
        loadingWallet={loadingWallet}
        capturedTotal={captured.total}
        holdTotal={hold.total}
        bankAccount={bankAccount}
        user={user}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-rose-200 shadow-sm">
          <TabsTrigger 
            value="wallet" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
          >
            <Icon icon="lucide:wallet" className="w-4 h-4" />
            <span>Wallet & Transactions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bank" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
          >
            <Icon icon="lucide:building-2" className="w-4 h-4" />
            <span>Bank Account</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payout" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
          >
            <Icon icon="lucide:banknote" className="w-4 h-4" />
            <span>Payout</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-6 mt-6">
          <WalletTransactions
            captured={captured}
            hold={hold}
            onLoadTransactions={loadTransactions}
          />
        </TabsContent>

        <TabsContent value="bank" className="space-y-6 mt-6">
          <BankAccountManager
            bankAccount={bankAccount}
            loadingBankAccount={loadingBankAccount}
            onSave={handleSaveBankAccount}
            onDelete={handleDeleteBankAccount}
          />
        </TabsContent>

        <TabsContent value="payout" className="space-y-6 mt-6">
          <PayoutSection
            wallet={wallet}
            bankAccount={bankAccount}
            payoutLoading={payoutLoading}
            withdrawals={withdrawals}
            onPayoutClick={handlePayoutClick}
            onSwitchToBankTab={() => setActiveTab("bank")}
            onLoadWithdrawals={loadWithdrawals}
          />
        </TabsContent>
      </Tabs>

      {/* Payout Confirmation Dialog */}
      {bankAccount && wallet && (
        <PayoutConfirmDialog
          open={showPayoutConfirm}
          onOpenChange={setShowPayoutConfirm}
          onConfirm={handlePayoutConfirm}
          amount={wallet.balance || 0}
          bankAccount={bankAccount}
          loading={payoutLoading}
        />
      )}

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification(prev => ({ ...prev, open }))}
        type={notification.type}
        title={notification.title}
        description={notification.description}
      />
    </div>
  );
};

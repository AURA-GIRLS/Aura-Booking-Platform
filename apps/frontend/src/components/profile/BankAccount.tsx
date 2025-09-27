"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CreditCard, Building, Hash, User, Code, Zap } from "lucide-react";
import { BankAccountResponseDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";
import { authService } from "@/services/auth";
import Notification from "@/components/generalUI/Notification";
import DeleteConfirmDialog from "../generalUI/DeleteConfirmDialog";
import ProfileBankAccountService from "@/services/profile.bankaccount";
import BankAccountModal from "./BankAccountModal";

interface NotificationState {
  type: "success" | "error";
  message: string;
  isVisible: boolean;
}

const BankAccount: React.FC = () => {
  const [bankAccount, setBankAccount] = useState<BankAccountResponseDTO | null|undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveBookings, setHasActiveBookings] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    type: "success",
    message: "",
    isVisible: false
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load bank account and check active bookings
  useEffect(() => {
    loadBankAccount();
    checkActiveBookings();
  }, []);

  const loadBankAccount = async () => {
    try {
      setIsLoading(true);
      const response = await ProfileBankAccountService.getBankAccount();
      if (response.success) {
        setBankAccount(response.data);
      }
    } catch (error: any) {
      // Don't show error if no bank account exists
      if (!error.message?.includes('not found')) {
        showNotification("error", error.message || "Failed to load bank account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveBookings = async () => {
    try {
      const response = await authService.getBookingHistory();
      if (response.success && response.data) {
        const activeBookings = response.data.filter(
          (booking: any) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
        );
        setHasActiveBookings(activeBookings.length > 0);
      }
    } catch (error) {
      // Silent fail for booking check
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleCreateOrUpdate = async (data: UpdateBankAccountDTO) => {
    try {
      setIsLoading(true);
      let response;
      
      if (bankAccount) {
        response = await ProfileBankAccountService.updateBankAccount(data);
        showNotification("success", "Bank account updated successfully!");
      } else {
        response = await ProfileBankAccountService.createBankAccount(data);
        showNotification("success", "Bank account created successfully!");
      }
      
      if (response.success) {
        setBankAccount(response.data);
        setModalOpen(false);
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to save bank account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await ProfileBankAccountService.deleteBankAccount();
      
      if (response.success) {
        setBankAccount(null);
        showNotification("success", "Bank account deleted successfully!");
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to delete bank account");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const openEditModal = () => {
    setIsEditing(true);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (hasActiveBookings) {
      showNotification("error", "Cannot delete bank account while you have pending or confirmed bookings");
      return;
    }
    setDeleteDialogOpen(true);
  };

  if (isLoading && !bankAccount) {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <BankAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateOrUpdate}
        initialData={isEditing ? bankAccount : null}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        description="Are you sure you want to delete your bank account? This action cannot be undone and you won't be able to receive payments."
        confirmText="Delete Account"
        cancelText="Keep Account"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Bank Account</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your bank account for receiving payments
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Bank Account Content */}
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          {!bankAccount ? (
            // No Bank Account State
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600 mx-auto mb-4">
                <CreditCard size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Bank Account Added
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your bank account information to receive payments from completed bookings.
              </p>
              <button
                onClick={openCreateModal}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                <Plus size={16} />
                Add Bank Account
              </button>
            </div>
          ) : (
            // Bank Account Details
            <div>
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <div className="flex gap-2">
                  <button
                    onClick={openEditModal}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50 disabled:opacity-50"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isLoading || hasActiveBookings}
                    title={hasActiveBookings ? "Cannot delete while you have active bookings" : "Delete bank account"}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Bank Account Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <User size={18} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Account Name</div>
                    <div className="font-medium text-gray-900">{bankAccount.accountName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Hash size={18} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Account Number</div>
                    <div className="font-medium text-gray-900 font-mono">{bankAccount.accountNumber}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Building size={18} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Bank Name</div>
                    <div className="font-medium text-gray-900">{bankAccount.bankName}</div>
                  </div>
                </div>
              </div>                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Code size={18} className="text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Bank Code</div>
                      <div className="font-medium text-gray-900 font-mono">{bankAccount.bankCode}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Zap size={18} className="text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Bank BIN</div>
                      <div className="font-medium text-gray-900 font-mono">{bankAccount.bankBin}</div>
                    </div>
                  </div>

                  {bankAccount.swiftCode && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-50/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                        <Code size={18} className="text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Swift Code</div>
                        <div className="font-medium text-gray-900 font-mono">{bankAccount.swiftCode}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {hasActiveBookings && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Zap size={16} />
                    <span className="text-sm font-medium">Active Bookings</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    You have active bookings. Bank account cannot be deleted while bookings are pending or confirmed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BankAccount;

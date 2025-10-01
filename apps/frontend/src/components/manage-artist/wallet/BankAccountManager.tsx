"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lib/ui/card";
import { Button } from "@/components/lib/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/lib/ui/dropdown-menu";
import type { BankAccountResponseDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";
import DeleteConfirmDialog from "@/components/generalUI/DeleteConfirmDialog";
import BankAccountModal from "@/components/profile/BankAccountModal";

interface BankAccountManagerProps {
  bankAccount: BankAccountResponseDTO | null;
  loadingBankAccount: boolean;
  onSave: (data: UpdateBankAccountDTO) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const BankAccountManager = ({
  bankAccount,
  loadingBankAccount,
  onSave,
  onDelete,
}: BankAccountManagerProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data: UpdateBankAccountDTO) => {
    await onSave(data);
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogOpen(false);
  };

  const openEditModal = () => {
    setIsEditing(true);
    setEditDialogOpen(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditDialogOpen(true);
  };

  if (loadingBankAccount) {
    return (
      <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-100 via-rose-200 to-pink-50 text-pink-800 rounded-t-lg border-b border-pink-200">
          <CardTitle className="flex items-center space-x-2">
            <Icon icon="lucide:building-2" className="w-5 h-5 text-pink-700" />
            <span>Bank Account Management</span>
          </CardTitle>
          <CardDescription className="text-pink-600">
            {bankAccount ? "Manage your registered bank accounts" : "Add a bank account to receive payouts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {bankAccount ? (
            <div className="space-y-4">
              {/* Bank Account Card - Fit to content width */}
              <div className="inline-block">
                <div className="relative p-6 bg-gradient-to-r from-white to-pink-50 border border-pink-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {/* More Options - Top Right Corner */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-pink-100">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="right" className="w-48 bg-white">
                        <DropdownMenuItem onClick={openEditModal} className="space-x-2 focus:bg-pink-100 cursor-pointer">
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                          <span>Edit Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialogOpen(true)} 
                          className="space-x-2 text-red-600 focus:text-red-600 focus:bg-pink-100 cursor-pointer"
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          <span>Delete Account</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Card Content */}
                  <div className="flex items-center space-x-4 pr-12">
                    <div className="p-3 bg-pink-100 rounded-full">
                      {bankAccount.bankLogo ? (
                        <img 
                          src={bankAccount.bankLogo} 
                          alt={bankAccount.bankName}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Icon icon="lucide:credit-card" className="w-6 h-6 text-pink-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-gray-900">{bankAccount.accountName}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="font-medium">{bankAccount.bankName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono">****{bankAccount.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Active Account</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Feature Notice */}
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon icon="lucide:info" className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-pink-800">Multiple Bank Accounts</p>
                    <p className="text-xs text-pink-600 mt-1">
                      The ability to add and manage multiple bank accounts will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Icon icon="lucide:building-2" className="w-8 h-8 text-pink-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">No Bank Account</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Add your bank account information to start receiving payouts from your wallet.
                </p>
              </div>
              <Button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white space-x-2"
                size="lg"
              >
                <Icon icon="lucide:plus" className="w-5 h-5" />
                <span>Add Bank Account</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Modal */}
      <BankAccountModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleSave}
        initialData={isEditing ? bankAccount : null}
        isLoading={loadingBankAccount}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        description="Are you sure you want to delete this bank account? This action cannot be undone and you will need to re-enter your bank details for future payouts."
        confirmText="Delete Account"
        cancelText="Keep Account"
      />
    </div>
  );
};
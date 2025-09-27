"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lib/ui/card";
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";
import { Separator } from "@/components/lib/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/lib/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/lib/ui/dropdown-menu";
import type { BankAccountResponseDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";
import DeleteConfirmDialog from "@/components/generalUI/DeleteConfirmDialog";

interface BankAccountManagerProps {
  bankAccount: BankAccountResponseDTO | null;
  loadingBankAccount: boolean;
  bankAccountForm: UpdateBankAccountDTO;
  setBankAccountForm: (form: UpdateBankAccountDTO | ((prev: UpdateBankAccountDTO) => UpdateBankAccountDTO)) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const BankAccountManager = ({
  bankAccount,
  loadingBankAccount,
  bankAccountForm,
  setBankAccountForm,
  onSave,
  onDelete,
}: BankAccountManagerProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = async () => {
    await onSave();
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogOpen(false);
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
                        <DropdownMenuItem onClick={() => setEditDialogOpen(true)} className="space-x-2 focus:bg-pink-100 cursor-pointer">
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
                      <Icon icon="lucide:credit-card" className="w-6 h-6 text-pink-600" />
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
                onClick={() => setEditDialogOpen(true)}
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

      {/* Edit/Add Bank Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Icon icon="lucide:building-2" className="w-5 h-5 text-rose-600" />
              <span>{bankAccount ? "Edit Bank Account" : "Add Bank Account"}</span>
            </DialogTitle>
            <DialogDescription>
              Enter your bank account details to receive payouts securely.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-rose-700 font-medium">Account Holder Name</Label>
                <Input
                  id="accountName"
                  value={bankAccountForm.accountName}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Enter full name as on bank account"
                  className="border-rose-200 focus:border-rose-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-rose-700 font-medium">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankAccountForm.bankName}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Enter bank name"
                  className="border-rose-200 focus:border-rose-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-rose-700 font-medium">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={bankAccountForm.accountNumber}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Enter account number"
                  className="border-rose-200 focus:border-rose-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankCode" className="text-rose-700 font-medium">Bank Code</Label>
                <Input
                  id="bankCode"
                  value={bankAccountForm.bankCode}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, bankCode: e.target.value }))}
                  placeholder="Enter bank code"
                  className="border-rose-200 focus:border-rose-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBin" className="text-rose-700 font-medium">Bank BIN</Label>
                <Input
                  id="bankBin"
                  value={bankAccountForm.bankBin}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, bankBin: e.target.value }))}
                  placeholder="Enter bank BIN"
                  className="border-rose-200 focus:border-rose-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftCode" className="text-rose-700 font-medium">SWIFT Code (Optional)</Label>
                <Input
                  id="swiftCode"
                  value={bankAccountForm.swiftCode}
                  onChange={(e) => setBankAccountForm(prev => ({ ...prev, swiftCode: e.target.value }))}
                  placeholder="Enter SWIFT code (if applicable)"
                  className="border-rose-200 focus:border-rose-500"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loadingBankAccount}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white space-x-2"
              >
                {loadingBankAccount ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:save" className="w-4 h-4" />
                )}
                <span>{bankAccount ? "Update Account" : "Save Account"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
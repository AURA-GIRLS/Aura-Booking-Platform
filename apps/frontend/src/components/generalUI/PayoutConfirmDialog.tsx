"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import type { BankAccountResponseDTO } from "@/types/bankaccount.dtos";

interface PayoutConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    amount: number;
    bankAccount: BankAccountResponseDTO;
    loading?: boolean;
}

export default function PayoutConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    amount,
    bankAccount,
    loading = false,
}: PayoutConfirmDialogProps) {
    const formatMoney = (n: number) => (n ?? 0).toLocaleString();

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Icon icon="lucide:banknote" className="w-5 h-5 text-green-600" />
                        </div>
                        <DialogTitle>Confirm Payout</DialogTitle>
                    </div>
                    <DialogDescription>
                        Please confirm the withdrawal details below.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                    {/* Amount */}
                    <div className="p-4 border rounded-lg bg-green-50/50">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Withdrawal Amount</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatMoney(amount)} ₫
                            </p>
                        </div>
                    </div>

                    {/* Bank Account Details */}
                    <div className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                            Transfer to Bank Account
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Bank:</span>
                                <span className="text-sm font-medium">{bankAccount.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Account Name:</span>
                                <span className="text-sm font-medium">{bankAccount.accountName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Account Number:</span>
                                <span className="text-sm font-mono">
                                    ****{bankAccount.accountNumber.slice(-4)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Icon icon="lucide:alert-triangle" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-700">
                            <strong>Note:</strong> This action cannot be undone. Funds will be transferred to your registered bank account.
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 space-x-2"
                    >
                        {loading ? (
                            <>
                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Icon icon="lucide:banknote" className="w-4 h-4" />
                                <span>Confirm Payout</span>
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
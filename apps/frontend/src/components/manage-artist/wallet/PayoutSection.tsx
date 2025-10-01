"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/lib/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lib/ui/card";
import { Badge } from "@/components/lib/ui/badge";
import { Separator } from "@/components/lib/ui/separator";
import type { WalletResponseDTO, WithdrawResponseDTO } from "@/types/transaction.dto";
import type { BankAccountResponseDTO } from "@/types/bankaccount.dtos";
import { WithdrawalList } from "./WithdrawalList";
import { WITHDRAW_STATUS } from "@/constants/index";

interface PayoutSectionProps {
  wallet: WalletResponseDTO | null;
  bankAccount: BankAccountResponseDTO | null;
  payoutLoading: boolean;
  withdrawals: {
    items: WithdrawResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
  };
  onPayoutClick: () => void;
  onSwitchToBankTab: () => void;
  onLoadWithdrawals: (page: number) => void;
}
 
export const PayoutSection = ({
  wallet,
  bankAccount,
  payoutLoading,
  withdrawals,
  onPayoutClick,
  onSwitchToBankTab,
  onLoadWithdrawals,
}: PayoutSectionProps) => {
  const formatMoney = (n: number) => (n ?? 0).toLocaleString();
  
  // Check if there's a pending or processing withdrawal
  const hasPendingWithdrawal = withdrawals.items.some(
    (withdrawal) => 
      withdrawal.status === WITHDRAW_STATUS.PENDING || 
      withdrawal.status === WITHDRAW_STATUS.PROCESSING
  );
  const pendingWithdrawal = withdrawals.items.find(
    (withdrawal) => 
      withdrawal.status === WITHDRAW_STATUS.PENDING || 
      withdrawal.status === WITHDRAW_STATUS.PROCESSING
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Withdrawal Section - 1/3 width */}
      <div className="lg:col-span-1">
        <Card className="bg-gradient-to-br from-orange-50 to-rose-50 border-orange-200 shadow-lg h-fit">
          <CardHeader className="bg-gradient-to-r from-orange-100 via-rose-200 to-orange-50 text-orange-800 rounded-t-lg border-b border-orange-200">
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="lucide:banknote" className="w-5 h-5 text-orange-700" />
              <span>Withdraw Funds</span>
            </CardTitle>
            <CardDescription className="text-orange-600">
              Transfer your balance to your bank account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Balance Display */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-700">Available Balance</p>
                  <div className="text-3xl font-bold text-orange-800">
                    {formatMoney(wallet?.balance || 0)} ₫
                  </div>
                </div>
              </div>

              {/* Bank Account Status */}
              <div className="p-4 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Bank Account</p>
                    <div className="flex items-center space-x-2">
                      {bankAccount ? (
                        <>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {bankAccount.bankName}
                          </Badge>
                          <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                            Not Set
                          </Badge>
                          <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-600" />
                        </>
                      )}
                    </div>
                  </div>
                  {bankAccount && (
                    <div className="text-right text-xs text-gray-800">
                      <p className="font-mono">****{bankAccount.accountNumber.slice(-4)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Withdrawal Action */}
              <div className="space-y-4">
                {!bankAccount ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Icon icon="lucide:alert-circle" className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Bank Account Required</h3>
                      <p className="text-sm text-gray-700">
                        Please add a bank account first to receive payouts.
                      </p>
                    </div>
                    <Button
                      onClick={onSwitchToBankTab}
                      className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white space-x-2"
                    >
                      <Icon icon="lucide:plus" className="w-4 h-4" />
                      <span>Add Bank Account</span>
                    </Button>
                  </div>
                ) : (wallet?.balance || 0) <= 0 ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon icon="lucide:wallet" className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">No Balance Available</h3>
                      <p className="text-sm text-gray-700">
                        Complete more bookings to earn money for withdrawal.
                      </p>
                    </div>
                  </div>
                ) : hasPendingWithdrawal ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Icon icon="lucide:clock" className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Withdrawal in Progress</h3>
                        <p className="text-sm text-gray-700">
                          You have a withdrawal request being processed. Please wait until it's completed.
                        </p>
                        {pendingWithdrawal && (
                          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm font-medium text-amber-800">
                              Processing: {formatMoney(pendingWithdrawal.amount)} ₫
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Status: {pendingWithdrawal.status === WITHDRAW_STATUS.PENDING ? "PENDING PROCESSING" : "PROCESSING"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      disabled={true}
                      size="lg"
                      className="w-full bg-gray-400 text-gray-600 space-x-2 cursor-not-allowed"
                    >
                      <Icon icon="lucide:clock" className="w-5 h-5" />
                      <span>Processing Withdrawal...</span>
                    </Button>
                    <p className="text-xs text-center text-gray-600">
                      New withdrawal requests will be available once current processing is complete
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={onPayoutClick}
                      disabled={payoutLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white space-x-2 shadow-lg"
                    >
                      {payoutLoading ? (
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon icon="lucide:banknote" className="w-5 h-5" />
                      )}
                      <span>Withdraw {formatMoney(wallet?.balance || 0)} ₫</span>
                    </Button>
                    <p className="text-xs text-center text-gray-700">
                      Funds will be transferred to your registered bank account within 1-3 business days
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History Section - 2/3 width */}
      <div className="lg:col-span-2">
        <WithdrawalList
          title="Withdrawal History"
          subtitle="Track your past withdrawal transactions"
          icon="lucide:history"
          iconClass="text-blue-600"
          items={withdrawals.items}
          loading={withdrawals.loading}
          page={withdrawals.page}
          totalPages={withdrawals.totalPages}
          onPrev={() => onLoadWithdrawals(Math.max(1, withdrawals.page - 1))}
          onNext={() => onLoadWithdrawals(withdrawals.page + 1)}
        />
      </div>
    </div>
  );
};
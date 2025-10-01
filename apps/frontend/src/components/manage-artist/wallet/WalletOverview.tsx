"use client";

import { Icon } from "@iconify/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lib/ui/card";
import { Badge } from "@/components/lib/ui/badge";
import type { WalletResponseDTO } from "@/types/transaction.dto";
import type { BankAccountResponseDTO } from "@/types/bankaccount.dtos";

interface WalletOverviewProps {
  wallet: WalletResponseDTO | null;
  loadingWallet: boolean;
  capturedTotal: number;
  holdTotal: number;
  bankAccount: BankAccountResponseDTO | null;
  user: any;
}

export const WalletOverview = ({
  wallet,
  loadingWallet,
  capturedTotal,
  holdTotal,
  bankAccount,
  user,
}: WalletOverviewProps) => {
  const formatMoney = (n: number) => (n ?? 0).toLocaleString();

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full shadow-md">
              <Icon icon="lucide:wallet" className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Wallet Management</CardTitle>
              <CardDescription className="text-gray-600">
                Manage your earnings, bank account, and payouts
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-rose-800">
              {loadingWallet ? (
                <div className="animate-pulse bg-rose-200 rounded h-8 w-32" />
              ) : (
                `${formatMoney(wallet?.balance || 0)} ₫`
              )}
            </div>
            <p className="text-sm text-gray-600">Available Balance</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex flex-col space-y-2 p-4 border border-rose-200 rounded-lg bg-gradient-to-br from-green-50 to-white">
            <p className="text-sm font-medium text-gray-600">Captured Transactions</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {capturedTotal}
              </Badge>
              <Icon icon="lucide:trending-up" className="w-4 h-4 text-green-600" />
            </div>
          </div>

          <div className="flex flex-col space-y-2 p-4 border border-rose-200 rounded-lg bg-gradient-to-br from-amber-50 to-white">
            <p className="text-sm font-medium text-gray-600">Hold Transactions</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                {holdTotal}
              </Badge>
              <Icon icon="lucide:clock" className="w-4 h-4 text-amber-600" />
            </div>
          </div>

          <div className="flex flex-col space-y-2 p-4 border border-rose-200 rounded-lg bg-gradient-to-br from-blue-50 to-white">
            <p className="text-sm font-medium text-gray-600">Bank Account</p>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={bankAccount ? "default" : "destructive"}
                className={bankAccount 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {bankAccount ? "Connected" : "Not Set"}
              </Badge>
              <Icon 
                icon={bankAccount ? "lucide:check-circle" : "lucide:alert-circle"} 
                className={`w-4 h-4 ${bankAccount ? "text-green-600" : "text-red-600"}`} 
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 p-4 border border-rose-200 rounded-lg bg-gradient-to-br from-rose-50 to-white">
            <p className="text-sm font-medium text-gray-600">MUA Profile</p>
            {user && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-rose-700 border-rose-300 bg-white">
                  {user.fullName}
                </Badge>
                <Icon icon="lucide:user" className="w-4 h-4 text-rose-600" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
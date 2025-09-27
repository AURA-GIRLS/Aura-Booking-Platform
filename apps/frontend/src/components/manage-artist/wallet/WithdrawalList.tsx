"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/lib/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/lib/ui/card";
import { Badge } from "@/components/lib/ui/badge";
import { Separator } from "@/components/lib/ui/separator";
import type { WithdrawResponseDTO } from "@/types/transaction.dto";

interface WithdrawalListProps {
  title: string;
  subtitle: string;
  icon: string;
  iconClass: string;
  items: WithdrawResponseDTO[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    case "COMPLETED":
    case "SUCCESS":
    case "SUCCEEDED":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
    case "FAILED":
    case "REJECTED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const WithdrawalList = ({
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
}: WithdrawalListProps) => {
  const formatMoney = (n: number) => (n ?? 0).toLocaleString();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-rose-50 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-100 via-rose-100 to-purple-50 text-purple-800 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Icon icon={icon} className={`w-5 h-5 text-purple-600`} />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-purple-600">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-12">
                <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            );
          }

          if (items.length === 0) {
            return (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:inbox" className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">No withdrawals found</p>
                  <p className="text-sm text-gray-700">Your withdrawal history will appear here once you make your first withdrawal</p>
                </div>
              </div>
            );
          }

          return (
          <div className="space-y-4">
            {items.map((withdrawal, index) => (
              <div key={withdrawal._id} className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900">Withdrawal #{withdrawal._id.slice(-6)}</p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Icon icon="lucide:calendar" className="w-4 h-4 text-purple-500" />
                          <span>{withdrawal.withdrawDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon icon="lucide:clock" className="w-4 h-4 text-purple-500" />
                          <span>{withdrawal.withdrawTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-purple-700">
                        {formatMoney(withdrawal.amount)} {withdrawal.currency}
                      </p>
                    </div>
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="bg-purple-100" />}
              </div>
            ))}

            {/* Pagination - Always show when there are items */}
            {items.length > 0 && (
              <>
                <Separator className="bg-purple-100" />
                <div className="bg-purple-50/50 -mx-6 -mb-6 px-6 py-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPrev}
                      disabled={page <= 1}
                      className="space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-purple-800">
                        Page {page} of {Math.max(1, totalPages)}
                      </span>
                      <span className="text-xs text-purple-600 bg-white px-2 py-1 rounded-full">
                        {items.length} item{items.length !== 1 ? 's' : ''} shown
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNext}
                      disabled={page >= Math.max(1, totalPages)}
                      className="space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};
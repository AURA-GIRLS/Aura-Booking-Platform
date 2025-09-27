"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";
import { Loader2 } from "lucide-react";
import { BankAccountResponseDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";

interface BankAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateBankAccountDTO) => Promise<void>;
  initialData?: BankAccountResponseDTO | null;
  isLoading?: boolean;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateBankAccountDTO>({
    accountName: "",
    accountNumber: "",
    bankName: "",
    bankCode: "",
    bankBin: "",
    swiftCode: ""
  });

  const [errors, setErrors] = useState<Partial<UpdateBankAccountDTO>>({});

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          accountName: initialData.accountName || "",
          accountNumber: initialData.accountNumber || "",
          bankName: initialData.bankName || "",
          bankCode: initialData.bankCode || "",
          bankBin: initialData.bankBin || "",
          swiftCode: initialData.swiftCode || ""
        });
      } else {
        setFormData({
          accountName: "",
          accountNumber: "",
          bankName: "",
          bankCode: "",
          bankBin: "",
          swiftCode: ""
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleInputChange = (field: keyof UpdateBankAccountDTO, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateBankAccountDTO> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must contain only digits";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.bankCode.trim()) {
      newErrors.bankCode = "Bank code is required";
    }

    if (!formData.bankBin.trim()) {
      newErrors.bankBin = "Bank BIN is required";
    } else if (!/^\d+$/.test(formData.bankBin)) {
      newErrors.bankBin = "Bank BIN must contain only digits";
    }

    if (formData.swiftCode && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swiftCode)) {
      newErrors.swiftCode = "Invalid SWIFT code format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {initialData ? "Update Bank Account" : "Add Bank Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
              Account Name *
            </Label>
            <Input
              id="accountName"
              type="text"
              placeholder="Enter account holder name"
              value={formData.accountName}
              onChange={(e) => handleInputChange("accountName", e.target.value)}
              className={errors.accountName ? "border-red-500 focus:ring-red-500" : ""}
              disabled={isLoading}
            />
            {errors.accountName && (
              <p className="text-sm text-red-600">{errors.accountName}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
              Account Number *
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              className={errors.accountNumber ? "border-red-500 focus:ring-red-500" : ""}
              disabled={isLoading}
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-600">{errors.accountNumber}</p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
              Bank Name *
            </Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              className={errors.bankName ? "border-red-500 focus:ring-red-500" : ""}
              disabled={isLoading}
            />
            {errors.bankName && (
              <p className="text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          {/* Bank Code and Bank BIN in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankCode" className="text-sm font-medium text-gray-700">
                Bank Code *
              </Label>
              <Input
                id="bankCode"
                type="text"
                placeholder="Bank code"
                value={formData.bankCode}
                onChange={(e) => handleInputChange("bankCode", e.target.value)}
                className={errors.bankCode ? "border-red-500 focus:ring-red-500" : ""}
                disabled={isLoading}
              />
              {errors.bankCode && (
                <p className="text-sm text-red-600">{errors.bankCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankBin" className="text-sm font-medium text-gray-700">
                Bank BIN *
              </Label>
              <Input
                id="bankBin"
                type="text"
                placeholder="Bank BIN"
                value={formData.bankBin}
                onChange={(e) => handleInputChange("bankBin", e.target.value)}
                className={errors.bankBin ? "border-red-500 focus:ring-red-500" : ""}
                disabled={isLoading}
              />
              {errors.bankBin && (
                <p className="text-sm text-red-600">{errors.bankBin}</p>
              )}
            </div>
          </div>

          {/* Swift Code (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="swiftCode" className="text-sm font-medium text-gray-700">
              SWIFT Code (Optional)
            </Label>
            <Input
              id="swiftCode"
              type="text"
              placeholder="Enter SWIFT code (e.g., BFTVVNVX)"
              value={formData.swiftCode}
              onChange={(e) => handleInputChange("swiftCode", e.target.value.toUpperCase())}
              className={errors.swiftCode ? "border-red-500 focus:ring-red-500" : ""}
              disabled={isLoading}
            />
            {errors.swiftCode && (
              <p className="text-sm text-red-600">{errors.swiftCode}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Account" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountModal;
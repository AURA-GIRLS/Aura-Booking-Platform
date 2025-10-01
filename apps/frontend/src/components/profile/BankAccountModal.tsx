"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/lib/ui/select";
import { Loader2 } from "lucide-react";
import { BankAccountResponseDTO, BankDTO, UpdateBankAccountDTO } from "@/types/bankaccount.dtos";
import { ProfileBankAccountService } from "@/services/profile.bankaccount";

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
    swiftCode: "",
    bankLogo: ""
  });

  const [errors, setErrors] = useState<Partial<UpdateBankAccountDTO>>({});
  const [bankList, setBankList] = useState<BankDTO[]>([]);
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
    fetchVietQrBanks();
  }, [open, initialData]);

  const fetchVietQrBanks = useCallback(async () => {
    try {
      const response = await ProfileBankAccountService.getVietQrBankList();
      if(response?.code === '00'){
        setBankList(response?.data);
      }
      console.log("VietQR Bank List:", response.data);
      console.log("bank list:", bankList);
    } catch (error) {
      console.error("Failed to fetch VietQR bank list:", error);
    }
  }, []);

  const handleInputChange = (field: keyof UpdateBankAccountDTO, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBankSelect = (bankId: string) => {
    const selectedBank = bankList.find(bank => bank.id.toString() === bankId);
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        bankName: selectedBank.shortName,
        bankCode: selectedBank.code,
        bankBin: selectedBank.bin,
        swiftCode: selectedBank.swift_code || "",
        bankLogo: selectedBank.logo
      }));
      
      // Clear any errors for auto-populated fields
      setErrors(prev => ({
        ...prev,
        bankName: undefined,
        bankCode: undefined,
        bankBin: undefined,
        swiftCode: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateBankAccountDTO> = {};

    if (!formData.accountName!.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.accountNumber!.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(formData.accountNumber || "")) {
      newErrors.accountNumber = "Account number must contain only digits";
    }

    if (!formData.bankName!.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.bankCode!.trim()) {
      newErrors.bankCode = "Bank code is required";
    }

    if (!formData.bankBin!.trim()) {
      newErrors.bankBin = "Bank BIN is required";
    } else if (!/^\d+$/.test(formData.bankBin || "")) {
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
      console.log("Submission error:", error);
    }
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-md w-full mx-auto bg-white" aria-describedby="Add or update your bank account details">
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

          {/* Bank Selection */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
              Bank Name *
            </Label>
            <Select 
              onValueChange={handleBankSelect}
              value={bankList.find(bank => bank.shortName === formData.bankName)?.id.toString() || ""}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.bankName ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] w-[400px] bg-white">
                {bankList.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id.toString()}>
                    <div className="flex items-center gap-3">
                      {bank.logo && (
                        <img 
                          src={bank.logo} 
                          alt={bank.shortName}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{bank.shortName}</span>
                        <span className="text-xs text-gray-500">{bank.name}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankName && (
              <p className="text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          {/* Hidden fields for bank details - still populated but not shown */}
          <input type="hidden" value={formData.bankCode} />
          <input type="hidden" value={formData.bankBin} />
          <input type="hidden" value={formData.swiftCode} />

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
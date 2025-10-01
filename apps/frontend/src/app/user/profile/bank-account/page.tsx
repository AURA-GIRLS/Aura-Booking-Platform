"use client";

import React from "react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import BankAccount from "@/components/profile/BankAccount";

const BankAccountPage: React.FC = () => {
  return (
    <ProfileLayout>
      <BankAccount />
    </ProfileLayout>
  );
};

export default BankAccountPage;

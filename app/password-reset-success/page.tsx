import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Password reset successful | Konnect",
  description: "Your password has been successfully updated. Log into your Konnect account.",
};

export default function PasswordResetSuccessPage() {
  return <AccountPage mode="reset-success" />;
}

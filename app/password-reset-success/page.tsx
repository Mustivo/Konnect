import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Password reset | Konnect",
  description: "Your Konnect password has been reset.",
};

export default function PasswordResetSuccessPage() {
  return <AccountPage mode="reset-success" />;
}

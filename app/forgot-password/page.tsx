import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Forgot password | Konnect",
  description: "Request a password reset for your Konnect account.",
};

export default function ForgotPasswordPage() {
  return <AccountPage mode="forgot" />;
}

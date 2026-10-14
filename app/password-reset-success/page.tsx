import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Password recovery | Konnect",
  description: "Password recovery is not currently available for Konnect accounts.",
};

export default function PasswordResetSuccessPage() {
  return <AccountPage mode="reset-success" />;
}

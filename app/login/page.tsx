import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Log in | Konnect",
  description: "Log in to your Konnect learning account.",
};

export default function LoginPage() {
  return <AccountPage mode="login" />;
}

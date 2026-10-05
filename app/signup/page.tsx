import type { Metadata } from "next";
import AccountPage from "@/components/AccountPage";

export const metadata: Metadata = {
  title: "Sign up | Konnect",
  description: "Create your Konnect learning account.",
};

export default function SignupPage() {
  return <AccountPage mode="signup" />;
}

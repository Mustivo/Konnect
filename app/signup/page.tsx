import type { Metadata } from "next";
import SignupExperience from "./SignupPage";

export const metadata: Metadata = {
  title: "Sign up | Konnect",
  description: "Create your Konnect learning account.",
};

export default function SignupPage() {
  return <SignupExperience />;
}

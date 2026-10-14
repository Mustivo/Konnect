"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { currentUser, updateCurrentUser } from "@/lib/api/auth";
import { z } from "zod";

const accountSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phoneNumber: z.string().max(30, "Phone number must be 30 characters or fewer."),
});

type AccountDetails = z.infer<typeof accountSchema>;
const emptyAccount: AccountDetails = { firstName: "", lastName: "", email: "", phoneNumber: "" };

export default function AdminSettingsPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountDetails>(emptyAccount);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!window.localStorage.getItem("konnect-access-token")) {
      router.replace("/login");
      return;
    }
    currentUser().then((user) => {
      setAccount({
        firstName: user.first_name || user.username,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number ?? "",
      });
    }).catch((error) => {
      setNotice(apiErrorMessage(error instanceof ApiError ? error.payload : error, "Could not load your account details."));
    }).finally(() => setLoading(false));
  }, [router]);

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = accountSchema.safeParse(account);
    if (!result.success) {
      setNotice(result.error.issues[0]?.message ?? "Check your account details.");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const user = await updateCurrentUser({
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        email: result.data.email,
        phone_number: result.data.phoneNumber,
      });
      setAccount({
        firstName: user.first_name || user.username,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number ?? "",
      });
      setNotice("Your account details have been saved.");
    } catch (error) {
      setNotice(apiErrorMessage(error instanceof ApiError ? error.payload : error, "Your account details could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-2xl py-2">
        <header className="mb-4">
          <p className="text-[9px] font-bold uppercase text-[#657a55] dark:text-[#a8be97]">Admin account</p>
          <h1 className="mt-1 text-xl font-bold">Profile settings</h1>
          <p className="mt-1 text-[10px] text-[#72796f] dark:text-[#a6aea0]">Manage the contact details for your Konnect account.</p>
        </header>
        <form onSubmit={saveAccount} className="space-y-3 rounded-lg border border-[#e0e5dd] bg-white p-4 dark:border-white/10 dark:bg-[#1b211a]">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[9px] font-semibold">First name
              <input required autoComplete="given-name" value={account.firstName} onChange={(event) => setAccount((value) => ({ ...value, firstName: event.target.value }))} className="mt-1 block h-9 w-full rounded border border-[#e0e5dc] bg-white px-2.5 text-[11px] font-normal outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#151a14]" />
            </label>
            <label className="text-[9px] font-semibold">Last name
              <input required autoComplete="family-name" value={account.lastName} onChange={(event) => setAccount((value) => ({ ...value, lastName: event.target.value }))} className="mt-1 block h-9 w-full rounded border border-[#e0e5dc] bg-white px-2.5 text-[11px] font-normal outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#151a14]" />
            </label>
            <label className="text-[9px] font-semibold">Email address
              <input required type="email" autoComplete="email" value={account.email} onChange={(event) => setAccount((value) => ({ ...value, email: event.target.value }))} className="mt-1 block h-9 w-full rounded border border-[#e0e5dc] bg-white px-2.5 text-[11px] font-normal outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#151a14] sm:col-span-2" />
            </label>
            <label className="text-[9px] font-semibold sm:col-span-2">Phone number
              <input type="tel" autoComplete="tel" maxLength={30} value={account.phoneNumber} onChange={(event) => setAccount((value) => ({ ...value, phoneNumber: event.target.value }))} className="mt-1 block h-9 w-full rounded border border-[#e0e5dc] bg-white px-2.5 text-[11px] font-normal outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#151a14]" />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0e9] pt-3 dark:border-white/10">
            <p role="status" aria-live="polite" className="text-[9px] text-[#596d4e] dark:text-[#c5d6bc]">{loading ? "Loading account…" : notice}</p>
            <button type="submit" disabled={loading || saving} className="rounded bg-[#263d21] px-4 py-2 text-[10px] font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

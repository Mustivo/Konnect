"use client";

import RoleSelector from "../RoleSelector";

type AccountStepProps = {
  hidden: boolean;
  role: "learner" | "teacher";
  onRoleChange: (role: "learner" | "teacher") => void;
  onContinue: () => void;
};

export default function AccountStep({ hidden, role, onRoleChange, onContinue }: AccountStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <RoleSelector role={role} onChange={onRoleChange} />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">
          Full legal name
          <input name="fullName" placeholder="Maya Lin Chen" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Professional display name
          <input name="displayName" placeholder="Maya Chen" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Email address
          <input autoComplete="email" name="email" type="email" placeholder="you@example.com" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Phone number
          <input autoComplete="tel" name="phone" type="tel" placeholder="+1 415 555 0184" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Country
          <select name="country" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#10140f]">
            <option value="" disabled>Select your country</option>
            <option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>Other</option>
          </select>
        </label>
        <label className="block text-[0.65rem] font-medium">
          Timezone
          <select name="timezone" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#10140f]">
            <option value="" disabled>Select your timezone</option>
            <option value="America/Los_Angeles">Pacific Time</option><option value="America/Denver">Mountain Time</option><option value="America/Chicago">Central Time</option><option value="America/New_York">Eastern Time</option><option value="Europe/London">London</option><option value="Europe/Paris">Central European Time</option><option value="Asia/Tokyo">Japan Standard Time</option>
          </select>
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">
          Password
          <input type="password" name="password" placeholder="At least 12 characters" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Confirm password
          <input type="password" name="confirmPassword" placeholder="Re-enter your password" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
      </div>
      <p className="text-[0.5rem] text-[#84907a]">Use 12+ characters, upper and lowercase letters, a number, and a symbol.</p>
      <label className="flex items-center gap-2 text-[0.58rem] text-[#70786d]">
        <input type="checkbox" name="terms" className="h-3 w-3 accent-[#263d21]" />
        I agree to the Terms and Privacy Policy.
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={onContinue} className="rounded bg-[#263d21] px-4 py-2.5 text-xs font-semibold text-white">Continue to teaching profile</button>
        <button type="button" className="rounded border border-[#e0e3d9] px-3 py-2.5 text-[0.65rem]">G&nbsp; Sign up with Google</button>
        <button type="button" className="rounded border border-[#e0e3d9] px-3 py-2.5 text-[0.65rem]">Sign up with Apple</button>
      </div>
    </fieldset>
  );
}

"use client";

import { useRef, useState } from "react";
import { CircleHelp, Clock3, Mail } from "lucide-react";

type EmailVerificationProps = {
  email: string;
  notice: string;
  onNoticeChange: (notice: string) => void;
  onVerified: () => void;
  onChangeEmail: () => void;
};

export default function EmailVerification({
  email,
  notice,
  onNoticeChange,
  onVerified,
  onChangeEmail,
}: EmailVerificationProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) =>
      current.map((item, position) => position === index ? digit : item),
    );

    if (digit && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;

    setCode([...digits, ...Array(6 - digits.length).fill("")]);
    inputs.current[digits.length - 1]?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[480px] text-[#20271d]">
      <div className="mb-5 flex justify-end">
        <a href="/help" className="inline-flex items-center gap-1.5 text-[0.55rem] font-medium text-[#586853] hover:text-[#263d21]">
          <CircleHelp aria-hidden="true" className="h-3 w-3" />
          Need help?
        </a>
      </div>
      <p className="text-[0.48rem] font-bold uppercase tracking-[0.12em] text-[#526d43]">Email verification</p>
      <h1 className="mt-1 text-[1.25rem] font-semibold leading-tight tracking-[-0.04em]">Check your inbox.</h1>
      <p className="mt-1 text-[0.52rem] leading-4 text-[#70786d]">
        Enter the six-digit code sent to {email.trim() || "maya.chen@northfield.edu"}.
      </p>
      <div className="mt-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eee3] text-[#526d43]">
        <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <label className="mt-3.5 block text-[0.52rem] font-semibold text-[#333c31]">Verification code</label>
      <div className="mt-1 flex justify-between gap-1.5">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { inputs.current[index] = element; }}
            aria-label={`Verification code digit ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => updateDigit(event.target.value, index)}
            onPaste={handlePaste}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digit && index > 0) {
                inputs.current[index - 1]?.focus();
              } else if (event.key === "ArrowLeft" && index > 0) {
                inputs.current[index - 1]?.focus();
              } else if (event.key === "ArrowRight" && index < 5) {
                inputs.current[index + 1]?.focus();
              }
            }}
            className="h-9 min-w-0 flex-1 rounded-md border border-[#e0e3d9] bg-white text-center text-sm font-semibold text-[#20271d] outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/15"
          />
        ))}
      </div>
      <p className="mt-1 text-[0.45rem] text-[#8a9086]">Code expires in 09:42</p>
      <button
        type="button"
        onClick={onVerified}
        className="mt-3.5 h-[27px] w-full rounded-md bg-[#263d21] text-[0.5rem] font-semibold text-white transition hover:bg-[#1e311a]"
      >
        Verify email
      </button>
      <div className="mt-3 rounded-md bg-[#f1f0e8] px-2.5 py-2 text-[0.45rem] leading-4 text-[#72786e]">
        <p className="font-semibold text-[#30392e]">Didn&apos;t receive it?</p>
        <p>Check spam or wait a moment. You can resend a new code in 00:28.</p>
        <button
          type="button"
          onClick={() => onNoticeChange("A new verification code can be requested once email delivery is connected.")}
          className="font-medium text-[#526d43] hover:underline"
        >
          Resend code
        </button>
      </div>
      <button
        type="button"
        onClick={onChangeEmail}
        className="mt-3 block text-[0.48rem] font-semibold text-[#35452f] hover:underline"
      >
        Change email address
      </button>
      <p className="mt-3 flex items-center gap-1.5 rounded-md bg-[#e9efe3] px-2 py-2 text-[0.43rem] leading-4 text-[#45553d]">
        <Clock3 aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={1.5} />
        Your 3–5 business day application review starts after your email is verified.
      </p>
      {notice && <p aria-live="polite" className="mt-2 text-[0.48rem] text-[#526d43]">{notice}</p>}
    </div>
  );
}

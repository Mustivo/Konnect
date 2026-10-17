"use client";

import Link from "next/link";
import { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import AccountStep from "./steps/AccountStep";
import ProfileStep from "./steps/ProfileStep";
import DocumentsStep from "./steps/DocumentsStep";
import ReviewStep, { type TeacherReviewData } from "./steps/ReviewStep";
import EmailVerification from "./screens/EmailVerification";
import ApplicationStatus from "./screens/ApplicationStatus";
import { apiErrorMessage, login, register, updateTeacherProfile } from "@/lib/api";
import AuthMessage from "@/components/ui/AuthMessage";

type TeacherSignupProps = {
  role: "learner" | "teacher";
  onRoleChange: (role: "learner" | "teacher") => void;
};

const steps = ["Account", "Profile", "Documents", "Review"];
const stepLabels = [
  "",
  "Instructor application",
  "Teaching profile",
  "Identity & qualifications",
  "Review",
];
const stepTitles = [
  "",
  "Create your instructor account.",
  "Share with us your journey.",
  "Add your verification documents.",
  "Review and confirm.",
];
const stepDescriptions = [
  "",
  "Set up secure sign-in details. You can review everything before submitting.",
  "Share the professional context our team needs to review your application.",
  "Clear copies help us confirm your identity and professional qualifications.",
  "Check your details and accept the declarations before submitting.",
];

export default function TeacherSignup({ role, onRoleChange }: TeacherSignupProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<TeacherReviewData>({});
  const applicationForm = useRef<HTMLFormElement>(null);

  function captureReviewData() {
    if (!applicationForm.current) return;
    const values = new FormData(applicationForm.current);
    const degree = values.get("degree_certificate") as File | null;
    const cv = values.get("cv") as File | null;
    setReviewData({
      fullName: String(values.get("fullName") || "").trim(),
      displayName: String(values.get("displayName") || "").trim(),
      email: String(values.get("email") || "").trim(),
      country: String(values.get("country") || "").trim(),
      phone: String(values.get("phone") || "").trim(),
      headline: String(values.get("headline") || "").trim(),
      experience: String(values.get("experience") || "").trim(),
      bio: String(values.get("bio") || "").trim(),
      subjects: String(values.get("subjects") || "").trim(),
      institution: String(values.get("institution") || "").trim(),
      educationLevel: String(values.get("educationLevel") || "").trim(),
      teachingMode: String(values.get("teachingMode") || "").trim(),
      portfolio: String(values.get("portfolio") || "").trim(),
      documentName: String(values.get("documentName") || "").trim(),
      degreeFileName: degree?.name || "",
      cvFileName: cv?.name || "",
    });
  }

  function validateCurrentStep() {
    const fieldset = applicationForm.current?.querySelector<HTMLFieldSetElement>("fieldset:not([hidden])");
    if (!fieldset?.reportValidity()) return false;

    if (step === 1 && applicationForm.current) {
      const values = new FormData(applicationForm.current);
      const password = String(values.get("password") ?? "");
      const passwordConfirm = String(values.get("confirmPassword") ?? "");
      if (password !== passwordConfirm) {
        setNotice("Passwords do not match.");
        return false;
      }
      setEmail(String(values.get("email") ?? "").trim());
    }
    setNotice("");
    return true;
  }

  async function submitApplication() {
    if (!validateCurrentStep() || !applicationForm.current) return;
    const values = new FormData(applicationForm.current);
    const emailAddress = String(values.get("email") ?? "").trim().toLowerCase();
    const fullName = String(values.get("fullName") ?? "").trim();
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    const password = String(values.get("password") ?? "");
    const passwordConfirm = String(values.get("confirmPassword") ?? "");
    let accountCreated = false;

    setSubmitting(true);
    setNotice("");
    try {
      const cleanUsername = (emailAddress.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20) || "teacher") + "_" + Math.random().toString(36).slice(2, 6);
      const phoneNumber = String(values.get("phone") ?? "").trim();

      await register({
        email: emailAddress,
        username: cleanUsername,
        name: fullName || "Instructor",
        full_name: fullName || "Instructor",
        first_name: firstName || "Instructor",
        last_name: lastNameParts.join(" ") || "Teacher",
        phone_number: phoneNumber || undefined,
        password,
        password_confirm: passwordConfirm,
        role: "TEACHER",
      });
      accountCreated = true;

      const tokens = await login(emailAddress, password);
      localStorage.setItem("konnect-access-token", tokens.access);
      localStorage.setItem("konnect-refresh-token", tokens.refresh);

      const profile = new FormData();
      profile.set("email", emailAddress);
      profile.set("full_legal_name", fullName);
      profile.set("display_name", String(values.get("displayName") ?? fullName).trim());
      profile.set("phone_number", phoneNumber);
      profile.set("country", String(values.get("country") ?? "").trim());
      profile.set("headline", String(values.get("headline") ?? "").trim());
      profile.set("bio", String(values.get("bio") ?? "").trim());
      profile.set("years_of_experience", String(values.get("experience") ?? "").trim());
      profile.set("education_level_taught", String(values.get("educationLevel") ?? "").trim());
      profile.set("current_institution", String(values.get("institution") ?? "").trim());
      profile.set("teaching_mode", String(values.get("teachingMode") ?? "").trim());
      profile.set("subjects_expertise", String(values.get("subjects") ?? "").trim());
      profile.set("languages", String(values.get("languages") ?? "").trim());
      profile.set("portfolio_url", String(values.get("portfolio") ?? "").trim());
      profile.set("legal_name_on_documents", String(values.get("documentName") ?? fullName).trim());

      const degreeCert = values.get("degree_certificate");
      if (degreeCert instanceof File && degreeCert.size > 0) {
        profile.set("degree_certificate", degreeCert);
      }
      const cvFile = values.get("cv");
      if (cvFile instanceof File && cvFile.size > 0) {
        profile.set("cv", cvFile);
      }
      const profilePhoto = values.get("profilePhoto");
      if (profilePhoto instanceof File && profilePhoto.size > 0) {
        profile.set("profile_picture", profilePhoto);
      }

      await updateTeacherProfile(profile);
      router.replace("/login?registered=1");
    } catch (error) {
      const message = apiErrorMessage(error instanceof Error && "payload" in error ? error.payload : error, "Please review your details and try again.");
      setNotice(accountCreated ? `Your account was created, but the teacher profile could not be submitted: ${message}` : message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 5) {
    return (
      <EmailVerification
        email={email}
        notice={notice}
        onNoticeChange={setNotice}
        onVerified={() => {
          setNotice("");
          setVerifiedAt(new Date());
          setStep(6);
        }}
        onChangeEmail={() => {
          setNotice("");
          setStep(1);
        }}
      />
    );
  }

  if (step >= 6) {
    const status = step === 6 ? "pending" : step === 7 ? "rejected" : "approved";

    return (
      <ApplicationStatus
        status={status}
        submittedAt={verifiedAt ?? new Date()}
        onContactSupport={() => setStep(7)}
        onStartNewApplication={() => {
          setEmail("");
          setStep(8);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-[840px]">
      <div className="mb-4 flex items-center text-[0.55rem] text-[#6c7469] dark:text-[#b0b8aa]">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${index + 1 <= step ? "border-[#263d21] bg-[#263d21] font-semibold text-white" : "border-[#dfe5d8] bg-white dark:border-white/20 dark:bg-white/5"}`}>
              {index + 1}
            </span>
            <span className={index + 1 === step ? "font-semibold text-[#20271d] dark:text-[#f4f4f0]" : ""}>{label}</span>
            {index < steps.length - 1 && <span className="mx-1 h-px flex-1 bg-[#dfe5d8] dark:bg-white/10" />}
          </div>
        ))}
      </div>

      <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
        {stepLabels[step]}
      </p>
      <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
        {stepTitles[step]}
      </h1>
      <p className="mt-2 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
        {stepDescriptions[step]}
      </p>
      <p className="mt-2 text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">Fields are required unless marked optional.</p>

      {/* Prominent Auth Alert / Return Message */}
      <AuthMessage
        notice={notice}
        onDismiss={() => setNotice("")}
        className="my-3.5"
      />

      <form ref={applicationForm} onSubmit={(event) => event.preventDefault()} className="mt-4">
        <AccountStep
          hidden={step !== 1}
          role={role}
          onRoleChange={onRoleChange}
          onEmailChange={setEmail}
          onContinue={() => { if (validateCurrentStep()) setStep(2); }}
        />
        <ProfileStep
          hidden={step !== 2}
          onBack={() => setStep(1)}
          onContinue={() => { if (validateCurrentStep()) setStep(3); }}
        />
        <DocumentsStep
          hidden={step !== 3}
          onBack={() => setStep(2)}
          onContinue={() => {
            if (validateCurrentStep()) {
              captureReviewData();
              setStep(4);
            }
          }}
        />
        <ReviewStep
          hidden={step !== 4}
          onEdit={setStep}
          onBack={() => setStep(3)}
          onSubmit={submitApplication}
          reviewData={reviewData}
        />
      </form>
      {submitting && (
        <p aria-live="polite" className="mt-2 min-h-4 text-center text-xs text-[#526d43] dark:text-[#b7cc9d]">
          Submitting your application…
        </p>
      )}
      <p className="mt-3 text-center text-[0.62rem] text-[#70786d] dark:text-[#b0b8aa]">
        Already have an account? <Link href="/login" className="font-semibold text-[#263d21] dark:text-[#c5d6bc]">Log in</Link>
      </p>
    </div>
  );
}

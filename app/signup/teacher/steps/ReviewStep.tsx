export type TeacherReviewData = {
  fullName?: string;
  displayName?: string;
  email?: string;
  country?: string;
  phone?: string;
  headline?: string;
  experience?: string;
  bio?: string;
  subjects?: string;
  institution?: string;
  educationLevel?: string;
  teachingMode?: string;
  portfolio?: string;
  documentName?: string;
  degreeFileName?: string;
  cvFileName?: string;
};

type ReviewStepProps = {
  hidden: boolean;
  onEdit: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  reviewData?: TeacherReviewData;
};

export default function ReviewStep({ hidden, onEdit, onBack, onSubmit, reviewData }: ReviewStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <div>
        <p className="text-[0.55rem] font-bold uppercase tracking-wide text-[#687c50]">Final review</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Review and confirm.</h2>
        <p className="mt-1 text-[0.6rem] text-[#6c7469]">Check your details and accept the declarations before submitting.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem] dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex justify-between"><h3 className="font-semibold">Account</h3><button type="button" onClick={() => onEdit(1)} className="font-semibold text-[#526d43]">Edit</button></div>
          <p><span className="text-[#84907a]">Legal name:</span> {reviewData?.fullName || "Not provided"}</p>
          <p><span className="text-[#84907a]">Display name:</span> {reviewData?.displayName || reviewData?.fullName || "Not provided"}</p>
          <p><span className="text-[#84907a]">Email:</span> {reviewData?.email || "Not provided"}</p>
          <p><span className="text-[#84907a]">Location:</span> {reviewData?.country || "Not provided"}</p>
        </section>
        <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem] dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex justify-between"><h3 className="font-semibold">Teaching profile</h3><button type="button" onClick={() => onEdit(2)} className="font-semibold text-[#526d43]">Edit</button></div>
          <p><span className="text-[#84907a]">Headline:</span> {reviewData?.headline || "Not provided"}</p>
          <p><span className="text-[#84907a]">Expertise:</span> {reviewData?.subjects || "Not provided"}</p>
          <p><span className="text-[#84907a]">Experience:</span> {reviewData?.experience || "Not provided"}</p>
          <p><span className="text-[#84907a]">Institution:</span> {reviewData?.institution || "Not provided"}</p>
        </section>
      </div>
      <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem] dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 flex justify-between"><h3 className="font-semibold">Documents &amp; credentials</h3><button type="button" onClick={() => onEdit(3)} className="font-semibold text-[#526d43]">Edit</button></div>
        <p><span className="text-[#84907a]">Degree certificate:</span> {reviewData?.degreeFileName ? `Uploaded (${reviewData.degreeFileName})` : "Uploaded"}</p>
        <p><span className="text-[#84907a]">CV / résumé:</span> {reviewData?.cvFileName ? `Uploaded (${reviewData.cvFileName})` : "None added (optional)"}</p>
      </section>
      <section className="space-y-2 rounded-lg bg-[#f0f1e9] p-3 text-[0.55rem]">
        <h3 className="font-semibold">Declarations</h3>
        <label className="flex items-start gap-2"><input required type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I confirm the information in this application is complete and accurate.</label>
        <label className="flex items-start gap-2"><input required type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I consent to identity and qualification verification for this application.</label>
        <label className="flex items-start gap-2"><input required type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I accept Konnect’s safeguarding standards and Instructor Code of Conduct.</label>
      </section>
      <p className="rounded bg-[#edf2e8] px-3 py-2 text-[0.5rem] text-[#52644a]">
        After submission, verify your email to start review. You can’t teach or access teaching tools until an administrator approves your application.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} className="rounded border border-[#e0e3d9] px-4 py-2.5 text-xs font-semibold">Back</button>
        <button type="button" onClick={onSubmit} className="rounded bg-[#263d21] px-4 py-2.5 text-xs font-semibold text-white">Submit for review</button>
      </div>
    </fieldset>
  );
}

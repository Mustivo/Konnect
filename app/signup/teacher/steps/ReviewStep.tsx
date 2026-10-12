type ReviewStepProps = {
  hidden: boolean;
  onEdit: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export default function ReviewStep({ hidden, onEdit, onBack, onSubmit }: ReviewStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <div>
        <p className="text-[0.55rem] font-bold uppercase tracking-wide text-[#687c50]">Final review</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Review and confirm.</h2>
        <p className="mt-1 text-[0.6rem] text-[#6c7469]">Check your details and accept the declarations before submitting.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem]">
          <div className="mb-2 flex justify-between"><h3 className="font-semibold">Account</h3><button type="button" onClick={() => onEdit(1)} className="font-semibold text-[#526d43]">Edit</button></div>
          <p>Legal name · Not provided</p><p>Display name · Not provided</p><p>Email · Not provided</p><p>Location · Not provided</p>
        </section>
        <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem]">
          <div className="mb-2 flex justify-between"><h3 className="font-semibold">Teaching profile</h3><button type="button" onClick={() => onEdit(2)} className="font-semibold text-[#526d43]">Edit</button></div>
          <p>Headline · Not provided</p><p>Expertise · Not provided</p><p>Experience · Not provided</p><p>Institution · Not provided</p>
        </section>
      </div>
      <section className="rounded-lg border border-[#e0e3d9] bg-white p-3 text-[0.55rem]">
        <div className="mb-2 flex justify-between"><h3 className="font-semibold">Identity &amp; qualifications</h3><button type="button" onClick={() => onEdit(3)} className="font-semibold text-[#526d43]">Edit</button></div>
        <p>CV / résumé · Not uploaded</p><p>Government ID · Not uploaded</p><p>Degree · Not uploaded</p><p>Teaching certificates · None added (optional)</p>
      </section>
      <section className="space-y-2 rounded-lg bg-[#f0f1e9] p-3 text-[0.55rem]">
        <h3 className="font-semibold">Declarations</h3>
        <label className="flex items-start gap-2"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I confirm the information in this application is complete and accurate.</label>
        <label className="flex items-start gap-2"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I consent to identity and qualification verification for this application.</label>
        <label className="flex items-start gap-2"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#263d21]" />I accept Konnect’s safeguarding standards and Instructor Code of Conduct.</label>
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

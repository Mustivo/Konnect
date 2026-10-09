type DocumentsStepProps = {
  hidden: boolean;
  onBack: () => void;
  onContinue: () => void;
};

const documents = [
  { name: "CV or résumé", hint: "PDF, DOC, DOCX · up to 10 MB", accept: ".pdf,.doc,.docx" },
  { name: "Government ID — front", hint: "PDF, JPG or PNG · up to 10 MB", accept: ".pdf,image/jpeg,image/png" },
  { name: "Government ID — back", hint: "PDF, JPG or PNG · up to 10 MB", accept: ".pdf,image/jpeg,image/png" },
  { name: "Degree certificate", hint: "PDF, JPG or PNG · up to 10 MB", accept: ".pdf,image/jpeg,image/png" },
  { name: "Teaching certificates", hint: "Optional · PDF, JPG or PNG · up to 10 MB", accept: ".pdf,image/jpeg,image/png" },
];

export default function DocumentsStep({ hidden, onBack, onContinue }: DocumentsStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">Legal name on documents
          <input name="documentName" placeholder="Enter name as shown on your ID" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
          <span className="mt-1 block text-[0.5rem] font-normal text-[#84907a]">Must exactly match your government ID</span>
        </label>
        <p className="rounded bg-[#f0f1e9] p-3 text-[0.55rem] text-[#6c7469]">Before uploading, make sure all names and dates are readable and match your application.</p>
      </div>
      <p className="rounded border border-[#dfe5d8] bg-[#edf2e8] px-3 py-2 text-[0.55rem] text-[#52644a]">
        Your documents are encrypted and visible only to the verification team.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {documents.map((document) => (
          <label key={document.name} className="block rounded border border-dashed border-[#cbd5c1] bg-white p-3 text-[0.6rem] dark:border-white/15 dark:bg-white/5">
            <span className="font-semibold">{document.name}</span>
            <span className="mt-1 block text-[0.5rem] text-[#84907a]">{document.hint}</span>
            <input type="file" name={document.name.toLowerCase().replaceAll(/[^a-z]+/g, "-")} accept={document.accept} className="mt-2 block w-full text-[0.55rem]" />
          </label>
        ))}
      </div>
      <div className="rounded bg-[#f0f1e9] p-3 text-[0.55rem] leading-4 text-[#6c7469]">
        <span className="font-semibold text-[#20271d]">Why we verify</span>
        <p className="mt-1">Verification helps protect learners and confirms that instructor profiles accurately represent professional experience.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} className="rounded border border-[#e0e3d9] px-4 py-2.5 text-xs font-semibold">Back</button>
        <button type="button" onClick={onContinue} className="rounded bg-[#263d21] px-4 py-2.5 text-xs font-semibold text-white">Continue to review</button>
      </div>
    </fieldset>
  );
}

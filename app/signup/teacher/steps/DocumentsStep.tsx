type DocumentsStepProps = {
  hidden: boolean;
  onBack: () => void;
  onContinue: () => void;
};

const documents = [
  { name: "Degree certificate", fieldName: "degree_certificate", hint: "PDF, JPG or PNG · up to 10 MB", accept: ".pdf,image/jpeg,image/png", required: true },
  { name: "CV or résumé", fieldName: "cv", hint: "Optional · PDF, DOC, DOCX · up to 10 MB", accept: ".pdf,.doc,.docx", required: false },
];

export default function DocumentsStep({ hidden, onBack, onContinue }: DocumentsStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">Legal name on documents
          <input required name="documentName" placeholder="Enter name as shown on your certificates" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
          <span className="mt-1 block text-[0.5rem] font-normal text-[#84907a]">Must match your degree or educational credentials</span>
        </label>
        <p className="rounded bg-[#f0f1e9] p-3 text-[0.55rem] text-[#6c7469]">Before uploading, ensure your credentials are clear, readable, and in PDF or image format.</p>
      </div>
      <p className="rounded border border-[#dfe5d8] bg-[#edf2e8] px-3 py-2 text-[0.55rem] text-[#52644a]">
        Your documents are securely encrypted and reviewed solely for instructor verification.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {documents.map((document) => (
          <label key={document.fieldName} className="block rounded border border-dashed border-[#cbd5c1] bg-white p-3 text-[0.6rem] dark:border-white/15 dark:bg-white/5">
            <span className="font-semibold">{document.name} {document.required ? <span className="text-red-500">*</span> : <span className="font-normal text-[#84907a]">(Optional)</span>}</span>
            <span className="mt-1 block text-[0.5rem] text-[#84907a]">{document.hint}</span>
            <input required={document.required} type="file" name={document.fieldName} accept={document.accept} className="mt-2 block w-full text-[0.55rem]" />
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

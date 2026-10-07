type ProfileStepProps = {
  hidden: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export default function ProfileStep({ hidden, onBack, onContinue }: ProfileStepProps) {
  return (
    <fieldset hidden={hidden} className="space-y-3 border-0 p-0">
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <label className="flex items-center gap-3 text-[0.65rem] font-medium">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf2e8] text-lg text-[#526d43]">◉</span>
          <span>Profile photo
            <input type="file" name="profilePhoto" accept="image/*" className="mt-1 block w-full text-[0.55rem] font-normal" />
            <span className="mt-1 block text-[0.5rem] font-normal text-[#84907a]">JPG or PNG, up to 5 MB</span>
          </span>
        </label>
        <div className="rounded bg-[#f0f1e9] p-3 text-[0.55rem]">
          <p className="font-semibold uppercase text-[#687c50]">Profile preview</p>
          <p className="mt-1 font-semibold">Your display name</p>
          <p className="mt-1 text-[#6c7469]">Your short teaching introduction appears here.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">Professional headline
          <input name="headline" placeholder="Biology educator & curriculum designer" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">Years of experience
          <select name="experience" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#10140f]">
            <option value="" disabled>Select experience</option><option>0–2 years</option><option>3–5 years</option><option>6–10 years</option><option>10+ years</option>
          </select>
        </label>
      </div>
      <label className="block text-[0.65rem] font-medium">Short bio
        <textarea name="bio" rows={3} maxLength={500} placeholder="Tell learners about your teaching approach and experience." className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
      </label>
      <label className="block text-[0.65rem] font-medium">Subjects &amp; expertise
        <input name="subjects" placeholder="Biology, Life sciences, Lab skills" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[0.65rem] font-medium">Education level taught
          <select name="educationLevel" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#10140f]">
            <option value="" disabled>Select education level</option><option>Primary school</option><option>Secondary / High school</option><option>University</option><option>Adult education</option>
          </select>
        </label>
        <label className="block text-[0.65rem] font-medium">Languages
          <input name="languages" placeholder="English, Mandarin" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">Current institution or employer
          <input name="institution" placeholder="School or organization" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">Teaching mode
          <select name="teachingMode" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#10140f]">
            <option value="" disabled>Select teaching mode</option><option>Live online · Small groups</option><option>Live online · One-to-one</option><option>In person</option><option>Online and in person</option>
          </select>
        </label>
        <label className="block text-[0.65rem] font-medium">Availability &amp; timezone
          <input name="availability" placeholder="Weekdays 16:00–20:00 · Pacific Time" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">Portfolio or LinkedIn <span className="font-normal text-[#84907a]">Optional</span>
          <input name="portfolio" type="url" placeholder="https://..." className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} className="rounded border border-[#e0e3d9] px-4 py-2.5 text-xs font-semibold">Back</button>
        <button type="button" onClick={onContinue} className="rounded bg-[#263d21] px-4 py-2.5 text-xs font-semibold text-white">Continue to documents</button>
      </div>
    </fieldset>
  );
}

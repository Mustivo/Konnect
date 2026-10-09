"use client";

type RoleSelectorProps = {
  role: "learner" | "teacher";
  onChange: (role: "learner" | "teacher") => void;
};

export default function RoleSelector({ role, onChange }: RoleSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">Choose your account role</legend>
      <div className="grid grid-cols-2 gap-2">
        {(["learner", "teacher"] as const).map((option) => (
          <label
            key={option}
            className={`flex min-h-[54px] cursor-pointer flex-col justify-center rounded border px-3 py-2 ${
              role === option
                ? "border-[#526d43] bg-[#edf2e8] ring-1 ring-[#526d43]/20 dark:bg-[#263d21]/40"
                : "border-[#e0e3d9] bg-white dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name="role"
              value={option}
              checked={role === option}
              onChange={() => onChange(option)}
            />
            <span className="text-xs font-semibold capitalize">{option}</span>
            <span className="mt-0.5 text-[0.55rem] leading-4 text-[#6c7469] dark:text-[#b0b8aa]">
              {option === "learner"
                ? "Join classes and track progress"
                : "Create and lead live classes"}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

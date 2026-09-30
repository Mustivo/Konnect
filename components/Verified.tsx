import { GraduationCap, IdCard, MessageSquareText, ShieldCheck } from "lucide-react";

const checks = [
  { icon: IdCard, label: "ID Authenticated" },
  { icon: GraduationCap, label: "Degree Verified" },
  { icon: MessageSquareText, label: "Peer Interviewed" },
];

export default function Verified() {
  return (
    <section className="section verified">
      <span className="shield">
        <ShieldCheck size={16} />
      </span>
      <h2>
        Every teacher is verified.
        <br />
        Every time.
      </h2>
      <p className="lead">
        No fake tutors, no scams. Each teacher is reviewed and approved before
        they can teach a single class.
      </p>

      <ul className="checks">
        {checks.map(({ icon: Icon, label }) => (
          <li key={label}>
            <Icon size={14} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

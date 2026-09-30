const steps = [
  {
    title: "Sign up as a learner or teacher.",
    text: "Create your tailored profile in less than 2 minutes.",
  },
  {
    title: "Join or create a class.",
    text: "Find topics you love or launch your own interactive syllabus.",
  },
  {
    title: "Learn, teach, and grow.",
    text: "Collaborate with high-impact tools, live feedback, and real metrics.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section how">
      <h2>How it works.</h2>
      <p className="lead">
        A seamless flow designed to get you studying or lecturing without
        tedious friction.
      </p>

      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.title} className="card step">
            <span className="step__num">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

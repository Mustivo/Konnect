import Link from "next/link";
import { Star } from "lucide-react";

const avatars = ["ML", "RK", "SA"];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__copy">
        <h1>
          Learn together,
          <br />
          anywhere.
        </h1>
        <p>
          Engaging live classes, verified educators, and authentic progress
          tracking built for real achievement.
        </p>
        <Link href="/signup" className="btn">
          Get Started
        </Link>

        <div className="hero__proof">
          <div className="avatars" aria-hidden="true">
            {avatars.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="hero__proof-text">
            <span className="rating">
              <Star size={10} fill="currentColor" /> 4.9/5
            </span>
            <span>Over 12,000 verified hours taught</span>
          </div>
        </div>
      </div>

      <div className="hero__photo">
        {/* Put your photo at /public/hero.jpg */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt="A smiling learner wearing headphones, studying on a laptop"
        />
      </div>
    </section>
  );
}

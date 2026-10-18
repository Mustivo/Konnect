"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/learner/tasks/assignment");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-5 animate-spin rounded-full border-2 border-[#405b35] border-t-transparent" />
    </div>
  );
}

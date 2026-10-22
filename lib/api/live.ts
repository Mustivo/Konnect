export type LiveParticipant = {
  id: string;
  name: string;
  role: "teacher" | "learner" | string;
  status?: "active" | "left" | string;
  joined_at?: string;
  left_at?: string;
  duration_minutes?: number;
  attendance_status?: string;
};

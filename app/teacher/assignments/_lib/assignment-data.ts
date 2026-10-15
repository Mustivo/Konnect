export type ActivityKind = "In-Class" | "Quizzes" | "Homework";
export type AssignmentStatus = "Scheduled" | "Review" | "Graded";

export type TeacherAssignment = {
  id: number;
  title: string;
  className: string;
  due: string;
  submitted: string;
  status: AssignmentStatus;
  kind: ActivityKind;
};

export const classOptions = [
  "Algebra I · Class A",
  "Algebra I · Class B",
  "Geometry · Class C",
];

export const activityKinds: ActivityKind[] = ["In-Class", "Quizzes", "Homework"];

export const initialAssignments: TeacherAssignment[] = [
  { id: 1, title: "Linear Equations Practice", className: classOptions[0], due: "14 Oct 2026", submitted: "0/28", status: "Scheduled", kind: "In-Class" },
  { id: 2, title: "Equations with Brackets", className: classOptions[0], due: "09 Oct 2026", submitted: "27/28", status: "Review", kind: "In-Class" },
  { id: 3, title: "Two-step Equations", className: classOptions[0], due: "07 Oct 2026", submitted: "28/28", status: "Graded", kind: "In-Class" },
  { id: 4, title: "Balancing Equations", className: classOptions[0], due: "06 Oct 2026", submitted: "28/28", status: "Graded", kind: "In-Class" },
  { id: 5, title: "Expressions & Substitution", className: classOptions[0], due: "02 Oct 2026", submitted: "26/28", status: "Graded", kind: "In-Class" },
  { id: 6, title: "Algebra Foundations Check", className: classOptions[0], due: "16 Oct 2026", submitted: "4/28", status: "Scheduled", kind: "Quizzes" },
  { id: 7, title: "Factors and Multiples", className: classOptions[1], due: "18 Oct 2026", submitted: "0/30", status: "Scheduled", kind: "Homework" },
  { id: 8, title: "Coordinate Plane Review", className: classOptions[2], due: "20 Oct 2026", submitted: "0/25", status: "Scheduled", kind: "In-Class" },
];

export const feedbackItems = [
  { id: "oliver", name: "Oliver James", submitted: "09 Oct · 09:42" },
  { id: "david", name: "David Peter", submitted: "09 Oct · 09:45" },
  { id: "lilly", name: "Lilly Paul", submitted: "09 Oct · 09:47" },
];

export const questions = [
  {
    title: "Solve and check",
    prompt: "Solve the equation below. Show your working, then substitute your answer to check it.",
    expression: "3(2x − 4) = 4x + 10",
  },
  {
    title: "Find the value",
    prompt: "Collect like terms and solve for the unknown.",
    expression: "5x + 7 = 2x + 22",
  },
  {
    title: "Show your working",
    prompt: "Expand the brackets, then write your answer in simplest form.",
    expression: "2(3y + 4) = 20",
  },
];

const assignmentStatusClasses: Record<AssignmentStatus, string> = {
  Scheduled: "bg-[#e6f1ff] text-[#3475b9]",
  Review: "bg-[#fff0e2] text-[#b96d27]",
  Graded: "bg-[#e7f2e2] text-[#527846]",
};

export const getAssignmentStatusClass = (status: AssignmentStatus) =>
  assignmentStatusClasses[status];

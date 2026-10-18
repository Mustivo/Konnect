"use client";

import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Mail,
  MoreVertical,
  Award,
  Flag,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  BookOpen
} from "lucide-react";

type StudentRecord = {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  className: string;
  gradeLevel: string;
  attendancePct: number;
  gradePct: number;
  status: "Honor Roll" | "Good Standing" | "Needs Attention";
  hasFlag: boolean;
  flagReason?: string;
  flagSeverity?: "low" | "medium" | "high";
  initials: string;
  avatarBg: string;
  avatarText: string;
  recentSubmission: string;
  recentScore: string;
};

const initialStudents: StudentRecord[] = [
  {
    id: "stu-steven",
    name: "Steven Mwizerwa",
    email: "stevenmwizerwa1@gmail.com",
    studentNumber: "STU-100000",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 12",
    attendancePct: 98.8,
    gradePct: 97.4,
    status: "Honor Roll",
    hasFlag: false,
    initials: "SM",
    avatarBg: "bg-[#e5efdf]",
    avatarText: "text-[#2e4726]",
    recentSubmission: "Full Stack Web & Python Final Project",
    recentScore: "98 / 100 (98%)",
  },
  {
    id: "stu-1",
    name: "Alice Umutoni",
    email: "learner.alice@konnect.com",
    studentNumber: "STU-100001",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 12",
    attendancePct: 98.2,
    gradePct: 96.5,
    status: "Honor Roll",
    hasFlag: false,
    initials: "AU",
    avatarBg: "bg-[#eaf0e3]",
    avatarText: "text-[#2e4726]",
    recentSubmission: "In-Class Live Quiz: Python Core Types",
    recentScore: "20 / 20 (100%)",
  },
  {
    id: "stu-2",
    name: "Bob Kagame",
    email: "learner.bob@konnect.com",
    studentNumber: "STU-100002",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 11",
    attendancePct: 84.5,
    gradePct: 72.0,
    status: "Needs Attention",
    hasFlag: true,
    flagReason: "Arrived 20 minutes late to live session 1",
    flagSeverity: "medium",
    initials: "BK",
    avatarBg: "bg-[#fef3c7]",
    avatarText: "text-[#92400e]",
    recentSubmission: "In-Class Live Quiz: Python Core Types",
    recentScore: "14 / 20 (70%)",
  },
  {
    id: "stu-3",
    name: "Oliver James",
    email: "oliver.james@konnect.com",
    studentNumber: "STU-100003",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 12",
    attendancePct: 96.0,
    gradePct: 92.5,
    status: "Honor Roll",
    hasFlag: false,
    initials: "OJ",
    avatarBg: "bg-[#e0f2fe]",
    avatarText: "text-[#0369a1]",
    recentSubmission: "OOP & Function Scopes Lab",
    recentScore: "95 / 100 (95%)",
  },
  {
    id: "stu-4",
    name: "Mia Davis",
    email: "mia.davis@konnect.com",
    studentNumber: "STU-100004",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 11",
    attendancePct: 78.0,
    gradePct: 61.5,
    status: "Needs Attention",
    hasFlag: true,
    flagReason: "Struggling with conditional recursion logic",
    flagSeverity: "high",
    initials: "MD",
    avatarBg: "bg-[#fee2e2]",
    avatarText: "text-[#991b1b]",
    recentSubmission: "In-Class Live Quiz: Python Core Types",
    recentScore: "11 / 20 (55%)",
  },
  {
    id: "stu-5",
    name: "David Peter",
    email: "david.peter@konnect.com",
    studentNumber: "STU-100005",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 12",
    attendancePct: 93.5,
    gradePct: 88.0,
    status: "Good Standing",
    hasFlag: false,
    initials: "DP",
    avatarBg: "bg-[#ede9fe]",
    avatarText: "text-[#5b21b6]",
    recentSubmission: "OOP & Function Scopes Lab",
    recentScore: "88 / 100 (88%)",
  },
  {
    id: "stu-6",
    name: "Ethan Brown",
    email: "ethan.brown@konnect.com",
    studentNumber: "STU-100006",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 11",
    attendancePct: 85.0,
    gradePct: 65.0,
    status: "Needs Attention",
    hasFlag: true,
    flagReason: "Missed homework deadline 2 days ago",
    flagSeverity: "low",
    initials: "EB",
    avatarBg: "bg-[#ffedd5]",
    avatarText: "text-[#9a3412]",
    recentSubmission: "In-Class Live Quiz: Python Core Types",
    recentScore: "13 / 20 (65%)",
  },
  {
    id: "stu-7",
    name: "Lilly Paul",
    email: "lilly.paul@konnect.com",
    studentNumber: "STU-100007",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 12",
    attendancePct: 97.0,
    gradePct: 91.0,
    status: "Honor Roll",
    hasFlag: false,
    initials: "LP",
    avatarBg: "bg-[#f3e8ff]",
    avatarText: "text-[#6b21a8]",
    recentSubmission: "OOP & Function Scopes Lab",
    recentScore: "92 / 100 (92%)",
  },
  {
    id: "stu-8",
    name: "Lucas Martin",
    email: "lucas.martin@konnect.com",
    studentNumber: "STU-100008",
    className: "Introduction to Python & Web Systems",
    gradeLevel: "Grade 11",
    attendancePct: 82.0,
    gradePct: 76.5,
    status: "Good Standing",
    hasFlag: false,
    initials: "LM",
    avatarBg: "bg-[#e2e8f0]",
    avatarText: "text-[#334155]",
    recentSubmission: "OOP & Function Scopes Lab",
    recentScore: "78 / 100 (78%)",
  },
];

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [flagFilter, setFlagFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState("");
  const [flagSeverityInput, setFlagSeverityInput] = useState<"low" | "medium" | "high">("medium");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      const matchFlag =
        flagFilter === "All" ||
        (flagFilter === "Flagged" && s.hasFlag) ||
        (flagFilter === "Clear" && !s.hasFlag);

      return matchSearch && matchStatus && matchFlag;
    });
  }, [students, search, statusFilter, flagFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const avgAttendance = (
      students.reduce((acc, s) => acc + s.attendancePct, 0) / total
    ).toFixed(1);
    const avgGrade = (
      students.reduce((acc, s) => acc + s.gradePct, 0) / total
    ).toFixed(1);
    const flaggedCount = students.filter((s) => s.hasFlag).length;

    return { total, avgAttendance, avgGrade, flaggedCount };
  }, [students]);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Student ID", "Class", "Grade Level", "Attendance %", "Grade %", "Status", "Flagged", "Flag Reason"];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.email,
      s.studentNumber,
      s.className,
      s.gradeLevel,
      `${s.attendancePct}%`,
      `${s.gradePct}%`,
      s.status,
      s.hasFlag ? "YES" : "NO",
      s.flagReason || "None",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_roster_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Students roster exported to CSV successfully");
  };

  const handleAddFlag = (student: StudentRecord) => {
    setSelectedStudent(student);
    setFlagReasonInput(student.flagReason || "");
    setFlagSeverityInput(student.flagSeverity || "medium");
    setShowFlagModal(true);
  };

  const handleSaveFlag = () => {
    if (!selectedStudent || !flagReasonInput.trim()) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              hasFlag: true,
              flagReason: flagReasonInput.trim(),
              flagSeverity: flagSeverityInput,
              status: "Needs Attention",
            }
          : s
      )
    );
    setShowFlagModal(false);
    showToast(`Flag recorded for ${selectedStudent.name}`);
  };

  const handleClearFlag = (id: string, name: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              hasFlag: false,
              flagReason: undefined,
              flagSeverity: undefined,
              status: s.gradePct >= 90 ? "Honor Roll" : "Good Standing",
            }
          : s
      )
    );
    if (selectedStudent?.id === id) {
      setSelectedStudent((prev) => (prev ? { ...prev, hasFlag: false, flagReason: undefined } : null));
    }
    showToast(`Flag resolved for ${name}`);
  };

  return (
    <DashboardShell role="teacher">
      <div className="space-y-5 pb-8 pt-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#172115] px-4 py-2.5 text-[12px] font-medium text-white shadow-xl dark:bg-[#ecf1ea] dark:text-[#172115]">
            <CheckCircle2 size={16} className="text-[#8ca47e]" />
            {toastMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-md bg-[#edf2e8] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Teacher Portal
              </span>
              <span className="text-[12px] text-[#707c6c]">•</span>
              <span className="text-[12px] font-medium text-[#707c6c] dark:text-[#9aa592]">
                Active Class: Introduction to Python (PY101)
              </span>
            </div>
            <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#172115] dark:text-[#ecf1ea]">
              Students Roster
            </h1>
            <p className="mt-1 text-[13px] text-[#556350] dark:text-[#9aa592]">
              Monitor learner attendance, grade milestones, and flag students requiring early academic intervention.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e2e7dd] bg-white px-3.5 text-[12px] font-medium text-[#35522b] shadow-sm hover:bg-[#f4f7f2] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#c5d6b8] dark:hover:bg-[#1d291b]"
            >
              <Download size={15} />
              Export Roster
            </button>
          </div>
        </div>

        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Enrolled Students</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#edf2e8] text-[#35522b] dark:bg-[#222f1e] dark:text-[#c5d6b8]">
                <Users size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">{stats.total}</p>
            <p className="mt-2 text-[11px] text-[#7b8775] dark:text-[#9aa592]">
              <span className="font-semibold text-[#35522b] dark:text-[#a1b894]">100% capacity</span> across PY101
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Avg. Attendance</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#e0f2fe] text-[#0369a1] dark:bg-[#1e293b] dark:text-[#38bdf8]">
                <UserCheck size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">{stats.avgAttendance}%</p>
            <p className="mt-2 text-[11px] text-[#7b8775] dark:text-[#9aa592]">
              <span className="font-semibold text-[#0369a1] dark:text-[#38bdf8]">↑ 2.4%</span> vs last term
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Class Grade Average</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#2e1065] dark:text-[#c084fc]">
                <GraduationCap size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">{stats.avgGrade}%</p>
            <p className="mt-2 text-[11px] text-[#7b8775] dark:text-[#9aa592]">
              <span className="font-semibold text-[#7e22ce] dark:text-[#c084fc]">B+ Grade</span> performance
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Attention Required</span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#fef3c7] text-[#b45309] dark:bg-[#3d2605] dark:text-[#fde68a]">
                <AlertTriangle size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">{stats.flaggedCount}</p>
            <p className="mt-2 text-[11px] text-[#7b8775] dark:text-[#9aa592]">
              <span className="font-semibold text-[#b45309] dark:text-[#fde68a]">Active flags</span> pending action plan
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8775]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or student ID..."
              className="h-9 w-full rounded-lg border border-[#e2e7dd] bg-[#fbfcf9] pl-9 pr-3 text-[12px] text-[#172115] placeholder-[#8a9684] outline-none transition focus:border-[#35522b] focus:bg-white dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea] dark:focus:border-[#8ca47e]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="status-filter" className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-[#e2e7dd] bg-white px-2.5 text-[12px] text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
              >
                <option value="All">All Standing</option>
                <option value="Honor Roll">Honor Roll (90%+)</option>
                <option value="Good Standing">Good Standing</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="flag-filter" className="text-[12px] font-medium text-[#6c7866] dark:text-[#a4af9e]">
                Flags:
              </label>
              <select
                id="flag-filter"
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value)}
                className="h-9 rounded-lg border border-[#e2e7dd] bg-white px-2.5 text-[12px] text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
              >
                <option value="All">All Flags</option>
                <option value="Flagged">Flagged Only</option>
                <option value="Clear">Clear Standing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-hidden rounded-xl border border-[#e2e7dd] bg-white shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-[#edf0e9] bg-[#fbfcf9] text-[11px] font-bold uppercase tracking-wider text-[#6c7866] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#a4af9e]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Current Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Support Flags</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0e9] text-[12px] dark:divide-[#212f1f]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#7b8775] dark:text-[#9aa592]">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-[#fcfdfa] dark:hover:bg-[#1a2517]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${student.avatarBg} ${student.avatarText}`}
                          >
                            {student.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                            <p className="text-[11px] text-[#707c6c] dark:text-[#9aa592]">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#556350] dark:text-[#a4af9e]">
                        {student.studentNumber}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-[#e8ece4] dark:bg-[#253322]">
                            <div
                              className={`h-full rounded-full ${
                                student.attendancePct >= 90
                                  ? "bg-[#35522b]"
                                  : student.attendancePct >= 80
                                  ? "bg-[#38bdf8]"
                                  : "bg-[#eab308]"
                              }`}
                              style={{ width: `${student.attendancePct}%` }}
                            />
                          </div>
                          <span className="font-medium text-[#172115] dark:text-[#ecf1ea]">
                            {student.attendancePct}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#172115] dark:text-[#ecf1ea]">
                          {student.gradePct}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            student.status === "Honor Roll"
                              ? "bg-[#edf2e8] text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]"
                              : student.status === "Good Standing"
                              ? "bg-[#f0f9ff] text-[#0369a1] dark:bg-[#1e293b] dark:text-[#38bdf8]"
                              : "bg-[#fef2f2] text-[#b91c1c] dark:bg-[#450a0a] dark:text-[#fca5a5]"
                          }`}
                        >
                          {student.status === "Honor Roll" && <Award size={12} />}
                          {student.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {student.hasFlag ? (
                          <div className="flex items-center gap-1.5 text-[#b45309] dark:text-[#fde68a]">
                            <Flag size={13} className="shrink-0 text-[#b45309]" />
                            <span className="max-w-[170px] truncate text-[11px] font-medium" title={student.flagReason}>
                              {student.flagReason}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#85917f] dark:text-[#84947d]">
                            <CheckCircle2 size={13} className="text-[#35522b]" />
                            Clear
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            type="button"
                            className="rounded-md border border-[#e2e7dd] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#35522b] hover:bg-[#f4f7f2] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#c5d6b8]"
                          >
                            Details
                          </button>
                          {student.hasFlag ? (
                            <button
                              onClick={() => handleClearFlag(student.id, student.name)}
                              type="button"
                              className="rounded-md bg-[#edf2e8] px-2 py-1 text-[11px] font-medium text-[#35522b] hover:bg-[#e2eadb] dark:bg-[#222f1e] dark:text-[#c5d6b8]"
                              title="Resolve Flag"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFlag(student)}
                              type="button"
                              className="rounded-md bg-[#fff7ed] px-2 py-1 text-[11px] font-medium text-[#c2410c] hover:bg-[#ffedd5] dark:bg-[#3f210e] dark:text-[#fdba74]"
                              title="Flag student for intervention"
                            >
                              Flag
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Detail Slide-out / Modal */}
        {selectedStudent && !showFlagModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-[#e2e7dd] bg-white p-6 shadow-2xl dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-12 place-items-center rounded-full text-[15px] font-bold ${selectedStudent.avatarBg} ${selectedStudent.avatarText}`}
                  >
                    {selectedStudent.initials}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-[12px] text-[#707c6c] dark:text-[#9aa592]">{selectedStudent.email}</p>
                    <p className="mt-0.5 text-[11px] font-mono text-[#556350] dark:text-[#8ba282]">
                      ID: {selectedStudent.studentNumber} · {selectedStudent.gradeLevel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  type="button"
                  className="rounded-lg p-1 text-[#707c6c] hover:bg-[#f4f7f2] dark:hover:bg-[#1e2a1b]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#e8ece4] bg-[#fbfcf9] p-3 dark:border-[#212f1f] dark:bg-[#111910]">
                  <p className="text-[11px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Attendance Rate</p>
                  <p className="mt-1 text-[20px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                    {selectedStudent.attendancePct}%
                  </p>
                  <p className="text-[10px] text-[#7b8775]">Based on 14 recorded sessions</p>
                </div>
                <div className="rounded-xl border border-[#e8ece4] bg-[#fbfcf9] p-3 dark:border-[#212f1f] dark:bg-[#111910]">
                  <p className="text-[11px] font-medium text-[#6c7866] dark:text-[#a4af9e]">Overall Grade</p>
                  <p className="mt-1 text-[20px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                    {selectedStudent.gradePct}%
                  </p>
                  <p className="text-[10px] text-[#7b8775]">Status: {selectedStudent.status}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#e8ece4] bg-[#fbfcf9] p-3.5 dark:border-[#212f1f] dark:bg-[#111910]">
                <p className="text-[11px] font-semibold text-[#6c7866] dark:text-[#a4af9e]">Latest Submission</p>
                <p className="mt-1 text-[13px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                  {selectedStudent.recentSubmission}
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#35522b] dark:text-[#a1b894]">
                  Score: {selectedStudent.recentScore}
                </p>
              </div>

              {selectedStudent.hasFlag && (
                <div className="mt-4 rounded-xl border border-[#fed7aa] bg-[#fffbeb] p-3.5 dark:border-[#7c2d12] dark:bg-[#431407]">
                  <div className="flex items-center gap-2 text-[#b45309] dark:text-[#fde68a]">
                    <AlertTriangle size={15} />
                    <p className="text-[12px] font-bold">Academic / Behavioral Intervention Flag</p>
                  </div>
                  <p className="mt-1 text-[12px] text-[#92400e] dark:text-[#fed7aa]">{selectedStudent.flagReason}</p>
                  <button
                    onClick={() => handleClearFlag(selectedStudent.id, selectedStudent.name)}
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#fef3c7] px-2.5 py-1 text-[11px] font-bold text-[#92400e] hover:bg-[#fde68a] dark:bg-[#78350f] dark:text-[#fef3c7]"
                  >
                    Mark Flag as Resolved
                  </button>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-[#edf0e9] pt-4 dark:border-[#212f1f]">
                <button
                  onClick={() => handleAddFlag(selectedStudent)}
                  type="button"
                  className="rounded-lg border border-[#e2e7dd] px-3 py-1.5 text-[12px] font-medium text-[#c2410c] hover:bg-[#fff7ed] dark:border-[#212f1f] dark:hover:bg-[#2b160b]"
                >
                  Edit / Add Flag
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  type="button"
                  className="rounded-lg bg-[#35522b] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2c4424]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flag Intervention Modal */}
        {showFlagModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-2xl dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                  Student Support Flag: {selectedStudent.name}
                </h3>
                <button
                  onClick={() => setShowFlagModal(false)}
                  type="button"
                  className="rounded-lg p-1 text-[#707c6c] hover:bg-[#f4f7f2]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="flag-reason-input" className="block text-[12px] font-medium text-[#556350] dark:text-[#a4af9e]">
                    Reason for Flag / Academic Concern:
                  </label>
                  <textarea
                    id="flag-reason-input"
                    value={flagReasonInput}
                    onChange={(e) => setFlagReasonInput(e.target.value)}
                    rows={3}
                    placeholder="e.g. Arrived 20 mins late, missed quiz, or requires 1-on-1 coaching..."
                    className="mt-1 w-full rounded-lg border border-[#e2e7dd] p-2.5 text-[12px] text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
                  />
                </div>

                <div>
                  <label htmlFor="flag-severity-select" className="block text-[12px] font-medium text-[#556350] dark:text-[#a4af9e]">
                    Intervention Severity:
                  </label>
                  <select
                    id="flag-severity-select"
                    value={flagSeverityInput}
                    onChange={(e) => setFlagSeverityInput(e.target.value as "low" | "medium" | "high")}
                    className="mt-1 w-full rounded-lg border border-[#e2e7dd] p-2 text-[12px] text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
                  >
                    <option value="low">Low (Friendly Reminder)</option>
                    <option value="medium">Medium (Attendance / Homework Warning)</option>
                    <option value="high">High (Academic Risk / Parent Notification)</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#edf0e9] pt-3.5 dark:border-[#212f1f]">
                <button
                  onClick={() => setShowFlagModal(false)}
                  type="button"
                  className="rounded-lg border border-[#e2e7dd] px-3 py-1.5 text-[12px] font-medium text-[#6c7866] hover:bg-[#f4f7f2]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFlag}
                  type="button"
                  className="rounded-lg bg-[#35522b] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2c4424]"
                >
                  Save Flag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

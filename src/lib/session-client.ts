const STUDENT_KEY = "moibank.studentToken";
const TEACHER_KEY = "moibank.teacherToken";

export function getToken(role: "student" | "teacher"): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(role === "student" ? STUDENT_KEY : TEACHER_KEY) ?? "";
}

export function setToken(role: "student" | "teacher", token: string) {
  localStorage.setItem(role === "student" ? STUDENT_KEY : TEACHER_KEY, token);
}

export function clearToken(role: "student" | "teacher") {
  localStorage.removeItem(role === "student" ? STUDENT_KEY : TEACHER_KEY);
}

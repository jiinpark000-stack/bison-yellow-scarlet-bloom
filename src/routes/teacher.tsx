import { createFileRoute } from "@tanstack/react-router";
import { TeacherApp } from "@/components/teacher-app";

export const Route = createFileRoute("/teacher")({ component: TeacherPage });

function TeacherPage() {
  return <TeacherApp />;
}

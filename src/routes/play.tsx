import { createFileRoute } from "@tanstack/react-router";
import { StudentApp } from "@/components/student-app";

export const Route = createFileRoute("/play")({ component: PlayPage });

function PlayPage() {
  return <StudentApp />;
}

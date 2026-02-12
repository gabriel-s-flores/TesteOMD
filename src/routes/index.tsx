import { createFileRoute, redirect } from "@tanstack/react-router";
import { IndexComponent } from "../components/pages/IndexComponent";
import { authService } from "../services/authService";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!authService.getCurrentUserSync()) {
      throw redirect({ to: "/login" });
    }
  },
  component: IndexComponent,
});

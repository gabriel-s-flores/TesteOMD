import { createFileRoute, redirect } from "@tanstack/react-router";
import { RegisterPage } from "../components/pages/RegisterPage";
import { authService } from "../services/authService";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (authService.getCurrentUserSync()) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../components/pages/LoginPage";
import { authService } from "../services/authService";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (authService.getCurrentUserSync()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

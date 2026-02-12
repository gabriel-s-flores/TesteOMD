import { createFileRoute, redirect } from "@tanstack/react-router";
import { ForgotPasswordPage } from "../components/pages/ForgotPasswordPage";
import { authService } from "../services/authService";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: () => {
    if (authService.getCurrentUserSync()) {
      throw redirect({ to: "/" });
    }
  },
  component: ForgotPasswordPage,
});

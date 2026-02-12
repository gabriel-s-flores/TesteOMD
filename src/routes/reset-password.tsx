import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResetPasswordPage } from "../components/pages/ResetPasswordPage";
import { authService } from "../services/authService";

export const Route = createFileRoute("/reset-password")({
  beforeLoad: () => {
    if (authService.getCurrentUserSync()) {
      throw redirect({ to: "/" });
    }
  },
  component: ResetPasswordPage,
});

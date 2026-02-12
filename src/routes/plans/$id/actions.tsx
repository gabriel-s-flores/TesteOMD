import { createFileRoute, redirect } from "@tanstack/react-router";
import { ActionsManagerPage } from "../../../components/pages/ActionsManagerPage";
import { authService } from "../../../services/authService";

export const Route = createFileRoute("/plans/$id/actions")({
  beforeLoad: () => {
    if (!authService.getCurrentUserSync()) {
      throw redirect({ to: "/login" });
    }
  },
  component: ActionsManagerPage,
});

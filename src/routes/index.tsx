import { createFileRoute } from "@tanstack/react-router";
import { IndexComponent } from "../components/pages/IndexComponent";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

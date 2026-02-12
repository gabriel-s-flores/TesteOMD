import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex justify-end px-4 py-2">
          <LanguageSwitcher />
        </div>
      </div>
      <Outlet />
    </div>
  );
}

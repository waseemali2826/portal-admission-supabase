import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main role="main" className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

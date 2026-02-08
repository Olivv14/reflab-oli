import { Outlet } from "react-router-dom";

/**
 * Main layout wrapper for the protected app area.
 * Since Layout.tsx handles the Header, Sidebar, and BottomNav globally,
 * this component now focuses on the content area styling for the app.
 */
export default function AppShell() {
  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <Outlet />
    </div>
  );
}

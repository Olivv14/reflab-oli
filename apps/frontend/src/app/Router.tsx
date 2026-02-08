import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import LandingPage from "@/features/landing/components/LandingPage";
import ResetPassword from "@/features/auth/components/ResetPassword";
import DashboardPage from "@/features/dashboard/components/DashboardPage";
import TestsList from "@/features/tests/components/TestsList";
import LearnPage from "@/features/learn/components/LearnPage";
import TestPage from "@/features/learn/components/TestPage";
import NotificationsPage from "@/features/notifications/components/NotificationsPage";
import CommunityPage from "@/features/dashboard/components/CommunityPage";
import LeaderboardPage from "@/features/leaderboard/components/LeaderboardPage";
import ProfilePage from "@/features/profile/components/ProfilePage";
import EditProfilePage from "../features/profile/components/EditProfilePage";
import RequireAuth from "./RequireAuth";
import RequireGuest from "./RequireGuest";
import AppShell from "./AppShell";

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes - landing page only for non-authenticated users */}
        <Route path="/" element={<RequireGuest><LandingPage /></RequireGuest>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes - wrapped in auth check and app layout */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          {/* /app shows dashboard by default */}
          <Route index element={<DashboardPage />} />
          {/* /app/dashboard also shows dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* /app/tests shows tests list */}
          <Route path="tests" element={<TestsList />} />
          {/* /app/learn shows the learn page with tabs */}
          <Route path="learn" element={<LearnPage />} />
          {/* /app/learn/test/:slug shows the test-taking page */}
          <Route path="learn/test/:slug" element={<TestPage />} />
          {/* /app/notifications shows user notifications */}
          <Route path="notifications" element={<NotificationsPage />} />
          {/* /app/community shows community posts */}
          <Route path="community" element={<CommunityPage />} />
          {/* /app/leaderboards shows rankings */}
          <Route path="leaderboards" element={<LeaderboardPage />} />
          {/* /app/profile shows user profile */}
          <Route path="profile" element={<ProfilePage />} />
          {/* /app/profile/edit shows edit profile form */}
          <Route path="profile/edit" element={<EditProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

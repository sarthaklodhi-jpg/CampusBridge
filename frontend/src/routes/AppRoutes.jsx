import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import CollegeFeedPage from "../pages/CollegeFeedPage";
import PublicFeedPage from "../pages/PublicFeedPage";
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import SavedPostsPage from "../pages/SavedPostsPage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import OnboardingPage from "../pages/OnboardingPage";
import CreateCollegePage from "../pages/CreateCollegePage";
import JoinCollegePage from "../pages/JoinCollegePage";
import CollegeManagementPage from "../pages/CollegeManagementPage";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import ResourcesPage from "../pages/ResourcesPage";
import EventsPage from "../pages/EventsPage";
import ModerationPage from "../pages/ModerationPage";
import AnalyticsPage from "../pages/AnalyticsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/college/create" element={<CreateCollegePage />} />
          <Route path="/college/join" element={<JoinCollegePage />} />
          <Route path="/join/:inviteCode" element={<JoinCollegePage />} />
          <Route path="/college/manage" element={<CollegeManagementPage />} />
          <Route path="/feed/college" element={<CollegeFeedPage />} />
          <Route path="/feed/public" element={<PublicFeedPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

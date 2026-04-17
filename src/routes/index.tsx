import { createBrowserRouter } from "react-router-dom";
import RouteGuard from "../components/RouteGuard";
import MainLayout from "../layouts/MainLayout";
import AboutPage from "../pages/AboutPage";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import AdminEventFormPage from "../pages/AdminEventFormPage";
import AdminEventsPage from "../pages/AdminEventsPage";
import AuthPage from "../pages/AuthPage";
import ContactPage from "../pages/ContactPage";
import EventDetailPage from "../pages/EventDetailPage";
import EventsPage from "../pages/EventsPage";
import HomePage from "../pages/HomePage";
import LegalNoticePage from "../pages/LegalNoticePage";
import MemberContentPage from "../pages/MemberContentPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfilePage from "../pages/ProfilePage";
import RgpdPage from "../pages/RgpdPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "a-propos", element: <AboutPage /> },
      { path: "evenements", element: <EventsPage /> },
      { path: "evenements/:slug", element: <EventDetailPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "mentions-legales", element: <LegalNoticePage /> },
      { path: "rgpd", element: <RgpdPage /> },
      { path: "connexion", element: <AuthPage /> },
      {
        path: "profil",
        element: (
          <RouteGuard>
            <ProfilePage />
          </RouteGuard>
        )
      },
      {
        path: "espace-membre",
        element: (
          <RouteGuard>
            <MemberContentPage />
          </RouteGuard>
        )
      },
      {
        path: "admin/evenements",
        element: (
          <RouteGuard allowedRoles={["admin", "organizer"]}>
            <AdminEventsPage />
          </RouteGuard>
        )
      },
      {
        path: "admin/evenements/nouveau",
        element: (
          <RouteGuard allowedRoles={["admin", "organizer"]}>
            <AdminEventFormPage />
          </RouteGuard>
        )
      },
      {
        path: "admin/evenements/:id/modifier",
        element: (
          <RouteGuard allowedRoles={["admin", "organizer"]}>
            <AdminEventFormPage />
          </RouteGuard>
        )
      },
      { path: "acces-refuse", element: <AccessDeniedPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);

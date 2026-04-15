import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/auth/AuthContext";
import { SessionActivity } from "@/auth/SessionActivity";
import { RequireAdmin, RequireInstructor, RequireParticipant } from "@/auth/RouteGuards";
import { ROUTES, LEGACY_REDIRECTS } from "@/constants/routes";

import AccessLoginPage from "@/pages/auth/AccessLoginPage";
import FirstAccessPage from "@/pages/auth/FirstAccessPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AccessDeniedPage from "@/pages/auth/AccessDeniedPage";
import SessionExpiredPage from "@/pages/auth/SessionExpiredPage";

import ParticipantLayout from "@/layouts/ParticipantLayout";
import ParticipantHomePage from "@/pages/participant/ParticipantHomePage";
import ParticipantCoursesPage from "@/pages/participant/ParticipantCoursesPage";
import ParticipantCourseDetailPage from "@/pages/participant/ParticipantCourseDetailPage";
import ParticipantEnrollmentFormPage from "@/pages/participant/ParticipantEnrollmentFormPage";
import ParticipantEnrollmentsPage from "@/pages/participant/ParticipantEnrollmentsPage";
import ParticipantEnrollmentDetailPage from "@/pages/participant/ParticipantEnrollmentDetailPage";
import ParticipantAttendancePage from "@/pages/participant/ParticipantAttendancePage";
import ParticipantQRCodePage from "@/pages/participant/ParticipantQRCodePage";
import ParticipantCertificatesPage from "@/pages/participant/ParticipantCertificatesPage";
import ParticipantCertificateViewPage from "@/pages/participant/ParticipantCertificateViewPage";
import ParticipantHistoryPage from "@/pages/participant/ParticipantHistoryPage";
import ParticipantProfilePage from "@/pages/participant/ParticipantProfilePage";

import InstructorLayout from "@/layouts/InstructorLayout";
import InstructorHomePage from "@/pages/instructor/InstructorHomePage";
import InstructorCoursesPage from "@/pages/instructor/InstructorCoursesPage";
import InstructorCourseDetailPage from "@/pages/instructor/InstructorCourseDetailPage";
import InstructorParticipantsPage from "@/pages/instructor/InstructorParticipantsPage";
import InstructorDocumentPage from "@/pages/instructor/InstructorDocumentPage";
import InstructorAttendancePage from "@/pages/instructor/InstructorAttendancePage";
import InstructorProfilePage from "@/pages/instructor/InstructorProfilePage";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";
import AdminCourseDetailPage from "@/pages/admin/AdminCourseDetailPage";
import AdminCourseEditPage from "@/pages/admin/AdminCourseEditPage";
import AdminValidationPage from "@/pages/admin/AdminValidationPage";
import AdminEnrollmentsPage from "@/pages/admin/AdminEnrollmentsPage";
import AdminEnrollmentDetailPage from "@/pages/admin/AdminEnrollmentDetailPage";
import AdminInstructorsPage from "@/pages/admin/AdminInstructorsPage";
import AdminInstructorDetailPage from "@/pages/admin/AdminInstructorDetailPage";
import AdminAttendancePage from "@/pages/admin/AdminAttendancePage";
import AdminCertificatesPage from "@/pages/admin/AdminCertificatesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/** Alinha rotas com `vite build --base /repositorio/` (ex.: GitHub Pages). */
const routerBasename = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || undefined;

function LegacyPortalCourse() {
  const { id } = useParams();
  return <Navigate to={ROUTES.portal.course(id!)} replace />;
}

function LegacyPortalEnroll() {
  const { id } = useParams();
  return <Navigate to={ROUTES.portal.enroll(id!)} replace />;
}

function LegacyEnrollmentDetail() {
  const { id } = useParams();
  return <Navigate to={ROUTES.portal.enrollment(id!)} replace />;
}

function LegacyEnrollmentQr() {
  const { id } = useParams();
  return <Navigate to={ROUTES.portal.qrcode(id!)} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter basename={routerBasename}>
          <SessionActivity />
          <Routes>
            <Route path={ROUTES.access.login} element={<AccessLoginPage />} />
            <Route path={ROUTES.access.firstAccess} element={<FirstAccessPage />} />
            <Route path={ROUTES.access.forgot} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.access.reset} element={<ResetPasswordPage />} />
            <Route path={ROUTES.access.denied} element={<AccessDeniedPage />} />
            <Route path={ROUTES.access.sessionExpired} element={<SessionExpiredPage />} />

            {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}
            <Route path="/cursos/:id" element={<LegacyPortalCourse />} />
            <Route path="/cursos/:id/inscricao" element={<LegacyPortalEnroll />} />
            <Route path="/inscricao/:id" element={<LegacyEnrollmentDetail />} />
            <Route path="/inscricao/:id/qrcode" element={<LegacyEnrollmentQr />} />

            <Route element={<RequireParticipant />}>
              <Route element={<ParticipantLayout />}>
                <Route path={ROUTES.portal.home} element={<ParticipantHomePage />} />
                <Route path={ROUTES.portal.courses} element={<ParticipantCoursesPage />} />
                <Route path="/portal/cursos/:id" element={<ParticipantCourseDetailPage />} />
                <Route path="/portal/cursos/:id/inscricao" element={<ParticipantEnrollmentFormPage />} />
                <Route path={ROUTES.portal.enrollments} element={<ParticipantEnrollmentsPage />} />
                <Route path="/portal/inscricoes/:id" element={<ParticipantEnrollmentDetailPage />} />
                <Route path="/portal/inscricoes/:id/presenca" element={<ParticipantAttendancePage />} />
                <Route path="/portal/inscricoes/:id/qrcode" element={<ParticipantQRCodePage />} />
                <Route path={ROUTES.portal.certificates} element={<ParticipantCertificatesPage />} />
                <Route path="/portal/certificados/:enrollmentId" element={<ParticipantCertificateViewPage />} />
                <Route path={ROUTES.portal.history} element={<ParticipantHistoryPage />} />
                <Route path={ROUTES.portal.profile} element={<ParticipantProfilePage />} />
              </Route>
            </Route>

            <Route element={<RequireInstructor />}>
              <Route element={<InstructorLayout />}>
                <Route path={ROUTES.instructor.home} element={<InstructorHomePage />} />
                <Route path={ROUTES.instructor.courses} element={<InstructorCoursesPage />} />
                <Route path="/instrutor/cursos/:id" element={<InstructorCourseDetailPage />} />
                <Route path="/instrutor/cursos/:id/participantes" element={<InstructorParticipantsPage />} />
                <Route path="/instrutor/cursos/:id/documento" element={<InstructorDocumentPage />} />
                <Route path="/instrutor/cursos/:id/presenca" element={<InstructorAttendancePage />} />
                <Route path={ROUTES.instructor.profile} element={<InstructorProfilePage />} />
              </Route>
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="cursos" element={<AdminCoursesPage />} />
                <Route path="cursos/novo" element={<AdminCourseEditPage />} />
                <Route path="cursos/:id" element={<AdminCourseDetailPage />} />
                <Route path="cursos/:id/editar" element={<AdminCourseEditPage />} />
                <Route path="validacao" element={<AdminValidationPage />} />
                <Route path="inscricoes" element={<AdminEnrollmentsPage />} />
                <Route path="inscricoes/:id" element={<AdminEnrollmentDetailPage />} />
                <Route path="instrutores" element={<AdminInstructorsPage />} />
                <Route path="instrutores/:id" element={<AdminInstructorDetailPage />} />
                <Route path="presenca" element={<AdminAttendancePage />} />
                <Route path="certificados" element={<AdminCertificatesPage />} />
                <Route path="relatorios" element={<AdminReportsPage />} />
                <Route path="configuracoes" element={<AdminSettingsPage />} />
                <Route path="usuarios" element={<AdminUsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { RouterProvider, useRouter, getPathOnly } from '@/lib/router';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChatWidget from '@/components/AIChatWidget';
import HomePage from '@/pages/HomePage';
import DoctorsPage from '@/pages/DoctorsPage';
import DoctorProfilePage from '@/pages/DoctorProfilePage';
import QuestionsPage from '@/pages/QuestionsPage';
import QuestionDetailPage from '@/pages/QuestionDetailPage';
import AskPage from '@/pages/AskPage';
import ArticlesPage from '@/pages/ArticlesPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import VideosPage from '@/pages/VideosPage';
import AudioPage from '@/pages/AudioPage';
import CoursesPage from '@/pages/CoursesPage';
import SessionsPage from '@/pages/SessionsPage';
import AdminPage from '@/pages/AdminPage';
import RegisterPage from '@/pages/RegisterPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import ChatRoomsPage from '@/pages/ChatRoomsPage';
import LibraryPage from '@/pages/LibraryPage';
import PlannerPage from '@/pages/PlannerPage';
import ClinicsPage from '@/pages/ClinicsPage';
import RadiologyPage from '@/pages/RadiologyPage';
import LabsPage from '@/pages/LabsPage';
import PolicyPage from '@/pages/PolicyPage';
import TestsPage from '@/pages/TestsPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import JobsPage from '@/pages/JobsPage';
import ReferralPage from '@/pages/ReferralPage';
import AIReaderPage from '@/pages/AIReaderPage';
import FavoritesPage from '@/pages/FavoritesPage';

function AppContent() {
  const { path } = useRouter();
  const route = getPathOnly(path);

  let page;
  if (route === '/') {
    page = <HomePage />;
  } else if (route === '/doctors') {
    page = <DoctorsPage />;
  } else if (route.startsWith('/doctors/')) {
    page = <DoctorProfilePage id={route.split('/')[2]} />;
  } else if (route === '/questions') {
    page = <QuestionsPage />;
  } else if (route.startsWith('/questions/')) {
    page = <QuestionDetailPage id={route.split('/')[2]} />;
  } else if (route === '/ask') {
    page = <AskPage />;
  } else if (route === '/articles') {
    page = <ArticlesPage />;
  } else if (route.startsWith('/articles/')) {
    page = <ArticleDetailPage id={route.split('/')[2]} />;
  } else if (route === '/videos') {
    page = <VideosPage />;
  } else if (route === '/audio') {
    page = <AudioPage />;
  } else if (route === '/courses') {
    page = <CoursesPage />;
  } else if (route === '/sessions') {
    page = <SessionsPage />;
  } else if (route === '/register') {
    page = <RegisterPage />;
  } else if (route === '/subscriptions') {
    page = <SubscriptionsPage />;
  } else if (route === '/chat') {
    page = <ChatRoomsPage />;
  } else if (route === '/library') {
    page = <LibraryPage />;
  } else if (route === '/planner') {
    page = <PlannerPage />;
  } else if (route === '/clinics') {
    page = <ClinicsPage />;
  } else if (route === '/radiology') {
    page = <RadiologyPage />;
  } else if (route === '/labs') {
    page = <LabsPage />;
  } else if (route === '/policy') {
    page = <PolicyPage />;
  } else if (route === '/tests') {
    page = <TestsPage />;
  } else if (route === '/facilities') {
    page = <FacilitiesPage />;
  } else if (route === '/jobs') {
    page = <JobsPage />;
  } else if (route === '/referral') {
    page = <ReferralPage />;
  } else if (route === '/ai-reader') {
    page = <AIReaderPage />;
  } else if (route === '/favorites') {
    page = <FavoritesPage />;
  } else if (route === '/admin') {
    page = <AdminPage />;
  } else {
    page = <HomePage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </I18nProvider>
  );
}

export default App;

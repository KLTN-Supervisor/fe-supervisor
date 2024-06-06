import AuthPage, { UnauthorizedPage, Error404Page } from "../pages/AuthPage";
import HomePage from "../pages/Supervisor/HomePage";
import ScheduleTodayPage from "../pages/Supervisor/ScheduleTodayPage";
import ExamSchedulePage from "../pages/Supervisor/ExamSchedulePage";
import SchedulePage from "../pages/Supervisor/ScheduleDetailPage";
import StudentSearchingPage from "../pages/Supervisor/StudentSearchingPage";
import PrintPage from "../pages/Supervisor/PrintPage";
import DashboardBody from "../components/Admin/AdminBody/Dashboard/Dashboard";
import UsersManage from "../components/Admin/AdminBody/UsersManager/Users";
import StudentsManage from "../components/Admin/AdminBody/StudentsManager/Students";
import InspectorsManage from "../components/Admin/AdminBody/InspectorsManager/Inspectors";
import AdminPage from "../pages/AdminPage";
import AdminExamSchedules from "../components/Admin/AdminBody/ExamSchedules/ExamSchedulePage";
import AdminSchedulePage from "../components/Admin/AdminBody/ScheduleDetailPage/ScheduleDetailPage";
import AdminReportPage from "../components/Admin/AdminBody/ReportsManager/Reports";

// public Routes
const publicRoutes = [
  { path: "/login", component: AuthPage },
  { path: "/unauthorized", component: UnauthorizedPage },
  { path: "/error-404", component: Error404Page },
];
// Private Routes
const privateRoutes = [
  { path: "/searchExamSchedule", component: ExamSchedulePage },
  { path: "/searchExamSchedule/schedule", component: SchedulePage },
  { path: "/searchStudent", component: StudentSearchingPage },
  { path: "/attendance", component: HomePage },
  { path: "/print", component: PrintPage },
  { path: "/", component: ScheduleTodayPage },
];

const adminRoutes = [
  {
    path: "/administrator/*",
    layout: AdminPage,
    components: [
      { path: "dashboard", component: DashboardBody },
      { path: "users", component: UsersManage },
      { path: "students", component: StudentsManage },
      { path: "exam-schedules", component: AdminExamSchedules },
      { path: "exam-schedules/schedule", component: AdminSchedulePage },
      { path: "inspectors", component: InspectorsManage },
      { path: "report", component: AdminReportPage },
    ],
  },
];

export { publicRoutes, privateRoutes, adminRoutes };

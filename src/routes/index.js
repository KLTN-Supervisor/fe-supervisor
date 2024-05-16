import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/Supervisor/HomePage";
import ExamSchedulePage from "../pages/Supervisor/ExamSchedulePage";
import SchedulePage from "../pages/Supervisor/ScheduleDetailPage";
import StudentSearchingPage from "../pages/Supervisor/StudentSearchingPage";
import DashboardBody from "../components/Admin/AdminBody/Dashboard/Dashboard";
import UsersManage from "../components/Admin/AdminBody/UsersManager/Users";
import StudentsManage from "../components/Admin/AdminBody/StudentsManager/Students";
import AdminPage from "../pages/AdminPage";
import AdminExamSchedules from "../components/Admin/AdminBody/ExamSchedules/ExamSchedulePage";

// public Routes
const publicRoutes = [
  { path: "/login", component: AuthPage },
  { path: "/searchExamSchedule", component: ExamSchedulePage },
  { path: "/searchExamSchedule/schedule", component: SchedulePage },
  { path: "/searchStudent", component: StudentSearchingPage },
  { path: "/", component: HomePage },
];
// Private Routes
const adminRoutes = [
  {
    path: "/administrator/*",
    layout: AdminPage,
    components: [
      { path: "dashboard", component: DashboardBody },
      { path: "users", component: UsersManage },
      { path: "students", component: StudentsManage },
      { path: "exam-schedules", component: AdminExamSchedules },
      { path: "exam-schedules/schedule", component: SchedulePage },
    ],
  },
];

export { publicRoutes, adminRoutes };

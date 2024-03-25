import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/User/HomePage";
import ExamSchedulePage from "../pages/User/ExamSchedulePage";
// public Routes
const publicRoutes = [
  { path: "/login", component: AuthPage },
  { path: "/search", component: ExamSchedulePage },
  { path: "/", component: HomePage },
];

export { publicRoutes };

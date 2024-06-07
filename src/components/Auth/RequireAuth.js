import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/auth-hook/auth-hook";
import { useEffect, useRef } from "react";
import usePrivateHttpClient from "../../hooks/http-hook/private-http-hook";
import useAccountServices from "../../services/useAccountServices";
import useRefreshToken from "../../hooks/http-hook/refresh-token";
import useLogout from "../../hooks/auth-hook/logout-hook";
import { toast } from "react-toastify";

const RequireAuth = ({ roles = ["USER"] }) => {
  const { user, setUserLogin } = useAuth();
  const location = useLocation();
  const { privateRequest } = usePrivateHttpClient();
  const { getLoginAccount } = useAccountServices();

  const { logout } = useLogout();

  const effectRan = useRef(false);

  const checkAuth = async () => {
    try {
      console.log("dô auth trước: ", user);
      if (!user) {
        await logout();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    checkAuth();

    return () => {
      effectRan.current = true;
    };
  }, []);

  if (user) {
    if (roles.includes(user.role)) {
      return <Outlet />;
    } else {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }
  // } else {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
};

export default RequireAuth;

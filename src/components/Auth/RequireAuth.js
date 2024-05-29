import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/auth-hook/auth-hook";
import { useEffect, useRef } from "react";
import usePrivateHttpClient from "../../hooks/http-hook/private-http-hook";
import useAccountServices from "../../services/useAccountServices";

const RequireAuth = ({ roles = ["USER"] }) => {
  const { auth, setUserLogin } = useAuth();
  const location = useLocation();
  const { privateRequest } = usePrivateHttpClient();
  const { getLoginAccount } = useAccountServices();

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      const fetchUser = async () => {
        try {
          const response = await getLoginAccount();

          setUserLogin(response.user);

          // console.log("user: ", userAuth);
          // console.log("roles: ", roles);
          // console.log("access: ", roles.includes(userAuth?.role));
        } catch (err) {
          console.log(err.message);
        }
      };
      if (auth?.accessToken) fetchUser();
    }

    return () => {
      effectRan.current = true;
    };
  }, [auth.accessToken]);

  if (auth?.accessToken) {
    if (roles.includes(auth?.role)) {
      return <Outlet />;
    } else {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default RequireAuth;

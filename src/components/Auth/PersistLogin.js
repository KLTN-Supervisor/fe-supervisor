import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useRefreshToken from "../../hooks/http-hook/refresh-token";
import useAuth from "../../hooks/auth-hook/auth-hook";
import { WelcomPage } from "../../pages/AuthPage";
import useLogout from "../../hooks/auth-hook/logout-hook";
import useAccountServices from "../../services/useAccountServices";

const PersistLogin = () => {
  const { getLoginAccount } = useAccountServices();
  const [isLoad, setIsLoad] = useState(true);
  const refresh = useRefreshToken();
  const { user, setUserLogin } = useAuth();
  const { logout } = useLogout();

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      const getUserLogin = async () => {
        console.log("dô persist trước: ");
        try {
          const userResponse = await getLoginAccount();
          if (userResponse) setUserLogin(userResponse.user);
          else setUserLogin(null);
          setIsLoad(false);
        } catch (err) {
          console.log("Chưa đăng nhập!");
          setUserLogin(null);
          setIsLoad(false);
        }
      };

      !user?.role ? getUserLogin() : setIsLoad(false);
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  // useEffect(() => {
  //   console.log(`loading: ${isLoad}`);
  //   console.log(`aT: ${JSON.stringify(auth?.accessToken)}`);
  // }, [isLoad]);

  return <>{isLoad ? <WelcomPage /> : <Outlet />}</>;
};

export default PersistLogin;

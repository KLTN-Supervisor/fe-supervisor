import { Fragment } from "react";
import { Routes, Route } from "react-router-dom";

import { publicRoutes, adminRoutes } from "./routes";
//import { DefaultLayout } from './Layout';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="App">
      <Routes>
        {publicRoutes.map((route, index) => {
          const Page = route.component;

          //   let Layout;

          //   if (route.layout) {
          //       Layout = route.layout;
          //   } else if (route.layout === null) {
          //       Layout = Fragment;
          //   }

          return (
            <Route
              key={index}
              path={route.path}
              element={
                //   <AuthWrapper>
                //   <Layout>
                <Page />
                //   </Layout>
                //   </AuthWrapper>
              }
            />
          );
        })}
        <Route 
          // element={<RequireAuth admin={true} />}
          >
          {adminRoutes.map((route, index) => {
            const Pages = route.components || [];

            const Layout = route.layout || Fragment;
            return (
              <Route key={index} path={route.path} element={<Layout />}>
                {Pages.map((comp, compIndex) => (
                  <Route
                    key={compIndex}
                    path={comp.path}
                    element={<comp.component />}
                  />
                ))}
              </Route>
            );
          })}
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </div>
  );
}

export default App;

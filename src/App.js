import { Fragment, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { RequireAuth, PersistLogin } from "./components/Auth";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
//import { DefaultLayout } from './Layout';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as faceapi from "face-api.js";

function App() {
  useEffect(() => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
  });

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
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth roles={["USER", "ADMIN"]} />}>
            {privateRoutes.map((route, index) => {
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
          </Route>

          <Route
            element={
              <RequireAuth roles={["ADMIN", "ACADEMIC_AFFAIRS_OFFICE"]} />
            }
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
        </Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        limit={3}
      />
    </div>
  );
}

export default App;

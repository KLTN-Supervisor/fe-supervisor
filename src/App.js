import { Fragment, useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { RequireAuth, PersistLogin } from "./components/Auth";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
//import { DefaultLayout } from './Layout';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as faceapi from "face-api.js";
import usePrivateHttpClient from "./hooks/http-hook/private-http-hook";
import { StateContext } from "./context/StateContext";


function App() {
  const { privateRequest } = usePrivateHttpClient();
  const { dispatch } = useContext(StateContext);
  
  const loadTrainingData = async () => {
    try {
      const response = await privateRequest(`/train/`);
      const labeledFaceDescriptors = response.data
        .map((x) => {
          const descriptors = x.descriptors.map(
            (descriptor) => new Float32Array(descriptor)
          );
          return new faceapi.LabeledFaceDescriptors(x.label, descriptors);
        })
        .filter(Boolean);
      return labeledFaceDescriptors;
    } catch (err) {
      throw err;
    }
  };
  useEffect(() => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(async () => {
      // Khởi tạo faceMatcher và lưu vào Redux store
      const trainingData = await loadTrainingData();
      const faceMatcher = new faceapi.FaceMatcher(trainingData, 0.4);
      dispatch({ type: "SET_FACE_MATCHER", payload: faceMatcher });
    });
  },[]);

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

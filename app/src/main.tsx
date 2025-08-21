import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import HomePage from "./pages/HomePage.tsx";
import Editor from "./pages/editor/Editor.tsx";
import AnimationEditor from "./pages/editor/AnimationEditor.tsx";
import LoginPage from "./pages/account/Login/LoginPage.tsx";
import RegisterPage from "./pages/account/Register/RegisterPage.tsx";
import { MitsuObjectsListing } from "./pages/listPage/MitsuObjectsListing.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [

      {
        path: "/",
        element: <HomePage />
      },

      {
        path: "/Editor",
        element: <Editor />
      },

      {
        path: "/Animation",
        element: <AnimationEditor />
      },

      {
        path: "/MitsuObjectsListing",
        element: <MitsuObjectsListing />
      },

      {
        path: "/Login",
        element: <LoginPage />
      },

      {
        path: "/Register",
        element: <RegisterPage />
      },

    ],
  }


]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);


import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import HomePage from "./pages/HomePage.tsx";
import Editor from "./pages/editor/Editor.tsx";

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


    ],
  }


]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);


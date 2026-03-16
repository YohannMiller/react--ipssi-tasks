import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import AuthGard from "./components/AuthGard/AuthGard.jsx";
import JwtContextProvider from "./contexts/JwtContext.jsx";
import "./index.css";
import PageAccueil from "./pages/pageAccueil/PageAccueil.jsx";
import PageTasks from "./pages/pageTasks/PageTasks.jsx";
import PageRegister from "./pages/pageRegister/PageRegister.jsx";
import PageNouvelleTask from "./pages/pageNouvelleTask/PageNouvelleTask.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageAccueil />,
    errorElement: <p>500</p>,
  },
  {
    path: "/register",
    element: <PageRegister />,
    errorElement: <p>500</p>,
  },
  {
    path: "/tasks",
    element: <AuthGard children={<PageTasks />} />,
    errorElement: <p>500</p>,
  },
  {
    path: "/nouvelle-task",
    element: <AuthGard children={<PageNouvelleTask />} />,
    errorElement: <p>500</p>,
  },
  {
    path: "*",
    element: <p>404</p>,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <JwtContextProvider>
      <RouterProvider router={router} />
    </JwtContextProvider>
  </StrictMode>,
);

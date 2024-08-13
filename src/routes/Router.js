import { lazy } from "react";
import { Navigate } from "react-router-dom";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/
const LoginPage = lazy(() => import("../components/auth/LoginPage"));
const Form = lazy(() => import("../views/ui/Form.js"));
const About = lazy(() => import("../views/About.js"));
const Alerts = lazy(() => import("../views/ui/Alerts"));
const Badges = lazy(() => import("../views/ui/Badges"));
const Buttons = lazy(() => import("../views/ui/Buttons"));
const Projects = lazy(() => import("../components/projects/ProjectList/ProjectList"));
const Grid = lazy(() => import("../views/ui/Grid"));
const Tables = lazy(() => import("../views/ui/Tables"));
const ExcelConverter = lazy(() => import("../components/fileConverter/ExcelConverter"));
const Breadcrumbs = lazy(() => import("../views/ui/Breadcrumbs"));

/*****Routes******/
const ThemeRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "/admin",
    element: <FullLayout />,
    children: [
      // { path: "starter", element: <Starter /> },
      { path: "about", element: <About /> },
      { path: "alerts", element: <Alerts /> },
      { path: "badges", element: <Badges /> },
      { path: "buttons", element: <Buttons /> },
      { path: "Projects", element: <Projects /> },
      { path: "grid", element: <Grid /> },
      { path: "table", element: <Tables /> },
      { path: "excelconverter", element: <ExcelConverter /> },
      { path: "breadcrumbs", element: <Breadcrumbs /> },
      { path: "forms", element: <Form /> },
    ],
  }
  // {
  //   path: "*",
  //   element: <Navigate to="/login" />,
  // },
];

export default ThemeRoutes;
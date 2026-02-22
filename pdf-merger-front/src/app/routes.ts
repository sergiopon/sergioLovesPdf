import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Merge } from "./pages/Merge";

export const router = createBrowserRouter([
  {
    Component: Layout, // Usa Component, no element
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/merge",
        Component: Merge,
      },
    ],
  },
]);


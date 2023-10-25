import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
  useLoaderData,
  useParams,
} from "react-router-dom";

import "./index.css";
import {createPortal} from "react-dom";

const router = createBrowserRouter([{path: "/", element: <App />}]);

const memoryRouter = createMemoryRouter(
  [
    {
      path: "/:id",
      element: <BufferRoot />,
      loader: ({params}) =>
        new Promise((resolve) => setTimeout(() => resolve(params), 1000)),
    },
  ],
  {initialEntries: ["/1"]},
);

memoryRouter.navigate("/2");
memoryRouter.navigate("/3");
memoryRouter.navigate("/2");
memoryRouter.navigate(-2);
setTimeout(() => {
  memoryRouter.navigate("/118181");
}, 1000);

function BufferRoot() {
  const params = useParams();
  const data = useLoaderData();

  return (
    <div>
      {params.id} - {JSON.stringify(data)}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <RouterProvider router={memoryRouter} />
  </React.StrictMode>,
);

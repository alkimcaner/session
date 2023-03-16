import { Provider } from "react-redux";
import { store } from "./store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/home";
import Session from "./routes/session";
import NotFound from "./routes/not-found";
import { useEffect } from "react";
import { setName } from "./slices/userSlice";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "session/:sessionId",
        element: <Session />,
      },
    ],
  },
]);

export default function App() {
  useEffect(() => {
    if (!localStorage.getItem("username")) {
      store.dispatch(setName(""));
    }
  }, []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

import { Provider } from "react-redux";
import { store } from "./store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/home";
import Login from "./routes/login";
import Profile from "./routes/profile";
import Session from "./routes/session";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { setUserSession } from "./slices/userSlice";
import ProtectedRoute from "./routes/protected-route";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/sessions/:sessionId",
        element: <Session />,
      },
    ],
  },
]);

export default function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      store.dispatch(setUserSession(session));
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      store.dispatch(setUserSession(session));
    });
  }, []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

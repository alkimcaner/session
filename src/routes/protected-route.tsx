import { Navigate } from "react-router-dom";
import { useAppSelector } from "../typedReduxHooks";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const userState = useAppSelector((state) => state.user);

  if (!userState.userSession?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

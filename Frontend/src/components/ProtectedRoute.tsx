import { Navigate } from "react-router-dom";
import { isUserLoggedIn } from "@/lib/cookieUtils";

interface ProtectedRouteProps {
  element: JSX.Element;
}

const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const isAuthenticated = isUserLoggedIn();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;

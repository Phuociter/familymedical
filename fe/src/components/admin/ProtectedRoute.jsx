import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { token, role } = useSelector((state) => state.user);

  // Bỏ qua xác thực khi bật cờ môi trường hoặc localStorage
  const skipAuth =
    process.env.REACT_APP_SKIP_AUTH === 'true' ||
    localStorage.getItem('SKIP_AUTH') === 'true';
  if (skipAuth) {
    return children;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;


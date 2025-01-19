import User404 from '../pages/user/User404';
import UserDashboard from '../pages/user/UserDashboard';

const userRoutes = [
  { path: "/user/dashboard", element: <UserDashboard /> },
  { path: "/user/404", element: <User404 /> },
  { path: "/user/*", element: <User404 /> },
];

export default userRoutes;

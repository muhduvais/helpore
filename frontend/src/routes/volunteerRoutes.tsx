import Volunteer404 from '../pages/volunteer/Volunteer404';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';

const volunteerRoutes = [
  { path: "/volunteer/dashboard", element: <VolunteerDashboard /> },
  { path: "/volunteer/404", element: <Volunteer404 /> },
  { path: "/volunteer/*", element: <Volunteer404 /> },
];

export default volunteerRoutes;

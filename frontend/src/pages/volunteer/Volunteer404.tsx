import { Link } from "react-router-dom";

const Admin404 = () => {
  return (
    <div className="w-[100vw] h-[100vh] bg-[#F4F4F4] flex flex-col items-center justify-center text-center">
      <h1 className="text-[80px] font-bold text-[#5F5F5F]">404</h1>
      <p className="text-lg text-[#5F5F5F] mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link to="/volunteer/dashboard">
        <button className="bg-[#688D48] hover:bg-[#435D2C] text-white font-semibold py-3 px-6 shadow-lg transition duration-300">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
};

export default Admin404;

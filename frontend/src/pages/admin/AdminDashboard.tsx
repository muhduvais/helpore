import { FaAngleRight  } from "react-icons/fa6";
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/AdminTopbar';

const AdminDashboard = () => {

  return (
    <>
    
    <div className="main-container w-[100vw] h-[100vh] bg-[#F4F4F4]">

      {/* Sidebar */}
      <Sidebar activeLink="/admin/dashboard" />

      {/* Topbar */}
      <Topbar />

      {/* Table container */}
      <div className="table-container flex flex-col items-center px-10 py-5 ml-[240px] pt-[50px]">
      
      <div className="w-[100%] top-part flex items-center justify-between mt-10 mb-5">

        <div className="bread-crumps">
          <div className="crumps flex items-center gap-x-1">
            <span className='text-sm text-[#5F5F5F]'>Dashboard</span>
            <FaAngleRight className='text-[#5F5F5F]' />
          </div>
        </div>

        <div></div>

      </div>
      
    </div>

    </div>
    </>
  )
}

export default AdminDashboard;
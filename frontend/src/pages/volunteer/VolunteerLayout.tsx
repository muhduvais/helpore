import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import VolunteerSidebar from "@/components/volunteer-sidebar";
import { ToastContainer } from "react-toastify";
import VolunteerTopbar from "@/components/VolunteerTopbar";

const VolunteerLayout = () => {

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <SidebarProvider>
                <div className='main-part flex w-full justify-between'>
                    <VolunteerSidebar />

                    <div className='right-part relative m-auto w-full h-full overflow-x-hidden'>
                        <VolunteerTopbar />
                        <div className="h-[90vh] overflow-y-scroll">
                            <Outlet />
                        </div>
                    </div>

                </div>
            </SidebarProvider>
        </>
    )
}

export default VolunteerLayout;
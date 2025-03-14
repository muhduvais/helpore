import { SidebarProvider } from "@/components/ui/sidebar";
import UserTopbar from "@/components/UserTopbar";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { ToastContainer } from "react-toastify";

const AdminLayout = () => {

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
                    <AdminSidebar />

                    <div className='right-part relative m-auto w-full h-full overflow-x-hidden'>
                        <UserTopbar />
                        <div className="h-[90vh] overflow-y-scroll">
                            <Outlet />
                        </div>
                    </div>

                </div>
            </SidebarProvider>
        </>
    )
}

export default AdminLayout;
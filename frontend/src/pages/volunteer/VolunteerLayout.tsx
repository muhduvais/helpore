import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import VolunteerSidebar from "@/components/VolunteerSidebar";
import VolunteerTopbar from "@/components/VolunteerTopbar";

const VolunteerLayout = () => {

    return (
        <>
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
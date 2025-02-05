
import { createContext, useState, useContext, ReactNode } from "react";

interface SidebarContextType {
    sidebarState: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {

    const initialSidebarState = window.matchMedia('(max-width: 768px)').matches ? false : true;

    const [sidebarState, setSidebarState] = useState(initialSidebarState);

    const toggleSidebar = () => {
        setSidebarState((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{ sidebarState, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};

import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const MainLayout = () => {
    return (
        <>
            <Outlet />
            {/* Reserve vertical space so fixed footer doesn't cover page content */}
            <div aria-hidden className="h-12 sm:h-10" />
            <Footer />
        </>
    );
};

export default MainLayout;
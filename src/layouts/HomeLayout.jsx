import { Outlet } from "react-router";
import HomeNavbar from "../components/HomeNavbar";
import Footer from "../components/Footer";

export default function HomeLayout() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <HomeNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

import { Outlet } from "react-router";
import MarketplaceNavbar from "../components/MarketplaceNavbar";

export default function MarketplaceLayout() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <MarketplaceNavbar />
        <main className="flex-1 sm:mt-20">
          <Outlet />
        </main>
      </div>
    </>
  )
}

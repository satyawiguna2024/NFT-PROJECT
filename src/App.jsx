import { Routes, Route } from "react-router";
import {Create, Home, ListedItems, Marketplace, Purchases} from "./pages/index";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeLayout from "./layouts/HomeLayout";
import MarketplaceLayout from "./layouts/MarketplaceLayout";

export default function App() {
  return (
    <>
      <Routes>
        {/* Home Layout */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<MarketplaceLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/create-nft" element={<Create />} />
            <Route path="/marketplace/mylisted-items" element={<ListedItems />} />
            <Route path="/marketplace/my-purchases" element={<Purchases />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

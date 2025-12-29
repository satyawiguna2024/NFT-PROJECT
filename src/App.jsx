import { Routes, Route } from "react-router";
import {Home, Create, ListedItems, Purchases} from "./pages/index";
import Navbar from "./components/Navbar";

export default function App() {
  return(
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/my-listed-items" element={<ListedItems />} />
            <Route path="/my-purchases" element={<Purchases />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
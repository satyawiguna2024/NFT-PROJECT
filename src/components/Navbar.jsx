import { Link, NavLink } from "react-router"
import ConnectWallet from "./ConnectWallet";

export default function Navbar() {
  return (
    <>
      <nav className="w-full p-3 bg-gray-400 flex items-center justify-around">
        {/* title */}
        <h1>
          <Link to="/" className="text-2xl text-gray-100 font-semibold">🃏 DApp NFT Marketplace</Link>
        </h1>
          

        {/* menu-list */}
        <ul className="flex items-center gap-x-12">
          <li>
            <NavLink to="/" className={({isActive}) => `${isActive ? "underline text-gray-200" : "text-gray-100 hover:text-gray-200 underline-offset-4 hover:underline"}`}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/create" className={({isActive}) => `${isActive ? "underline text-gray-200" : "text-gray-100 hover:text-gray-200 underline-offset-4 hover:underline"}`}>Create</NavLink>
          </li>
          <li>
            <NavLink to="/my-listed-items" className={({isActive}) => `${isActive ? "underline text-gray-200" : "text-gray-100 hover:text-gray-200 underline-offset-4 hover:underline"}`}>My Listed Items</NavLink>
          </li>
          <li>
            <NavLink to="/my-purchases" className={({isActive}) => `${isActive ? "underline text-gray-200" : "text-gray-100 hover:text-gray-200 underline-offset-4 hover:underline"}`}>My Purchases</NavLink>
          </li>
        </ul>

        {/* wallet connectors */}
        <div>
          <ConnectWallet />
        </div>
      </nav>
    </>
  )
}

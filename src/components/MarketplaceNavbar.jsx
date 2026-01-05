import { Link, NavLink } from "react-router";
import ConnectWallet from "./ConnectWallet";
import Icon from "../assets/nft.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";

const menuNavbar = [
  { id: 1, path: "/marketplace", title: "Marketplace" },
  { id: 2, path: "/marketplace/create-nft", title: "Create" },
  { id: 3, path: "/marketplace/mylisted-items", title: "My Listed Items" },
  { id: 4, path: "/marketplace/my-purchases", title: "My Purchases" },
];

export default function MarketplaceNavbar() {
  const [navIsOpen, setNavIsOpen] = useState(false);

  return (
    <>
      <header className="w-full p-3 flex justify-between bg-gray-950">
        <Link to="/marketplace" className="flex items-center gap-x-1">
          <img
            src={Icon}
            alt="Icons-website"
            className="size-9 xs:size-12 lg:size-16 -scale-x-100"
          />
          <div>
            <h1 className="text-white text-lg font-poppins font-semibold xs:text-xl lg:text-2xl">
              <span className="text-yellow-400">NFT</span> Marketplace
            </h1>
          </div>
        </Link>

        {/* button menu */}
        {navIsOpen ? (
          <button
            onClick={() => setNavIsOpen(!navIsOpen)}
            className="cursor-pointer block sm:hidden"
          >
            <IoMdClose size={25} className="text-white" />
          </button>
        ) : (
          <button
            onClick={() => setNavIsOpen(!navIsOpen)}
            className="cursor-pointer block sm:hidden"
          >
            <RxHamburgerMenu size={25} className="text-white" />
          </button>
        )}

        {/* connect wallet */}
        <div className="hidden sm:block">
          <ConnectWallet />
        </div>
      </header>

      <nav>
        <ul
          className={`absolute z-50 flex flex-col sm:flex-row gap-5 sm:gap-9 w-full p-6 bg-gray-700 transition-transform sm:translate-x-0 ${
            navIsOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {menuNavbar.map((list) => (
            <div key={list.id}>
              <li className="font-poppins text-lg font-medium">
                <NavLink
                  end
                  to={list.path}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? "text-gray-300 underline underline-offset-8"
                        : "text-gray-200 hover:text-gray-300 hover:underline hover:underline-offset-8"
                    }`
                  }
                >
                  {list.title}
                </NavLink>
              </li>
            </div>
          ))}
          <div className="block sm:hidden">
            <ConnectWallet />
          </div>
        </ul>
      </nav>
    </>
  );
}

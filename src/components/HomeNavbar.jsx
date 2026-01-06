import { Link } from "react-router";
import Icon from "../assets/nft.png";

export default function HomeNavbar() {
  return (
    <>
      <nav className="w-full p-3 flex justify-between items-center">
        {/* title */}
        <Link to="/" className="flex items-center gap-x-1">
          <img src={Icon} alt="Icons-website" className="size-9 xs:size-12 lg:size-16 -scale-x-100" />
          <div>
            <h1 className="text-white text-lg font-poppins font-semibold xs:text-xl lg:text-2xl"><span className="text-yellow-400">NFT</span> Marketplace</h1>
          </div>
        </Link>
      </nav>
    </>
  )
}

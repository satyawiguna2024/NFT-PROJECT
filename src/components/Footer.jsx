import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";

export default function HomeFooter() {
  return (
    <footer className="mt-20 border-t border-gray-700/50 bg-linar-to-b from-gray-900 to-black">
      <div className="container-costume px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 tracking-wide">
              NFT<span className="text-white">Marketplace</span>
            </h2>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Discover, collect, and trade extraordinary NFTs powered by
              blockchain technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Explore</li>
              <li className="hover:text-white cursor-pointer">Create</li>
              <li className="hover:text-white cursor-pointer">My Assets</li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">All NFTs</li>
              <li className="hover:text-white cursor-pointer">Art</li>
              <li className="hover:text-white cursor-pointer">Music</li>
              <li className="hover:text-white cursor-pointer">Collectibles</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-full hover:bg-blue-500 transition"
              >
                <FaTwitter className="text-white" />
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-full hover:bg-indigo-500 transition"
              >
                <FaDiscord className="text-white" />
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-full hover:bg-gray-600 transition"
              >
                <FaGithub className="text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-700/50 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} NFTMarketplace. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built with ❤️ on Ethereum
          </p>
        </div>
      </div>
    </footer>
  );
}

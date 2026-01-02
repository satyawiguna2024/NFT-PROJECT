import { Navigate } from "react-router";
import { useAccount } from "wagmi";
import { exlusiveNft } from "./ListMappingNFT";
import NftImageFirst from "../../assets/image-nft/nft1.jpeg";
import NftImageSecond from "../../assets/image-nft/nft2.jpeg";
import NftImageThree from "../../assets/image-nft/nft4.jpeg";
import { FaEthereum } from "react-icons/fa";

export default function Home() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <Navigate to={"/marketplace"} replace />;
  }

  return (
    <>
      {/* Header Content */}
      <div className="relative overflow-hidden">
        {/* === BACKGROUND GLOW === */}
        <div className="absolute -top-40 -left-40 size-100 bg-purple-600/50 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-0 size-87.5 bg-fuchsia-500/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-112.5 bg-blue-500/30 rounded-full blur-[140px]" />
        <div className="absolute -top-20 left-0 size-75 bg-yellow-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-20 size-100 bg-purple-500/30 rounded-full blur-[140px]" />

        <section className="relative z-10 container-costume pt-10 md:pt-28">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
            <div className="flex-1 p-3">
              <h1 className="text-3xl text-shadow-md xs:text-4xl sm:text-5xl md:text-4xl xl:text-5xl font-bold font-montserrat text-white mb-1 text-center md:text-start">
                Create Your Own
              </h1>
              <h1 className="text-3xl text-shadow-md xs:text-4xl sm:text-5xl md:text-4xl xl:text-5xl font-bold font-montserrat text-white mb-10 text-center md:text-start">
                <span className="text-yellow-400">NFT</span> Dream Gallery
              </h1>

              <p className="font-medium text-shadow-md font-montserrat max-w-100 sm:max-w-110 md:max-w-103 xl:max-w-110 xl:text-lg text-white/85 text-center md:text-start">
                Get started with easiest and most secure platform to buy and
                collect NFTs
              </p>

              {/* button */}
              <div className="flex justify-center md:justify-start">
                <button className="px-3 py-2 xl:py-3 border font-poppins mt-5 rounded-md bg-gray-100 hover:bg-gray-100/80 cursor-pointer text-gray-800 font-medium drop-shadow-md">
                  Connect Wallet & Explore
                </button>
              </div>
            </div>
            <div className="flex-1 p-3 hidden md:block">
              <div className="flex gap-x-3">
                {/* gambar1 */}
                <div className="w-50 h-96 bg-purple-400/80 hidden lg:block p-1">
                  <img
                    src={NftImageSecond}
                    alt="Monkey Nft"
                    className="size-full bg-cover bg-center object-cover"
                  />
                </div>
                {/* gambar2 */}
                <div className="w-40 h-90 lg:w-50 lg:h-96 bg-green-400/80 -mt-10 p-1">
                  <img
                    src={NftImageFirst}
                    alt="Monkey Nft"
                    className="size-full bg-cover bg-center object-cover"
                  />
                </div>
                {/* gambar3 */}
                <div className="w-40 h-90 lg:w-50 lg:h-96 bg-cyan-400/80 p-1">
                  <img
                    src={NftImageThree}
                    alt="Monkey Nft"
                    className="size-full bg-cover bg-center object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exlusive bundle NFT */}
        <section className="relative z-10 container-costume pt-28 px-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl text-shadow-md font-semibold font-montserrat text-white text-center md:text-start">
            Exlusive Bundle{" "}
            <span className="text-yellow-400 underline underline-offset-2">
              NFTs
            </span>
          </h1>

          {/* image */}
          <div className="flex items-center gap-3 overflow-x-auto my-10">
            {exlusiveNft.map((item, i) => (
              <div key={i} className="shrink-0 w-56 relative">
                <div
                  style={{ backgroundImage: `url(${item.imageNFT})` }}
                  className="relative w-full h-80 bg-cover bg-center rounded-xl overflow-hidden"
                >
                  {/* OVERLAY GRADIENT */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  {/* NFT NUMBER */}
                  <h5 className="absolute top-2 left-2 text-lg text-gray-100/90 font-semibold drop-shadow-md">
                    #{item.numberNFT}
                  </h5>

                  {/* PRICE */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-x-1 text-white drop-shadow-md">
                    <FaEthereum size={20} />
                    <h5 className="font-semibold text-white">{item.price}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

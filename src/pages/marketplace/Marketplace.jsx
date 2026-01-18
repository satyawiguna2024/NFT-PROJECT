import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { LuLoader } from "react-icons/lu";
import { useMarketplaceItem } from "../../hooks/useMarketplaceItems";
import Skeleton from "../../components/Skeleton";

export default function Marketplace() {
  const {
    items,
    loading,
    processingItemId,
    sortOrder,
    setSortOrder,
    purchaseItem,
    isProcessing,
  } = useMarketplaceItem();
  const { address } = useAccount();

  return (
    <>
      {loading ? (
        <div className="container-costume p-3 mt-5">
          <div className="flex justify-between items-center">
            {/* items & filter input */}
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>

          {/* card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="bg-gray-600 p-3 rounded-xl max-w-70 mx-auto animate-pulse"
              >
                {/* header */}
                <div className="flex items-center gap-x-2">
                  <Skeleton className="size-13 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="w-40 h-3 rounded-full" />
                    <Skeleton className="w-30 h-3 rounded-full" />
                  </div>
                </div>

                {/* image */}
                <div className="mt-3">
                  <Skeleton className="size-64 rounded-3xl" />
                </div>

                <div className="mt-3 mx-2">
                  <Skeleton className="w-30 h-5 rounded-full" />

                  <div className="mt-5 flex justify-between gap-x-2">
                    <Skeleton className="w-full h-7 rounded-full" />
                    <Skeleton className="w-full h-7 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="container-costume p-3 mt-20 flex flex-col items-center text-center">
          <p className="text-gray-400 font-poppins text-lg">
            There are no items here.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Crafted items will appear here.
          </p>
        </div>
      ):(
        <div className="container-costume p-3 mt-5">
          <div className="flex justify-between items-center">
            <h1 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-gray-200 tracking-wide">
              {items.length} Items
            </h1>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-200 text-gray-200 p-1 rounded-md"
            >
              <option value="high">High to Low</option>
              <option value="low">Low to High</option>
            </select>
          </div>

          {/* card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
            {items.map((itm, i) => {
              const isOwner =
                address &&
                itm.seller &&
                address.toLowerCase() === itm.seller.toLowerCase();
              const isThisItemProcessing =
                processingItemId === itm.itemId && isProcessing;

              return (
                <div
                  key={i}
                  className="bg-gray-600 p-3 rounded-xl max-w-70 mx-auto"
                >
                  <div className="flex items-center gap-x-2">
                    <div
                      style={{
                        backgroundImage: `url('https://api.dicebear.com/7.x/identicon/svg?seed=${itm.seller}')`,
                      }}
                      className="size-12 rounded-full p-5 bg-cover bg-center object-cover border border-gray-300 bg-white"
                    />
                    <div>
                      <p className="font-poppins text-gray-200/70 font-medium">
                        Creator
                      </p>
                      <h4 className="font-poppins text-gray-200 font-medium">
                        {itm.seller.slice(0, 15)}...{itm.seller.slice(-4)}
                      </h4>
                    </div>
                  </div>

                  {/* image nft */}
                  <div className="relative">
                    <img
                      src={itm.image}
                      alt="NFTs"
                      className="w-full h-64 bg-cover bg-center p-2 object-cover rounded-3xl"
                    />

                    <h5 className="absolute bottom-4 left-20 z-10 px-3 rounded-full font-poppins text-green-400 bg-black/60 backdrop-blur-md border border-green-400/40 shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                      Available
                    </h5>
                  </div>

                  {/* title */}
                  <div className="mx-2">
                    <h3 className="font-poppins text-gray-200 font-semibold text-lg">
                      "{itm.name}"
                    </h3>

                    <div className="flex items-end justify-between mt-3">
                      <div className="leading-tight">
                        <p className="text-xs text-gray-400 font-medium">
                          Price
                        </p>
                        <p className="text-gray-200 font-semibold text-lg">
                          {formatEther(itm.totalPrice)} ETH
                        </p>
                      </div>

                      <button
                        disabled={isThisItemProcessing || isOwner}
                        onClick={() => purchaseItem(itm)}
                        className={`flex items-center gap-x-1 px-4 py-1.5 bg-blue-500 font-poppins font-medium text-white rounded-2xl whitespace-nowrap ${
                          isThisItemProcessing || isOwner
                            ? "cursor-not-allowed bg-gray-400"
                            : "hover:bg-blue-500/80 cursor-pointer"
                        }`}
                      >
                        {isThisItemProcessing ? (
                          <>
                            <LuLoader size={25} className="animate-spin" />
                            <p>Process</p>
                          </>
                        ) : (
                          "Buy NFT"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

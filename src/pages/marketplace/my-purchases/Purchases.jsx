import { usePurchaseItem } from "../../../hooks/usePurchase";
import { formatEther } from "viem";

export default function Purchases() {
  const {items, loading, sortOrder, setSortOrder} = usePurchaseItem();

  if (loading) return <span className="animate-pulse text-white">Loading...</span>;

  return (
    <>
      <div className="container-costume p-3 mt-5">
        <div className="flex justify-between items-center">
          <h1 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-gray-200 tracking-wide">
            {items.length} Items
          </h1>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-gray-200 text-gray-200 p-1 rounded-md">
            <option value="high">High to Low</option>
            <option value="low">Low to High</option>
          </select>
        </div>

        {/* card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
          {items.map((itm, i) => (
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
                      Buyer
                    </p>
                    <h4 className="font-poppins text-gray-200/70 font-medium">
                      by <span className="text-gray-200">You</span>
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
                </div>

                {/* title */}
                <div className="mx-2">
                  <h3 className="font-poppins text-gray-200 font-semibold text-lg">
                    "{itm.name}"
                  </h3>

                  <div className="flex items-end justify-between mt-3">
                    <div className="leading-tight">
                      <p className="text-xs text-gray-400 font-medium">Bought at a Price</p>
                      <p className="text-gray-200 font-semibold text-lg">
                        {formatEther(itm.totalPrice)} ETH
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </>
  );
}

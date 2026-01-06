import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import {
  CONTRACT_ADDRESS_MARKETPLACE,
  ABI_MARKETPLACE,
} from "../../../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../../contract/NFT";
import { formatEther } from "viem";

export default function ListedItems() {
  const [listItems, setListItems] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  // Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  const loadMyListedItems = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const itemCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "itemCount",
      });

      const myListedItems = [];

      for (let i = 1; i <= Number(itemCount); i++) {
        const item = await publicClient.readContract({
          address: CONTRACT_ADDRESS_MARKETPLACE,
          abi: ABI_MARKETPLACE,
          functionName: "items",
          args: [i],
        });

        // Mengecek apakah seller user address saat ini
        if (item[4].toLowerCase() !== address.toLowerCase()) continue;

        const tokenId = item[2];

        const uri = await publicClient.readContract({
          address: CONTRACT_ADDRESS_NFT,
          abi: ABI_NFT,
          functionName: "tokenURI",
          args: [tokenId],
        });

        const metadataURL = resolveIPFS(uri);

        const response = await fetch(metadataURL);
        const metadata = await response.json();

        const totalPrice = await publicClient.readContract({
          address: CONTRACT_ADDRESS_MARKETPLACE,
          abi: ABI_MARKETPLACE,
          functionName: "getTotalPrice",
          args: [i],
        });

        myListedItems.push({
          id: Number(item[0]),
          tokenId: Number(tokenId),
          price: item[3],
          totalPrice,
          seller: item[4],
          sold: item[5],
          name: metadata.name,
          description: metadata.description,
          image: resolveIPFS(metadata.image),
        });

        setListItems(myListedItems);
      }
    } catch (err) {
      console.error("Error in loadMyListedItems: ", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyListedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter price
  const sortedItems = [...listItems].sort((a,b) => {
    if(sortOrder === "high") {
      return a.totalPrice > b.totalPrice ? -1 : 1
    }

    if(sortOrder === "low") {
      return a.totalPrice < b.totalPrice ? -1 : 1
    }
  })

  if (isLoading) return <span className="animate-pulse text-white">Loading...</span>;

  return (
    <>
      <div className="container-costume p-3 mt-5">
        <div className="flex justify-between items-center">
          <h1 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-gray-200 tracking-wide">
            {listItems.length} Items
          </h1>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-gray-200 text-gray-200 p-1 rounded-md">
            <option value="high">High to Low</option>
            <option value="low">Low to High</option>
          </select>
        </div>

        {/* card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
          {sortedItems.map((itm, i) => (
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

                  <h5 className={`absolute bottom-4 left-20 z-10 px-3 rounded-full font-poppins bg-black/60 backdrop-blur-md border ${itm.sold ? "text-red-400  border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "text-green-400  border-green-400/40 shadow-[0_0_15px_rgba(34,197,94,0.6)]"} `}>
                    {itm.sold ? "Sold Out" : "Available"}
                  </h5>
                </div>

                {/* title */}
                <div className="mx-2">
                  <h3 className="font-poppins text-gray-200 font-semibold text-lg">
                    "{itm.name}"
                  </h3>

                  <div className="flex items-end justify-between mt-3">
                    <div className="leading-tight">
                      <p className="text-xs text-gray-400 font-medium">Price</p>
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

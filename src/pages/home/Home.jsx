import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";
import {
  CONTRACT_ADDRESS_MARKETPLACE,
  ABI_MARKETPLACE,
} from "../../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../contract/NFT";

export default function Home() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient(); // readContract smart-contract

  // Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  const loadMarketplaceItems = async () => {
    setIsLoading(true);

    // 1. Ambil itemCount
    const itemCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS_MARKETPLACE,
      abi: ABI_MARKETPLACE,
      functionName: "itemCount",
    });

    const itemData = [];

    // 2. Loop untuk setiap item[]
    for (let i = 1; i <= Number(itemCount); i++) {
      // Ambil data item
      const item = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "items",
        args: [i],
      });

      // Skip jika sudah sold
      if (item[5]) continue; // ini ambil dari variable struct, dimulai dari atas 0 seperti array: item[5] = sold

      // Ambil tokenURI
      const uri = await publicClient.readContract({
        address: CONTRACT_ADDRESS_NFT,
        abi: ABI_NFT,
        functionName: "tokenURI",
        args: [item[2]], // item[2] itu merupakan tokenId
      });

      const metadataURL = resolveIPFS(uri);

      // Fetch Metadata
      const response = await fetch(metadataURL);
      const metadata = await response.json();

      // ambil totalPrice
      const totalPrice = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "getTotalPrice",
        args: [i],
      });

      // push ke Array
      itemData.push({
        itemId: Number(item[0]),
        price: item[3],
        totalPrice,
        seller: item[4],
        name: metadata.name,
        description: metadata.description,
        image: resolveIPFS(metadata.image),
      });
    }

    setItems(itemData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMarketplaceItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <h1 className="animate-pulse">Loading...</h1>;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-3 mt-8">
          {/* cards */}
          {items.map((item, index) => (
            <div key={index}>
              <div
                className="relative size-full h-80 bg-cover object-cover bg-center flex flex-col justify-end items-center border border-gray-300 rounded-md rounded-b-none"
                style={{
                  backgroundImage: `url(${item.image})`,
                }}
              >
                <div className="w-full bg-linear-to-t from-black/80 via-black/40 to-transparent text-center">
                  {/* title */}
                  <h3 className="text-xl text-gray-200 font-semibold drop-shadow-lg">
                    {item.name}
                  </h3>
                  {/* description */}
                  <p className="text-lg text-gray-200 font-medium drop-shadow-lg pb-3">
                    {item.description}
                  </p>
                </div>
              </div>
              {/* button buy */}
              <div className="flex justify-center items-center">
                <button className="w-full bg-gray-500 p-3 text-gray-200 font-bold cursor-pointer hover:text-gray-300 hover:bg-gray-600">
                  {formatEther(item.totalPrice)} ETH
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

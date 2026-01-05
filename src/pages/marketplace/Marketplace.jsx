import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import {
  CONTRACT_ADDRESS_MARKETPLACE,
  ABI_MARKETPLACE,
} from "../../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../contract/NFT";
import { LuLoader } from "react-icons/lu";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {address} = useAccount();
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
  const publicClient = usePublicClient(); // readContract smart-contract
  const {writeContract, data, isPending} = useWriteContract();
  const {isLoading: isConfirmingBtn, isSuccess, isError} = useWaitForTransactionReceipt({hash: data});

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

      // Fetch Metadata ???
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

    if(isSuccess) alert("✅ Purchase is successfully!");

    if(isError) {
      alert("Purchase item failed!");
      console.error("Purchase item failed!", isError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchaseItem = (item) => {
    writeContract({
      address: CONTRACT_ADDRESS_MARKETPLACE,
      abi: ABI_MARKETPLACE,
      functionName: "purchaseItem",
      args: [item.itemId],
      value: item.totalPrice
    })
  }

  if (isLoading) return <h1 className="animate-pulse">Loading...</h1>;

  return (
    <>
      <div className="container-costume p-3 mt-5">
        <div className="flex justify-between items-center">
          <h1 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-gray-200 tracking-wide">
            {items.length} Items
          </h1>

          <select className="border border-gray-200 text-gray-200 p-1 rounded-md">
            <option value="">High to Low</option>
            <option value="">Low to High</option>
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
                  style={{ backgroundImage: `url(${avatarUrl})` }}
                  className="size-12 rounded-full p-5 bg-cover bg-center object-cover border border-gray-300 bg-white"
                />
                <div>
                  <p className="font-poppins text-gray-200/70 font-medium">
                    Creator
                  </p>
                  <h4 className="font-poppins text-gray-200 font-medium">
                    {address.slice(0, 15)}...{address.slice(-4)}
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
                  {itm.name}
                </h3>

                <div className="flex items-end justify-between mt-3">
                  <div className="leading-tight">
                    <p className="text-xs text-gray-400 font-medium">Price</p>
                    <p className="text-gray-200 font-semibold text-lg">
                      {formatEther(itm.totalPrice)} ETH
                    </p>
                  </div>

                  <button
                    disabled={isPending || isConfirmingBtn}
                    onClick={() => purchaseItem(itm)}
                    className={`flex items-center gap-x-1 px-4 py-1.5 bg-blue-500 font-poppins font-medium text-white rounded-2xl whitespace-nowrap ${isPending || isConfirmingBtn ? "cursor-not-allowed bg-gray-400" : "hover:bg-blue-500/80 cursor-pointer"}`}>
                    {isPending || isConfirmingBtn ? 
                      (
                      <>
                        <LuLoader size={25} className="animate-spin" />
                        <p>Process</p>
                      </>
                      ) : "Buy NFT"
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

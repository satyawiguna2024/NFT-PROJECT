import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE } from "../../../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../../contract/NFT";

export default function ListedItems() {
  const [listItems, setListItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient();
  const {address} = useAccount();

  // Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  const loadMyListedItems = async() => {
    if(!address) {
      setIsLoading(false)
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

      for(let i = 1; i <= Number(itemCount); i++) {
        const item = await publicClient.readContract({
          address: CONTRACT_ADDRESS_MARKETPLACE,
          abi: ABI_MARKETPLACE,
          functionName: "items",
          args: [i],
        });

        // Mengecek apakah seller user address saat ini
        if(item[4].toLowerCase() !== address.toLowerCase()) continue;

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
            args: [i]
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
  }

  useEffect(() => {
    loadMyListedItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("My NFT: ", listItems);

  if (isLoading) return <span className="animate-pulse">Loading...</span>;


  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-3 mt-8">
          {/* cards */}
          {[1].map((_, i) => (
            <div key={i} className="border border-gray-400 rounded-md">
              <div
                className="relative size-full h-80 bg-cover object-cover bg-center flex flex-col justify-end items-center rounded-b-none"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/flagged/photo-1558706379-e9698f05d675?q=80&w=1646&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
              >
                <div className="w-full bg-linear-to-t from-black/80 via-black/40 to-transparent text-center">
                  {/* title */}
                  <h3 className="text-xl text-gray-200 font-semibold drop-shadow-lg">Dove</h3>
                  {/* description */}
                  <p className="text-lg text-gray-200 font-medium drop-shadow-lg pb-3">Majestic and Blue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

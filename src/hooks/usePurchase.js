import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import {CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE} from "../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../contract/NFT";

export function usePurchaseItem() {
  const [items, setItems] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();
  const { address } = useAccount(); // Alamat wallet user

  //? Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  async function loadMyPurchase() {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const itemCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "itemCount",
      });

      const promises = [];

      // Loop semua items
      for (let i = 1; i <= Number(itemCount); i++) {
        const promise = publicClient.readContract({
            address: CONTRACT_ADDRESS_MARKETPLACE,
            abi: ABI_MARKETPLACE,
            functionName: "items",
            args: [i],
        }).then(async(item) => {
          // Skip jika belum terjual
          if (!item[5]) return null // item[5] = sold

          const tokenId = item[2];

          // Mengecek apakah user ini yang memiliki NFT ini
          const owner = await publicClient.readContract({
            address: CONTRACT_ADDRESS_NFT,
            abi: ABI_NFT,
            functionName: "ownerOf",
            args: [tokenId],
          })

          // Skip jika bukan pemilik user ini
          if (owner.toLowerCase() !== address.toLowerCase()) return null;
          try {
            const uri = await publicClient.readContract({
              address: CONTRACT_ADDRESS_NFT,
              abi: ABI_NFT,
              functionName: "tokenURI",
              args: [tokenId],
            });

            const metadata = await fetch(resolveIPFS(uri)).then(r => r.json());

            // ambil totalPrice
            const totalPrice = await publicClient.readContract({
              address: CONTRACT_ADDRESS_MARKETPLACE,
              abi: ABI_MARKETPLACE,
              functionName: "getTotalPrice",
              args: [i],
            });

            return {
              id: Number(item[0]),
              tokenId: Number(tokenId),
              price: item[3],
              totalPrice,
              seller: item[4],
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
            }
          } catch (err) {
            console.log(`Error loading items ${i}: `, err.message);
          }
        })

        promises.push(promise);
      }

      // Tunggu semua promises selesai (PARALLEL!)
      const results = await Promise.all(promises);
      // Filter yang null (sold items)
      const validItems = results.filter((item) => item !== null);
      setItems(validItems);
    } catch (err) {
      console.log("Error loading loadMyPurchase: ", err.message);
    }

    setLoading(false)
  }


  //? filter price
  function getSortedItems() {
    const sortedItems = [...items].sort((a,b) => {
      if(sortOrder === "high") {
        return a.totalPrice > b.totalPrice ? -1 : 1
      }
  
      if(sortOrder === "low") {
        return a.totalPrice < b.totalPrice ? -1 : 1
      }
    });

    return sortedItems
  }

  useEffect(() => {
    loadMyPurchase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return {
    items: getSortedItems(),
    sortOrder,
    setSortOrder,
    loading
  };
}
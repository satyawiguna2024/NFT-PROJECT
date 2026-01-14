import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import {CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE} from "../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../contract/NFT";


export function useMyListedItems() {
  const [items, setItems] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  //? Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  //? load listedItems
  async function loadListedItems() {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true)

    try {
      // Ambil itemCount
      const itemCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "itemCount",
      });

      // Buat array untuk semua promises (fetch bersamaan!)
      const promises = [];

      for (let i = 1; i <= Number(itemCount); i++) {
        const promise = publicClient.readContract({
          address: CONTRACT_ADDRESS_MARKETPLACE,
            abi: ABI_MARKETPLACE,
            functionName: "items",
            args: [i],
        }).then(async(item) => {
          // Mengecek apakah seller user address saat ini
          if (item[4].toLowerCase() !== address.toLowerCase()) return null;
          const tokenId = item[2];

          try {
            // Ambil tokenURI
            const uri = await publicClient.readContract({
              address: CONTRACT_ADDRESS_NFT,
              abi: ABI_NFT,
              functionName: "tokenURI",
              args: [item[2]], // item[2] itu merupakan tokenId
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
              sold: item[5],
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
            }
          } catch (err) {
            console.log(`Error loading listed items ${i}`, err.message)
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
      console.log("Error loading listed items: ", err.message);
    }

    setLoading(false);
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
      loadListedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return {
    items: getSortedItems(),
    sortOrder,
    setSortOrder,
    loading
  };
}
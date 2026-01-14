import { useState, useEffect } from "react";
import {usePublicClient, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE} from "../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../contract/NFT";

export function useMarketplaceItem() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("high");
  const [processingItemId, setProcessingItemId] = useState(null);

  const publicClient = usePublicClient();
  const {writeContract, data, isPending} = useWriteContract();
  const { isLoading: isConfirmingBtn, isSuccess, isError } = useWaitForTransactionReceipt({ hash: data });

  //? Convert IPFS -> HTTP Gateway
  function resolveIPFS(uri) {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  }

  //? Load marketplace items
  async function loadMarketplaceItems() {
    setLoading(true);

    try {
      // 1. Ambil itemCount
      const itemCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "itemCount",
      });

      // 2. Buat array untuk semua promises (fetch bersamaan!)
      const promises = [];

      for (let i = 1; i <= Number(itemCount); i++) {
        // fetch item data
        const promise = publicClient.readContract({
            address: CONTRACT_ADDRESS_MARKETPLACE,
            abi: ABI_MARKETPLACE,
            functionName: "items",
            args: [i],
        }).then(async (item) => {
          // Skip jika sudah sold
          if (item[5]) return null; // ini ambil dari variable struct, dimulai dari atas 0 seperti array: item[5] = sold

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
              itemId: Number(item[0]),
              price: item[3],
              totalPrice,
              seller: item[4],
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
            };
          } catch (err) {
            console.log(`Error loading items ${i}: `, err.message);
          }
        })

        promises.push(promise);
      }

      // 3. Tunggu semua promises selesai (PARALLEL!)
      const results = await Promise.all(promises);
      // 4. Filter yang null (sold items)
      const validItems = results.filter((item) => item !== null);
      setItems(validItems);
    } catch (err) {
      console.log("Error loading marketplace: ", err.message);
    }

    setLoading(false);
  }

  //? purchase item
  const purchaseItem = (item) => {
    try {
      setProcessingItemId(item.itemId);

      writeContract({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "purchaseItem",
        args: [item.itemId],
        value: item.totalPrice,
      });

    } catch(err) {
      console.log("Error in purchase item: ", err.message);
      setProcessingItemId(null);
    }
  };

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
    loadMarketplaceItems();

    if (isSuccess) {
      alert("✅ Purchase NFT successfully!");
    }

    if (isError) {
      alert("Purchase item failed!");
      console.error("Purchase item failed!", isError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError]);

  return {
    items: getSortedItems(),
    loading,
    processingItemId,
    sortOrder,
    setSortOrder,
    purchaseItem,
    isProcessing: isPending || isConfirmingBtn
  };
}
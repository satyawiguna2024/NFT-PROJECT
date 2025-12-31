import { useEffect, useState } from "react";
import { usePublicClient, useAccount } from "wagmi";
import {
  CONTRACT_ADDRESS_MARKETPLACE,
  ABI_MARKETPLACE,
} from "../../contract/Marketplace";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../contract/NFT";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient();
  const { address } = useAccount(); // Alamat wallet user

  // Convert IPFS -> HTTP Gateway
  const resolveIPFS = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMyPurchase = async () => {
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

      const purchasesData = [];

      // Loop semua items
      for (let i = 1; i <= Number(itemCount); i++) {
        try {
          const item = await publicClient.readContract({
            address: CONTRACT_ADDRESS_MARKETPLACE,
            abi: ABI_MARKETPLACE,
            functionName: "items",
            args: [i],
          });

          // Skip jika belum terjual
          if (!item[5]) continue // item[5] = sold

          const tokenId = item[2];

          // Mengecek apakah user ini yang memiliki NFT ini
          const owner = await publicClient.readContract({
            address: CONTRACT_ADDRESS_NFT,
            abi: ABI_NFT,
            functionName: "ownerOf",
            args: [tokenId],
          })

          // Skip jika bukan pemilik user ini
          if (owner.toLowerCase() !== address.toLowerCase()) continue;

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

          purchasesData.push({
            id: Number(item[0]),
            tokenId: Number(tokenId),
            price: item[3],
            totalPrice,
            seller: item[4],
            name: metadata.name,
            description: metadata.description,
            image: resolveIPFS(metadata.image),
          })

        }catch(err) {
          console.error("Error in For Loop itemCount: ", err.message);
        }
      }

      setPurchases(purchasesData);
    } catch (err) {
      console.error("Error in loadMyPurchase: ", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyPurchase();
  }, [address, loadMyPurchase]);

  console.log("Data purchases: ", purchases);

  if (isLoading) return <span className="animate-pulse">Loading...</span>;

  return (
    <>
      <div>Purchases Pages</div>
    </>
  );
}

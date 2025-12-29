import { useState } from "react"
import { uploadImageToIPFS, uploadMetadataToIPFS } from "../../utils/pinata";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../contract/NFT";
import { CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE } from "../../contract/Marketplace";

export default function Create() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const { writeContractAsync } = useWriteContract()

  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      setLoading(true);

      //* 1. upload image
      const imageUrl = await uploadImageToIPFS(image);

      //* 2. upload metadata
      const metadata = {name: title, description, image: imageUrl}
      const tokenURI = await uploadMetadataToIPFS(metadata);

      //* 3. mint nft
      const mintHash = await writeContractAsync({
        address: CONTRACT_ADDRESS_NFT,
        abi: ABI_NFT,
        functionName: "mint",
        args: [tokenURI],
        gas: 300000n
      });

      const mintReceipt = await waitTx(mintHash);
      const tokenId = Number(mintReceipt.logs[0].topics[3]);

      //* 4. approve marketplace
      await writeContractAsync({
        address: CONTRACT_ADDRESS_NFT,
        abi: ABI_NFT,
        functionName: "approve",
        args: [CONTRACT_ADDRESS_MARKETPLACE, tokenId],
        gas: 100000n
      });

      //* 5. list nft
      await writeContractAsync({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "makeItem",
        args: [CONTRACT_ADDRESS_NFT, tokenId, parseEther(price)],
        gas: 500000n
      });

      alert("NFT created & listed");

    } catch(err) {
      console.error("Error in handle submit: ", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function waitTx(hash) {
    return await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash]
        })
        if (receipt) {
          clearInterval(interval)
          resolve(receipt)
        }
      }, 1000)
    })
  }


  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mt-8">Create NFTS</h1>

        {/* form input */}
        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="border" />
          <input type="text" placeholder="Enter title.." value={title} onChange={(e) => setTitle(e.target.value)} className="border"/>
          <textarea placeholder="Enter description.." value={description} onChange={(e) => setDescription(e.target.value)} className="border" />
          <input type="number" step="0.01" placeholder="Enter Price (ETH)" value={price} onChange={(e) => setPrice(e.target.value)} className="border" />
          <button type="submit" disabled={loading} className="border p-2 cursor-pointer">
            {loading ? "Creating..." : "Create NFT"}
          </button>
        </form>
      </div>
    </>
  )
}

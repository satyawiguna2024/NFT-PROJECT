import { useState } from "react";
import {useNavigate} from "react-router";
import { uploadImageToIPFS, uploadMetadataToIPFS } from "../../../utils/pinata";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS_NFT, ABI_NFT } from "../../../contract/NFT";
import { CONTRACT_ADDRESS_MARKETPLACE, ABI_MARKETPLACE } from "../../../contract/Marketplace";
import { LuLoader } from "react-icons/lu";

export default function Create() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      //* 1. upload image
      const imageUrl = await uploadImageToIPFS(image);

      //* 2. upload metadata
      const metadata = { name: title, description, image: imageUrl };
      const tokenURI = await uploadMetadataToIPFS(metadata);

      //* 3. mint nft
      const mintHash = await writeContractAsync({
        address: CONTRACT_ADDRESS_NFT,
        abi: ABI_NFT,
        functionName: "mint",
        args: [tokenURI],
        gas: 300000n,
      });

      const mintReceipt = await waitTx(mintHash);
      const tokenId = Number(mintReceipt.logs[0].topics[3]);

      //* 4. approve marketplace
      await writeContractAsync({
        address: CONTRACT_ADDRESS_NFT,
        abi: ABI_NFT,
        functionName: "approve",
        args: [CONTRACT_ADDRESS_MARKETPLACE, tokenId],
        gas: 100000n,
      });

      //* 5. list nft
      await writeContractAsync({
        address: CONTRACT_ADDRESS_MARKETPLACE,
        abi: ABI_MARKETPLACE,
        functionName: "makeItem",
        args: [CONTRACT_ADDRESS_NFT, tokenId, parseEther(price)],
        gas: 500000n,
      });

      alert("✅ Successfully created NFT & Listed");
      navigate("/marketplace");
    } catch (err) {
      console.error("Error in handle submit: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  async function waitTx(hash) {
    return await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (receipt) {
          clearInterval(interval);
          resolve(receipt);
        }
      }, 1000);
    });
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-200 mb-8 text-center">
          Create Your NFT
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Upload Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter NFT title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.05"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Describe your NFT..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-x-2 w-full md:w-1/2 rounded-xl py-3 text-white font-semibold transition-all
        ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] cursor-pointer"
        }`}
            >
              {loading ? (
                <>
                  <LuLoader size={25} className="animate-spin" />
                  <p>Process</p>
                </>
              ) : (
                "Create NFT & Listed"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

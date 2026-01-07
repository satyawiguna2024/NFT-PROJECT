import { useConnect } from "wagmi";
import { LuLoader } from "react-icons/lu";

export default function ConnectMetamask() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <>
      {connectors
        .filter((conn) => conn.name === "MetaMask")
        .map((conn) => (
          <button
            key={conn.id}
            onClick={() => connect({ connector: conn })}
            disabled={isPending}
            className={`flex items-center gap-x-2 px-3 py-2 xl:py-3 border font-poppins bg-gray-100 mt-5 rounded-md font-medium drop-shadow-md ${isPending ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-gray-100/80"}`}
          >
            {isPending ? (
              <>
                <LuLoader size={25} className="animate-spin" />
                Connecting MetaMask
              </>
            ) : (
              "Connect Wallet & Explore"
            )}
          </button>
        ))}
    </>
  );
}

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useState } from "react";
import { formatUnits } from "viem";
import { LuLoaderCircle } from "react-icons/lu";

export default function ConnectWallet() {
  const [btnClick, setBtnClick] = useState(false);

  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount(); // mengambil address saat ini
  const { data: dataBalance } = useBalance({ address }); // mengambil balance dari address saat ini

  function shortenAddress(address) {
    return `${address.substring(0, 7)}...${address.substring(
      address.length - 5
    )}`;
  }

  return (
    <>
      {!isConnected ? (
        <>
          {connectors
            .filter((connector) => connector.name === "MetaMask")
            .map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className={`px-3 py-2 rounded-md border border-gray-100 text-gray-100 hover:bg-gray-500
                      ${
                        isPending
                          ? "cursor-not-allowed bg-gray-500 animate-spin"
                          : "cursor-pointer"
                      }`}
              >
                {isPending ? <LuLoaderCircle /> : `Connect ${connector.name}`}
              </button>
            ))}
        </>
      ) : (
        <>
          <div className="px-3 py-2 w-40 bg-gray-500 rounded-md border border-gray-100">
            <div
              onClick={() => setBtnClick(!btnClick)}
              className="cursor-pointer"
            >
              <h5 className="text-gray-100">{shortenAddress(address)}</h5>
              <p className="text-gray-300 text-sm">
                {dataBalance ? Number(formatUnits(dataBalance.value, dataBalance.decimals)).toFixed(4) : "0.0000"}{" "}
                {dataBalance?.symbol}
              </p>
            </div>

            {/* Menu btn disconnect wallet */}
            {btnClick && (
              <div>
                <button
                  onClick={() => disconnect()}
                  className="cursor-pointer hover:underline text-gray-100"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

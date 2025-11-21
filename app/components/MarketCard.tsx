"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function MarketCard({ marketId }: { marketId: number }) {
  const [market, setMarket] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const addr = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!;
      if (!addr) return;
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const abi = [
        "function markets(uint256) view returns (address,string,string,uint256,uint256,uint256,uint8,bool,uint16)",
        "function placeBet(uint256,bool) payable",
        "function yesBalances(uint256,address) view returns (uint256)",
        "function noBalances(uint256,address) view returns (uint256)"
      ];
      const contract = new ethers.Contract(addr, abi, provider);
      try {
        const m = await contract.markets(marketId);
        // m: tuple matching struct; adapt fields by index if necessary
        setMarket(m);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, [marketId]);

  if (!market) return <div className="p-4 border rounded bg-white">Loading market #{marketId}</div>;

  // basic rendering:
  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-semibold">{market[1]}</h3>
      <p className="text-sm text-gray-500">{market[2]}</p>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 bg-green-500 text-white rounded">Buy YES</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded">Buy NO</button>
      </div>
    </div>
  );
}

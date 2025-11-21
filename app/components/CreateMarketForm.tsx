"use client";
import { useState } from "react";
import { ethers } from "ethers";

export default function CreateMarketForm() {
  const [title, setTitle] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [endTime, setEndTime] = useState("");
  const [feeBP, setFeeBP] = useState(100); // 1%

  async function createMarket(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const addr = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
      if (!addr) throw new Error("MARKETPLACE_ADDRESS not set");
      const abi = [
        "function createMarket(string,string,uint256,uint16) returns (uint256)"
      ];
      const contract = new ethers.Contract(addr, abi, signer);
      const endTs = Math.floor(new Date(endTime).getTime() / 1000);
      const tx = await contract.createMarket(title, metadataURI, endTs, feeBP);
      await tx.wait();
      alert("Market created");
    } catch (err: any) {
      console.error(err);
      alert(err.message || err);
    }
  }

  return (
    <form onSubmit={createMarket} className="p-4 border rounded bg-white">
      <h3 className="text-lg font-medium mb-3">Create Market</h3>
      <input className="input" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <input className="input mt-2" placeholder="Metadata URI (optional)" value={metadataURI} onChange={(e)=>setMetadataURI(e.target.value)} />
      <input type="datetime-local" className="input mt-2" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />
      <div className="flex items-center gap-2 mt-2">
        <label>Fee (bps)</label>
        <input type="number" value={feeBP} onChange={(e)=>setFeeBP(parseInt(e.target.value || "0"))} className="input w-24" />
      </div>
      <button className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded">Create</button>
    </form>
  );
}
    
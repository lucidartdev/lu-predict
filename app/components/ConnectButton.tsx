"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function ConnectButton() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setAddress(accounts[0] ?? null);
      });
    }
  }, []);

  async function connect() {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button onClick={connect} className="px-4 py-2 bg-indigo-600 text-white rounded">
      {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}

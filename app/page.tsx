import Link from "next/link";
import CreateMarketForm from "./(components)/CreateMarketForm";
import MarketCard from "./(components)/MarketCard";

export default async function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prediction Marketplace</h1>
        <div className="text-sm text-gray-500">Built with Next.js + Solidity</div>
      </div>

      <CreateMarketForm />

      <section>
        <h2 className="text-xl font-semibold">Active Markets</h2>
        <div id="market-list" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Client component should fetch markets from onchain via ethers and render MarketCard */}
          <MarketCard marketId={0} />
          <MarketCard marketId={1} />
        </div>
      </section>
    </div>
  );
}

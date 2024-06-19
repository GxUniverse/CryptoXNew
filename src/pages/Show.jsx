import React, { useEffect } from "react";
import showStore from "../stores/showStore";
import { useParams } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Show() {
  const store = showStore();
  const params = useParams();

  useEffect(() => {
    store.fetchData(params.id);
  }, [params.id]);

  if (!store.data || store.graphData.length === 0) return <></>;

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center">
        <img
          src={store.data.image}
          alt={`${store.data.name} logo`}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl font-bold">
            {store.data.name} ({store.data.symbol})
          </h2>
          <div className="text-gray-600">
            Market Cap Rank: {store.data.market_cap_rank}
          </div>
        </div>
      </header>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={store.graphData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Price"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">24h High</h4>
          <span>${store.data.market_data.high_24h.usd}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">24h Low</h4>
          <span>${store.data.market_data.low_24h.usd}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">Circulating Supply</h4>
          <span>{store.data.market_data.circulating_supply}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">Current Price</h4>
          <span>${store.data.market_data.current_price.usd}</span>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">1y Change</h4>
          <span>
            {store.data.market_data.price_change_percentage_1y.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

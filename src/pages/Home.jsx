import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeStore from '../stores/homeStore';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { coins, trending, query, setQuery, fetchCoins, loading, error, graphs } = homeStore(state => ({
    coins: state.coins.slice(0, 6),
    trending: state.trending,
    query: state.query,
    setQuery: state.setQuery,
    fetchCoins: state.fetchCoins,
    loading: state.loading,
    error: state.error,
    graphs: state.graphs,
  }));

  useEffect(() => {
    if (query.length > 2) {
      homeStore.getState().searchCoins(query);
    } else {
      homeStore.getState().fetchCoins();
    }
  }, [query]);

  useEffect(() => {
    coins.slice(0, 6).forEach(coin => {
      if (!graphs[coin.id]) {
        homeStore.getState().fetchCoinGraphData(coin.id);
      }
    });
  }, [coins, graphs]);

  const handlePriceChangeIndicator = (coinId) => {
    const coinGraph = graphs[coinId];
    if (coinGraph && coinGraph.length >= 2) {
      const currentPrice = coinGraph[coinGraph.length - 1].price;
      const previousPrice = coinGraph[coinGraph.length - 2].price;
      if (currentPrice > previousPrice) {
        return <span className="text-green-500 text-3xl">▲</span>;
      } else if (currentPrice < previousPrice) {
        return <span className="text-red-500 text-3xl">▼</span>;
      }
    }
    return null;
  };

  return (
    <div className="bg-gray-100">
      <header className="bg-black text-white py-4 px-8 flex justify-between items-center w-full">
        <h1 className="text-xl font-bold">CryptoX</h1>
        <div className="w-full mb-4 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded w-64 text-black"
            placeholder="Search for a coin"
          />
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-center gap-6 flex-wrap mt-20 mb-6">
          {coins.map(coin => (
            <div key={coin.id} className="bg-white p-4 rounded shadow-md text-center w-52">
              <Link to={`/${coin.id}`} className="block">
                <img src={coin.image} alt={coin.name} className="mx-auto mb-2 w-12 h-12 object-contain" />
                <span className="text-sm text-blue-500 hover:underline">{coin.name}</span>
                <div className="flex items-center justify-center mt-1">
                  {handlePriceChangeIndicator(coin.id)}
                </div>
              </Link>
            </div>
          ))}
        </div>

        <hr className="border-b-2 border-black my-8 w-3/4" />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Trending Coins</h2>
          <ul className="divide-y divide-gray-200">
            {trending.slice(0, 10).map(coin => (
              <li key={coin.id} className="py-4 flex items-center justify-between">
                <Link to={`/${coin.id}`} className="flex items-center space-x-2">
                  <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex items-center space-x-2">
                    <div className="text-lg text-blue-500 hover:underline">{coin.name}</div>
                    <div className="text-gray-700">Price: {coin.priceBtc} BTC</div>
                  </div>
                </Link>
                {graphs[coin.id] && (
                  <ResponsiveContainer width={150} height={100}>
                    <LineChart data={graphs[coin.id]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

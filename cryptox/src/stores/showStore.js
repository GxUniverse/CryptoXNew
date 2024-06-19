import { create } from 'zustand';
import axios from 'axios';
import debounce from 'lodash/debounce';

const showStore = create((set) => ({
  data: null,
  graphData: [],
  loading: false,
  error: null,
  dataCache: {},

  fetchData: debounce(async (coinId) => {
    if (showStore.getState().dataCache[coinId]) {
      set({ data: showStore.getState().dataCache[coinId] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      const data = {
        name: res.data.name,
        symbol: res.data.symbol,
        image: res.data.image.large,
        market_cap_rank: res.data.market_cap_rank,
        market_data: {
          high_24h: { usd: res.data.market_data.high_24h.usd },
          low_24h: { usd: res.data.market_data.low_24h.usd },
          circulating_supply: res.data.market_data.circulating_supply,
          current_price: { usd: res.data.market_data.current_price.usd },
          price_change_percentage_1y: res.data.market_data.price_change_percentage_1y,
        },
      };
      set({ data });
      showStore.getState().fetchGraphData(coinId);
      set(state => ({
        dataCache: { ...state.dataCache, [coinId]: data }
      }));
    } catch (error) {
      console.error('Error fetching coin data:', error);
      set({ error: 'Failed to fetch coin data' });
    } finally {
      set({ loading: false });
    }
  }, 500),

  fetchGraphData: async (coinId) => {
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=365`);
      const graphData = res.data.prices.map(price => ({
        Date: new Date(price[0]).toLocaleDateString(),
        Price: price[1],
      }));
      set({ graphData });
    } catch (error) {
      console.error(`Error fetching graph data for ${coinId}:`, error);
    }
  }
}));

export default showStore;

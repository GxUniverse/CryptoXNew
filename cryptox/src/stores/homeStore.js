import { create } from 'zustand';
import axios from 'axios';
import debounce from 'lodash/debounce';

const homeStore = create((set) => ({
  coins: [],
  trending: [],
  query: '',
  loading: false,
  error: null,
  graphs: {},
  coinCache: {},

  setQuery: debounce((newQuery) => {
    set({ query: newQuery });
    homeStore.getState().searchCoins(newQuery);
  }, 500),

  searchCoins: async (query) => {
    if (query.length <= 2) {
      set({ coins: homeStore.getState().trending });
      return;
    }

    if (homeStore.getState().coinCache[query]) {
      set({ coins: homeStore.getState().coinCache[query] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const coins = res.data.coins.map(coin => ({
        name: coin.name,
        image: coin.large,
        id: coin.id,
      }));
      set({ coins });
      set(state => ({
        coinCache: { ...state.coinCache, [query]: coins }
      }));
    } catch (error) {
      console.error('Error searching coins:', error);
      set({ error: 'Failed to search coins' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCoins: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/search/trending');
      const coins = res.data.coins.map(coin => ({
        name: coin.item.name,
        image: coin.item.large,
        id: coin.item.id,
        priceBtc: coin.item.price_btc,
      }));
      set({ coins, trending: coins });
      coins.forEach(coin => homeStore.getState().fetchCoinGraphData(coin.id));
    } catch (error) {
      console.error('Error fetching coins:', error);
      set({ error: 'Failed to fetch trending coins' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCoinGraphData: async (coinId) => {
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`);
      const graphData = res.data.prices.map(price => ({
        date: new Date(price[0]).toLocaleTimeString(),
        price: price[1],
      }));
      set(state => ({
        graphs: { ...state.graphs, [coinId]: graphData }
      }));
    } catch (error) {
      console.error(`Error fetching graph data for ${coinId}:`, error);
    }
  }
}));

export default homeStore;

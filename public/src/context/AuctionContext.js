import { createContext, useContext } from 'react';

export const AuctionContext = createContext(null);

export const DEFAULT_FILTERS = {
	statuses: [],
	category: '',
	keyword: '',
	start_price: '',
	end_price: '',
	lat: null,
	lng: null,
	radius: '',
};

export function useAuctionContext() {
	return useContext(AuctionContext);
}
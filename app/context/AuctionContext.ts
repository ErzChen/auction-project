import { createContext, useContext } from 'react';
import { AuctionContextType } from '../constants/types';

export const AuctionContext = createContext<AuctionContextType | null>(null);

export function useAuctionContext(): AuctionContextType {
	const context = useContext(AuctionContext);

	if (!context) {
		throw new Error('useAuctionContext must be used within an AuctionProvider');
	}
	return context;
}

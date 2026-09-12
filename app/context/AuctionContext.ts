import { createContext, useContext } from "react";

export const AuctionContext = createContext(null);

export function useAuctionContext() {
    return useContext(AuctionContext);
}
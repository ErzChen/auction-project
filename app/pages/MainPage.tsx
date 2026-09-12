import { AuctionListings } from "../components/AuctionListings";
import { AuctionSearch } from "../components/AuctionSearch";
import { AuctionProvider } from "../context/AuctionProvider";

export default function MainPage() {
    return (
        <AuctionProvider>
            <AuctionSearch />
            <AuctionListings />
        </AuctionProvider>
    );
}
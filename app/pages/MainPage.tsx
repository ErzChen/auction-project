import { AuctionListings } from "../components/AuctionListings";
import { AuctionSearch } from "../components/AuctionSearch";
import Bar from "../components/Bar";
import { AuctionProvider } from "../context/AuctionProvider";
import CreatePage from "./CreatePage";

export default function MainPage() {
    return (
        <AuctionProvider>
            {/* <AuctionSearch />
            <AuctionListings />
            <Bar /> */}
            <CreatePage />
            <Bar />
        </AuctionProvider>
    );
}
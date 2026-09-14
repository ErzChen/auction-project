import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAuctions } from "../lib/auctionActions";
import { getSocket } from "../lib/socket";
import { AuctionContext } from "./AuctionContext";
import { useAuthContext } from "./AuthContext";

const num_listings = 30

export function AuctionProvider({ children }) {
    const [page, setPage] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [auctions, setAuctions] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id: userId } = useAuthContext().user;
    const socketRef = useRef(null);
    if (socketRef.current === null) socketRef.current = getSocket();
    const joinedRoomsRef = useRef(new Set());

    const fetchAuctions = useCallback((keyword, pageNum) => {
        setLoading(true);
        setError(null);

        getAuctions({
            user_id: Number(userId),
            keyword,
            limit: num_listings + 1,
            offset: pageNum * num_listings,
        })
            .then((results) => {
                const list = results || [];
                const hasMore = list.length == num_listings + 1;
                setHasMore(hasMore);
                setAuctions(hasMore ? list.slice(0, num_listings) : list);
            })
            .catch((err) => {
                console.error('Failed to load auctions:', err)
                setError('Could not load listings right now. Try again in a moment.')
                setHasMore(false);
                setAuctions([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const prevPage = useCallback(() => {
        const next = Math.max(0, page - 1);
        if (next === page) return;
        setPage(next);
        fetchAuctions(keyword, next);
    }, [page, keyword, fetchAuctions]);

    const nextPage = useCallback(() => {
        if (!hasMore) return;
        const next = page + 1;
        setPage(next);
        fetchAuctions(keyword, next);
    }, [page, keyword, fetchAuctions, hasMore]);

    useEffect(() => {
        setPage(0);
       fetchAuctions(keyword, page);
    }, [keyword]);

    useEffect(() => {
        const socket = socketRef.current;
        const currentIds = new Set(auctions.map((auction) => auction.auction_id));

        for (const id of currentIds) {
            if (!joinedRoomsRef.current.has(id)) {
                socket.emit('join-auction', id, userId);
                joinedRoomsRef.current.add(id);
            }
        }

        for (const id of joinedRoomsRef.current) {
            if (!currentIds.has(id)) {
                socket.emit('leave-auction', id);
                joinedRoomsRef.current.delete(id);
            }
        }
    }, [auctions])

    useEffect(() => {
		const socket = socketRef.current;

		function updateAuction(auctionId, toUpdate) {
			setAuctions((prev) =>
				prev.map((auction) =>
					auction.auction_id === auctionId ? { ...auction, ...toUpdate } : auction,
				),
			);
		}

        function handleDeleteAuction(auctionId) {
            setAuctions((prev) => prev.filter((auction) => auction.auction_id != auctionId));
        }

		function handleNewBid(data) {
			updateAuction(data.auction_id, { current_price: data.current_price });
		}

		function handleBidCancelled(data) {
			updateAuction(data.auction_id, { current_price: data.current_price });
		}

		function handleUpdateStatus(data) {
			setAuctions((prev) =>
				prev.map((auction) =>
					auction.auction_id === data.auction_id
						? { ...auction, status: data.status }
						: auction,
				),
			);
		}

		socket.on('new-bid', handleNewBid);
		socket.on('bid-cancelled', handleBidCancelled);
        socket.on('delete-auction', handleDeleteAuction);
		socket.on('update-auction-status', handleUpdateStatus);

		return () => {
			socket.off('new-bid', handleNewBid);
			socket.off('bid-cancelled', handleBidCancelled);
            socket.off('delete-auction', handleDeleteAuction);
			socket.off('update-auction-status', handleUpdateStatus);

			for (const id of joinedRoomsRef.current) {
				socket.emit('leave-auction', id);
			}
			joinedRoomsRef.current.clear();
		};
	}, []);

    const value = useMemo(
		() => ({
			auctions,
			loading,
			error,
			page,
			hasMore,
			pageSize: num_listings,
			keyword,
            setKeyword,
			prevPage,
			nextPage,
		}),
		[
			auctions,
			loading,
			error,
			page,
			hasMore,
			keyword,
			prevPage,
			nextPage,
		],
	);

	return (
		<AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
	);
}
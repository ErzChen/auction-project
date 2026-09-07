import { Dispatch, SetStateAction } from "react";

export type AuthContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
    logout: () => Promise<void>;
}

export type User = {
    id: string;
    email: string;
    username: string;
};

export type AuctionFilter = {
    statuses?: Array<string>;
    category?: string;
    keyword?: string;
    start_price?: number;
    end_price?: number;
    id?: number;
    user_id?: number;
    limit?: number;
    offset?: number;
}

export type Auction = {
    auction_id: number;
    user_id: number;
    starting_price: number;
    current_price: number;
    bid_increment_rules: number;
    currency: string;
    winning_user_id: number | null;
    winning_bid_id: number | null;
    title: string;
    description: string;
    condition: string;
    details: string;
    category: string;
    image_paths: string; 
    location: string;
    shipping_pickup_description: string;
    is_shipping_available: boolean;
    shipping_cost: number | null;
    start_time: string;
    end_time: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted: boolean,
    deleted_at: string | null,
}

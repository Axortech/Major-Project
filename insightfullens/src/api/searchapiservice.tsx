import { useState, useCallback, useRef, useEffect } from "react";
import axios, { AxiosError, CancelTokenSource } from "axios";
import debounce from "lodash.debounce";

// API Response Types
interface ApiProduct {
    id: number;
    name: string;
    summary_text?: string;
    reviews: string[];
    extracted_aspects: string[];
    image?: string;
    price?: number;
}

interface ApiResponse {
    products?: ApiProduct | ApiProduct[];
    total_count?: number;
    message?: string;
}

// Search Result Type
export interface SearchResult {
    id: string;
    productName: string;
    summary: string;
    reviews: string[];
    extractedAspects: string[];
    image?: string;
    price?: number;
}

// Review Expansion State Type
type ReviewExpansionState = Record<string, boolean>;

// Constants
const API_BASE_URL = "http://127.0.0.1:8000/api/product/api/product/";

const ERROR_MESSAGES = {
    BAD_REQUEST: "Bad Request. Please check your input.",
    NOT_FOUND: "No products found. Please try a different search.",
    SERVER_ERROR: "Internal Server Error. Please try again later.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    UNEXPECTED_ERROR: "An unexpected error occurred.",
};

// Custom Hook for Product Search
export const useProductSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewExpansion, setReviewExpansion] = useState<ReviewExpansionState>({});
    const cancelTokenSource = useRef<CancelTokenSource | null>(null);

    // Debounced Search Function
    const debouncedSearch = useRef(
        debounce(async (searchQuery: string) => {
            if (cancelTokenSource.current) {
                cancelTokenSource.current.cancel("Operation canceled due to new request.");
            }
            cancelTokenSource.current = axios.CancelToken.source();

            setLoading(true);
            setError(null);

            try {
                const encodedQuery = encodeURIComponent(searchQuery);
                const response = await axios.post<ApiResponse>(
                    API_BASE_URL,
                    { input: encodedQuery },
                    { cancelToken: cancelTokenSource.current.token }
                );

                let products = response.data?.products;

                // Ensure products is always an array
                if (products && !Array.isArray(products)) {
                    products = [products];
                }

                if (Array.isArray(products) && products.length > 0) {
                    setResults(products.map(transformProduct));
                } else {
                    setResults([]);
                    setError(ERROR_MESSAGES.NOT_FOUND);
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    handleAxiosError(err);
                } else {
                    setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
                }
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300)
    ).current;

    // Cleanup on Unmount
    useEffect(() => {
        return () => {
            if (cancelTokenSource.current) {
                cancelTokenSource.current.cancel("Component unmounted");
            }
            debouncedSearch.cancel(); // Cancel debounce on unmount
        };
    }, []);

    // Perform Search
    const performSearch = useCallback(
        (searchQuery: string) => {
            const finalQuery = searchQuery.trim();
            if (!finalQuery) {
                setError("Please enter a search query.");
                return;
            }
            setQuery(finalQuery);
            debouncedSearch(finalQuery);
        },
        [debouncedSearch]
    );

    // Clear Results
    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    // Transform API Product to Search Result
    const transformProduct = (product: ApiProduct): SearchResult => ({
        id: product.id.toString(),
        productName: product.name || "Unknown Product",
        summary: product.summary_text || "",
        reviews: Array.isArray(product.reviews) ? product.reviews : [],
        extractedAspects: Array.isArray(product.extracted_aspects) ? product.extracted_aspects : [],
        image: product.image,
        price: product.price ?? undefined,
    });

    // Handle Axios Errors
    const handleAxiosError = (err: unknown) => {
        if (axios.isCancel(err)) {
            console.log("Request canceled by user");
            return;
        }

        const axiosError = err as AxiosError; // Explicitly cast to AxiosError

        if (axiosError.response) {
            switch (axiosError.response.status) {
                case 400:
                    setError(ERROR_MESSAGES.BAD_REQUEST);
                    break;
                case 404:
                    setError(ERROR_MESSAGES.NOT_FOUND);
                    break;
                case 500:
                    setError(ERROR_MESSAGES.SERVER_ERROR);
                    break;
                default:
                    setError(`${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${axiosError.response.status}`);
            }
        } else {
            setError(ERROR_MESSAGES.NETWORK_ERROR);
        }
    };


    // Toggle Review Expansion
    const toggleReviewExpansion = (productId: string) => {
        setReviewExpansion((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        performSearch,
        clearResults,
        reviewExpansion,
        toggleReviewExpansion,
    };
};

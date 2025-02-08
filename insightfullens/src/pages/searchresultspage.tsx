import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProductSearch } from "../api/searchapiservice";

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") || ""; // Get query from URL
    const navigate = useNavigate();
    const { results, error, performSearch, loading, reviewExpansion, toggleReviewExpansion } = useProductSearch();
    const [query, setLocalQuery] = useState(searchQuery);

    const handleSearch = useCallback(() => {
        if (!query.trim() || query === searchQuery) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
        performSearch(query);
    }, [query, searchQuery, navigate, performSearch]);

    useEffect(() => {
        if (searchQuery && searchQuery !== query) {
            setLocalQuery(searchQuery);
            performSearch(searchQuery);
        }
    }, [searchQuery, query, performSearch]);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Title */}
            <h1 className="text-[#e43d12] font-bold uppercase mb-6 text-center text-3xl sm:text-4xl">
                Search Results
            </h1>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
                <input
                    type="text"
                    placeholder="Search for a product..."
                    value={query}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-14 pr-12 py-3 text-lg border border-[#e43d12] rounded-full"
                />
                {query && (
                    <button
                        onClick={() => setLocalQuery("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={!query.trim() || loading}
                className="mt-4 px-6 py-3 font-semibold text-lg rounded-full bg-[#e43d12] hover:bg-[#d6536d] text-white"
            >
                {loading ? "Searching..." : "Search"}
            </button>

            {/* Results */}
            <div className="mt-6 w-full">
                {loading && <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}

                {error && <p className="text-red-500 font-semibold text-center">{error}</p>}

                {!loading && results.length === 0 && (
                    <div className="flex flex-col items-center mt-6">
                        <p className="text-gray-500">Oops! No results found.</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 p-4 md:p-6">
                        {results.map((result) => (
                            <div key={result.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="md:w-1/3 lg:w-1/4">
                                        {result.image ? (
                                            <img src={result.image} alt={result.productName} className="w-full h-64 md:h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-64 md:h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No image available</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 p-6">
                                        <h2 className="text-xl font-bold">{result.productName}</h2>
                                        <p className="text-gray-600">{result.summary}</p>

                                        {/* Reviews */}
                                        {result.reviews.length > 0 && (
                                            <div className="mt-4">
                                                <h3 className="font-semibold">User Reviews ({result.reviews.length}):</h3>
                                                {(reviewExpansion[result.id] ? result.reviews : result.reviews.slice(0, 3)).map((review, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-gray-600 text-sm italic">
                                                        {review}
                                                    </div>
                                                ))}
                                                {result.reviews.length > 3 && (
                                                    <button
                                                        onClick={() => toggleReviewExpansion(result.id)}
                                                        className="text-blue-500 text-sm hover:underline"
                                                    >
                                                        {reviewExpansion[result.id] ? "Show less" : "View more reviews"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;

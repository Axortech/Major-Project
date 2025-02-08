import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProductSearch } from "../../api/searchapiservice"; // API Hook

const HomeSearch: React.FC = () => {
    const [query, setQuery] = useState(""); // Search input state
    const navigate = useNavigate(); // React Router navigation
    const [searchParams] = useSearchParams(); // Get query parameters
    const { loading, performSearch, results, error } = useProductSearch();

    // Load search query from URL on mount
    useEffect(() => {
        const queryFromURL = searchParams.get("q") || "";
        if (queryFromURL) {
            setQuery(queryFromURL);
            performSearch(queryFromURL);
        }
    }, [searchParams, performSearch]);

    // Redirect when results are ready and no errors
    useEffect(() => {
        if (!loading && results.length > 0 && !error) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    }, [loading, results, error, navigate, query]);

    const handleSearch = async () => {
        if (!query.trim() || loading) return; // Prevent empty searches & avoid duplicate API calls
        await performSearch(query); // Wait for API response before navigating
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Title */}
            <h1 className="text-[#e43d12] font-bold uppercase mb-8 text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                INSIGHTFULLENS
            </h1>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
                {/* Search Icon */}
                <div className="absolute left top-1/2 transform -translate-y-1/2 bg-[#e43d12] text-white p-3 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.5 10a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                    </svg>
                </div>

                {/* Input */}
                <input
                    type="text"
                    placeholder="Search for a product..."
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-14 pr-12 py-3 text-lg border border-[#e43d12] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Search input"
                />

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label="Clear search"
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={!query.trim() || loading}
                className={`mt-4 px-6 py-3 font-semibold text-lg rounded-full shadow-md flex items-center transition-all duration-300 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#e43d12] hover:bg-[#d6536d] text-white"
                }`}
            >
                {loading ? (
                    <>
                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></span>
                        <span className="text-white">Searching...</span>
                    </>
                ) : (
                    "Search"
                )}
            </button>

            {/* Error Message */}
            {error && (
                <p className="mt-4 text-red-500 text-lg font-semibold">
                    {error}
                </p>
            )}
        </div>
    );
};

export default HomeSearch;

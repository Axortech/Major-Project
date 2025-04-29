import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProductSearch } from "../api/searchapiservice";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || ""; // Get query from URL
  const navigate = useNavigate();
  const {
    results,
    error,
    performSearch,
    loading,
    reviewExpansion,
    toggleReviewExpansion,
  } = useProductSearch();
  const [query, setLocalQuery] = useState(searchQuery);

  const handleSearch = useCallback(() => {
    if (!query.trim() || query === searchQuery) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  }, [query, searchQuery, navigate, performSearch]);

  useEffect(() => {
    if (searchQuery) {
      setLocalQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

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
        {loading && (
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        )}

        {error && (
          <p className="text-red-500 font-semibold text-center">{error}</p>
        )}

        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center mt-6">
            <p className="text-gray-500">Oops! No results found.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 p-4 md:p-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Product Info */}
                  <div className="flex-1 p-6">
                    <h2
                      className="text-xl font-bold leading-tight text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/product/${result.id}`)}
                    >
                      {result.productName}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      <strong>Overall Summary:</strong> {result.summary}
                    </p>
                    {/* <p className="text-gray-600">{result.extractedAspects}</p> */}
                    {Array.isArray(result.extractedAspects) &&
                    result.extractedAspects.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.extractedAspects.map((aspect, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              aspect.includes("negative")
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {aspect}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No aspects available</p>
                    )}

                    {/* Reviews */}
                    {result.reviews.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-lg">
                          User Reviews ({result.reviews.length}):
                        </h3>
                        <div className="flex flex-col gap-3 mt-2">
                          {(reviewExpansion[result.id]
                            ? result.reviews
                            : result.reviews.slice(0, 3)
                          ).map((review, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <p className="text-gray-700 text-sm">{review}</p>
                            </div>
                          ))}
                        </div>
                        {result.reviews.length > 3 && (
                          <button
                            onClick={() => toggleReviewExpansion(result.id)}
                            className="mt-2 text-blue-500 text-sm hover:underline"
                          >
                            {reviewExpansion[result.id]
                              ? "Show less"
                              : "View more reviews"}
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

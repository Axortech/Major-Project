// types.ts

// // Main search result interface
// export interface SearchResult {
//   id: string;
//   productName: string;
//   summary: string;
//   reviews: string[];
//   extractedAspects: string[];
//   image?: string;
//   price?: number;
// }

// // Props for components
// export interface HomeSearchProps {
//   onSearch: (query: string) => void;
//   loading?: boolean;
// }

// export interface SearchResultsProps {
//   results: SearchResult[];
//   error?: string;
// }

// export interface SearchResultsPageProps {
//   initialQuery: string;
//   results: SearchResult[];
//   loading: boolean;
//   error?: string;
//   onSearch: (query: string) => void;
// }

// // Helper type for aspect formatting
// export interface FormattedAspect {
//   key: string;
//   value: string;
//   sentiment: 'positive' | 'negative' | 'neutral';
// }

// // API response type
// export interface SearchApiResponse {
//   results: SearchResult[];
//   totalCount: number;
//   message?: string;
// }

// // Custom hook return type
// export interface UseProductSearchReturn {
//   results: SearchResult[];
//   loading: boolean;
//   error?: string;
//   query: string;
//   setQuery: (query: string) => void;
//   performSearch: (searchQuery: string) => Promise<void>;
//   clearResults: () => void;
// }

// // Review expansion state type
// export interface ReviewExpansionState {
//   [key: string]: boolean;
// }
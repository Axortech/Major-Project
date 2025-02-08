import { useState, useEffect } from "react";

type FetchData<T> = (() => Promise<T>) | null; // Allow cases where no API call is needed

type UseLoadingResult<T> = {
  loading: boolean;
  data: T | null;
  error: string | null;
};

const useLoading = <T>(fetchData: FetchData<T>): UseLoadingResult<T> => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (!fetchData) {
        // No API call? Just delay for 0.5s, then show the page
        setTimeout(() => setLoading(false), 1000);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchData();
        setData(response);
      } catch (err) {
        console.error("Data fetch failed:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDataAsync();
  }, [fetchData]);

  return { loading, data, error };
};

export default useLoading;

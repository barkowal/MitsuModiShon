import type { ResponseError } from "@/lib/types/ServerResponseTypes";
import { useState, useCallback, useRef } from "react";

function useGetFetch<FetchType>(url: string) {
  const [data, setData] = useState<FetchType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const getData = useCallback(async (params: string = "") => {

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      const response = await fetch(url + params, {
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        const errorJSON: ResponseError = await response.json();
        throw errorJSON.error;
      }

      const dataJSON: FetchType = await response.json();
      setData(dataJSON);

    } catch (error: unknown) {

      if (typeof error === "string") {
        setError(error);
      } else if (error instanceof Error) {

        if (error.name === "AbortError") {
          console.warn("Aborted request!");
          return;
        }
        setError(error.message);

      } else {
        console.warn(error);
      }

    } finally {
      setIsLoading(false);
    }

  }, [url]);


  return { data, isLoading, error, getData };
}

export default useGetFetch;

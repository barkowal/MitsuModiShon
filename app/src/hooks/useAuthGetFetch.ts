import type { ResponseError } from "@/lib/types/ServerResponseTypes";
import { useState, useCallback, useRef } from "react";
import { useAuth } from "./auth/useAuth";

export function useAuthGetFetch<FetchType>(url: string) {
  const auth = useAuth();
  const [data, setData] = useState<FetchType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const getData = useCallback(async (params: string = "") => {

    if (auth === null) {
      console.warn("Error at react hook. Auth is not provided.");
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      const response = await auth.authFetch(url + params, {
        signal: abortControllerRef.current?.signal,

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

  }, [url, auth]);


  return { data, isLoading, error, getData };
}


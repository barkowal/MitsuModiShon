import type { ResponseError } from "@/lib/types/ServerResponseTypes";
import { useState, useCallback, useRef } from "react";
import { useAuth } from "./auth/useAuth";

export function useAuthFetch<FetchType>(url: string) {
  const auth = useAuth();
  const [response, setResponse] = useState<FetchType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const makeRequest = useCallback(async (params: string = "", method: string, body?: FormData | string, headers?: Record<string, string>) => {

    if (auth === null) {
      console.warn("Error at react hook. Auth is not provided.");
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      let reply;
      if (!body) {
        reply = await auth.authFetch(url + params, {
          signal: abortControllerRef.current?.signal,
          method: method,
          credentials: "include",
        });
      } else {
        reply = await auth.authFetch(url + params, {
          signal: abortControllerRef.current?.signal,
          method: method,
          body: body,
          headers: headers,
          credentials: "include",
        });
      }

      if (!reply.ok) {
        const errorJSON: ResponseError = await reply.json();
        throw errorJSON.error;
      }

      const dataJSON: FetchType = await reply.json();
      setResponse(dataJSON);

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


  return { response, isLoading, error, makeRequest };
}


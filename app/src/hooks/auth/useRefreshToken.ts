export function useRefreshToken() {

  const refresh = async () => {
    try {
      const response = await fetch(`/api/v1/auth/refresh`, {
        method: "GET",
        credentials: "include",
      });
      const res = await response.json();

      if (!response.ok) {
        if (res.error) {
          console.warn(res.error);
          return res.error;
        } else {
          return "Something went wrong.";
        }
      }
    } catch (err) {
      console.warn(err);
      return "Something went wrong.";
    }
  };

  return refresh;

} 

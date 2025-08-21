import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/hooks/auth/useAuth";
import type { LoginResponseType } from "@/lib/types/ServerResponseTypes";
import type { LoginFormType } from "@/lib/types/Schemas";

const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [userName, setUserName] = useState<string>(localStorage.getItem("username") || "");
    const navigate = useNavigate();

    const loginAction = async (data: LoginFormType) => {
        try {
            const response = await fetch(`/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();

            if (response.ok) {
                if (res) {
                    const loginResponse: LoginResponseType = res;
                    setUserName(loginResponse.data.username);
                    localStorage.setItem("username", loginResponse.data.username);
                    navigate("/");
                    return "";
                }
            } else {
                if (res.error) {
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

    const logOut = async () => {
        try {
            const response = await fetch(`/api/v1/auth/refresh/logout`, {
                method: "DELETE",
                credentials: "include",
            });
            const res = await response.json();

            if (response.ok) {
                if (res) {
                    setUserName("");
                    localStorage.removeItem("username");
                    navigate("/login");
                    return "";
                }
            } else {
                if (res.error) {
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

    const authFetch = async (...args: [RequestInfo, RequestInit?]) => {
        const [resource, config] = args;
        const response = await fetch(resource, config);
        if (!response.ok && response.status === 401 && userName !== "") {

            const response = await fetch(`/api/v1/auth/refresh`, {
                method: "GET",
                credentials: "include",
            });
            const res = await response.json();

            if (!res.ok) {
                setUserName("");
                localStorage.removeItem("username");
                return Promise.reject(response);
            } else {
                const newResponse = await fetch(resource, config);
                return newResponse;
            }

        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ userName, loginAction, logOut, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

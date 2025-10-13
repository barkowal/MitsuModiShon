import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import React from "react";
import LoginForm from "../../src/pages/account/Login/LoginForm.tsx";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

interface AuthMockType {
  userName: string
  loginAction: CallableFunction;
  logOut: CallableFunction;
  authFetch: CallableFunction;
}

describe("LoginForm", () => {

  const renderLoginForm = () => {
    render(<BrowserRouter> <LoginForm /> </BrowserRouter>);

    const emailField = screen.getByRole("textbox", { name: "Email" });

    // TODO: find a solution to finding password by role
    // const passwordField = screen.getByRole("textbox", {name:/Password/});
    const passwordField = screen.getByPlaceholderText(/Password/);

    const loginButton = screen.getByRole("button", { name: "Login" });

    return { emailField: emailField, passwordField: passwordField, loginButton };
  };

  it("Should contain email and password fields", () => {
    const { emailField, passwordField, loginButton } = renderLoginForm();

    expect( emailField).toBeDefined();
    expect(passwordField).toBeDefined();
    expect(loginButton).toBeDefined();

  });

  it("Should validate email field", async () => {
    const { emailField, loginButton } = renderLoginForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(emailField, "wrongemail");

    fireEvent.submit(loginButton);

    await vi.waitFor(() => screen.getAllByText(/LoginFormEmailError/));

    expect(screen.getAllByText(/LoginFormEmailError/)).toBeDefined();

  });

  it("Should validate password field", async () => {
    const { passwordField, loginButton } = renderLoginForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(passwordField, "weak");

    fireEvent.submit(loginButton);

    await vi.waitFor(() => screen.getAllByText(/LoginFormPasswordMin8CharacterError/));

    expect(screen.getAllByText(/LoginFormPasswordMin8CharacterError/)).toBeDefined();

  });

  it("Should submit correct form data", async () => {
    vi.mock("@/hooks/auth/useAuth", async () => {
      return {
        useAuth: vi.fn(() => {
          const mockData: AuthMockType = {
            userName: "name",
            loginAction: (loginData) => {
              if (loginData.email === "user@mail.com" && loginData.password === "StrongPassword123!*") {
                return "Logged succesfully";
              } else { return "Wrong email or password"; }
            },
            logOut: () => { },
            authFetch: () => { },
          };
          return mockData;
        })
      };
    });

    const { emailField, passwordField, loginButton } = renderLoginForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(emailField, "user@mail.com");
    await user.type(passwordField, "StrongPassword123!*");

    fireEvent.submit(loginButton);

    await vi.waitFor(() => screen.getAllByText(/Logged succesfully/));
    expect(screen.getAllByText(/Logged succesfully/)).toBeDefined();
  });


});

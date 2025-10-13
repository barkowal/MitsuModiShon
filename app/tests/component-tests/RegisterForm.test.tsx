import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import React from "react";
import RegisterForm from "../../src/pages/account/Register/RegisterForm";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("RegisterForm", () => {

  const renderRegisterForm = () => {
    render(<BrowserRouter> <RegisterForm /> </BrowserRouter>);

    const usernameField = screen.getByPlaceholderText(/Username/);
    const emailField = screen.getByPlaceholderText(/Email/);
    const passwordField = screen.getByPlaceholderText(/Password/);

    const registerButton = screen.getByRole("button", { name: "REGISTERNOW" });

    return { usernameField, emailField, passwordField, registerButton };
  };

  it("Should contain username, email and password fields", () => {
    const { usernameField, emailField, passwordField } = renderRegisterForm();

    expect(usernameField).toBeDefined();
    expect(emailField).toBeDefined();
    expect(passwordField).toBeDefined();
  });

  it("Should validate username field", async () => {
    const { usernameField, registerButton } = renderRegisterForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(usernameField, "x");

    fireEvent.submit(registerButton);

    await vi.waitFor(() => screen.getAllByText(/LoginFormUsernameMin2CharactersError/));

    expect(screen.getAllByText(/LoginFormUsernameMin2CharactersError/)).toBeDefined();

  });

  it("Should validate email field", async () => {
    const { emailField, registerButton } = renderRegisterForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(emailField, "wrongemail");

    fireEvent.submit(registerButton);

    await vi.waitFor(() => screen.getAllByText(/LoginFormEmailError/));

    expect(screen.getAllByText(/LoginFormEmailError/)).toBeDefined();

  });

  it("Should validate password field", async () => {
    const { passwordField, registerButton } = renderRegisterForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(passwordField, "weak");

    fireEvent.submit(registerButton);

    await vi.waitFor(() => screen.getAllByText(/LoginFormPasswordMin8CharacterError/));

    expect(screen.getAllByText(/LoginFormPasswordMin8CharacterError/)).toBeDefined();

  });

  it("Should submit correct form data", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      Promise.resolve({
        json: () => Promise.resolve({ data: {} }),
        ok: true,
        status: 200
      })
    );

    const { usernameField, emailField, passwordField, registerButton } = renderRegisterForm();
    const user = userEvent.setup({ skipHover: true });

    await user.type(usernameField, "user");
    await user.type(emailField, "user@mail.com");
    await user.type(passwordField, "StrongPassword123!*");

    fireEvent.submit(registerButton);

    // TODO: is there a better solution?
    // Awaiting for screen changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const registerError = screen.queryByText(/Something went wrong./);
    expect(registerError).toBeNull();

  });

});

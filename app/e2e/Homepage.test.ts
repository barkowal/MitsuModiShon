import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("Should have correct title and page heading", async ({ page }) => {

    await expect(page).toHaveTitle(/MitsuModiShon/);

    await expect(page.getByRole("heading", { name: "mitsumodishon" })).toBeVisible();

  });

  test("Should have links to editor, animation and object listings", async ({ page }) => {

    await expect(page.getByRole("link", { name: "editor" })).toBeVisible();
    await expect(page.getByRole("link", { name: "animation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "objects3d" })).toBeVisible();
    await expect(page.getByRole("link", { name: "scenes" })).toBeVisible();

  });

  test("Should redirect to correct pages on click", async ({ page }) => {
    await page.getByRole("link", { name: "editor" }).click();

    await expect(page.url()).toContain("Editor");

    await page.goBack();
    await page.getByRole("link", { name: "animation" }).click();
    await expect(page.url()).toContain("Animation");

    await page.goBack();
    await page.getByRole("link", { name: "objects3d" }).click();
    await expect(page.url()).toContain("Object3DListing");

    await page.goBack();
    await page.getByRole("link", { name: "scenes" }).click();
    await expect(page.url()).toContain("AnimationSceneListingPage");

  });

  test("Should change color theme to light", async ({ page }) => {

    await expect(page.getByRole("button", { name: "toggle theme" })).toHaveCSS("background-color", "oklab(1 0 0 / 0.045)");

    await page.getByRole("button", { name: "toggle theme" }).click();
    await expect(page.getByRole("menuitem", { name: "light" })).toBeVisible();
    await page.getByRole("menuitem", { name: "light" }).click();

    await expect(page.getByRole("button", { name: "toggle theme" })).toHaveCSS("background-color", "oklch(1 0 0)");
  });

  test("Should change language to polish", async ({ page }) => {
    await expect(page.getByText("simple")).toBeVisible();

    await page.getByRole("button", { name: "toggle language" }).click();
    await expect(page.getByRole("menuitem", { name: "polish" })).toBeVisible();
    await page.getByRole("menuitem", { name: "polish" }).click();

    await expect(page.getByText("prosta")).toBeVisible();
  });

});

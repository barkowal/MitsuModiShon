import { test, expect } from "@playwright/test";

test.describe("Animation", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/Animation");
  });

  test("Should show playback panel and animation button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Animate" })).toBeVisible();
    await expect(page.getByLabel("Playback panel")).toBeVisible();
  });

  test("Should render empty canvas with axes and grid helpers", async ({ page }) => {
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should show object animation options, when clicked on animation button", async ({ page }) => {
    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("button", { name: "Animate" }).click();

    await expect(page.getByRole("checkbox", {name: "Enable"})).toBeVisible();
    await expect(page.locator("#Loopable")).toBeVisible();
    await expect(page.getByLabel("Animation keyframes")).toBeVisible();
  });

  test("Should change current keyframe on forward/rewind button click", async ({ page }) => {
    await expect(page.getByLabel("Current keyframe").getByText(/0/)).toBeVisible();

    await page.getByLabel("Forward button").click();
    await expect(page.getByLabel("Current keyframe").getByText(/10/)).toBeVisible();

    await page.getByLabel("Rewind button").click();
    await expect(page.getByLabel("Current keyframe").getByText(/0/)).toBeVisible();
  });

  // Move object to X=8 at frame 40, then check frame 10 if object is near X=2 
  test("Should animate position of the object", async ({ page }) => {
    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("button", { name: "Animate" }).click();
    await page.getByLabel("Animation keyframes").getByRole("button", { name: "Add" }).click();

    await page.getByLabel("Forward button").click();
    await page.getByLabel("Forward button").click();
    await page.getByLabel("Forward button").click();
    await page.getByLabel("Forward button").click();

    await page.getByLabel("PositionMenu").getByRole("textbox").first().fill("8");
    await page.locator("canvas").click();

    await page.getByLabel("Animation keyframes").getByRole("button", { name: "Add" }).click();

    await page.getByRole("checkbox", {name: "Enable"}).click();

    await page.getByLabel("Rewind button").click();
    await page.getByLabel("Rewind button").click();
    await page.getByLabel("Rewind button").click();

    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

});

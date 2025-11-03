import { test, expect } from "@playwright/test";

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/Editor");
  });

  test("Should render empty canvas with axes and grid helpers ", async ({ page }) => {
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should add default plane object to the scene", async ({ page }) => {
    await page.getByRole("button", { name: "AddObjectButton" }).click();

    await expect(page.getByRole("combobox")).toHaveText("Plane");

    await page.getByRole("button", { name: "ADD" }).click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should change the background color of the scene to red", async ({ page }) => {
    await page.getByLabel("SceneColorMenu").getByLabel("HexColorInput").fill("ff0000");
    await page.locator("canvas").click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should contain camera object in tree view", async ({ page }) => {
    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Camera/)).toBeVisible();
  });

  test("Should contain created mesh in tree view", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).toBeVisible();
  });

  test("Should create light object", async ({ page }) => {

    await page.getByRole("button", { name: "addLight-dialog-button" }).click();
    await page.getByRole("button", { name: "addLight-button" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await expect(page.getByLabel("TreeSceneView").getByText(/AmbientLight/)).toBeVisible();
  });

  test("Should create and remove selected mesh", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("button", { name: "RemoveObjectButton" }).click();

    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).not.toBeVisible();
  });

  test("Should change name of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("textbox", { name: "Name" }).fill("test name");
    await page.getByRole("button", { name: "change" }).click();
    await expect(page.getByLabel("TreeSceneView").getByText("test name")).toBeVisible();
  });

  test("Should undo adding a new object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).toBeVisible();

    await page.getByRole("button", { name: "UndoButton" }).click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).not.toBeVisible();
  });

  test("Should redo adding object which was undone", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).toBeVisible();

    await page.getByRole("button", { name: "UndoButton" }).click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).not.toBeVisible();

    await page.getByRole("button", { name: "RedoButton" }).click();
    await expect(page.getByLabel("TreeSceneView").getByText(/Mesh/)).toBeVisible();
  });

  test("Should change position of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByLabel("PositionMenu").getByRole("textbox").first().fill("2");
    await page.locator("canvas").click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should change scale of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByLabel("ScaleMenu").getByRole("textbox").first().fill("4");
    await page.locator("canvas").click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should change rotation of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByLabel("RotationMenu").getByRole("textbox").first().fill("45");
    await page.getByLabel("RotationMenu").getByRole("textbox").nth(2).fill("45");
    await page.locator("canvas").click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should hide selected object on deselecting editor layer", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByText(/Editor Layer/).click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });

  });

  test("Should change to edit mode of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("button", { name: "Object Mode" }).click();
    await page.getByRole("menuitem", { name: "Edit Mode" }).click();

    await expect(page.getByRole("radio", { name: "Toggle Vertices" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Toggle Edges" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Toggle Faces" })).toBeVisible();

    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

  test("Should change to paint mode and draw outline of selected object", async ({ page }) => {

    await page.getByRole("button", { name: "AddObjectButton" }).click();
    await page.getByRole("button", { name: "ADD" }).click();

    await page.getByLabel("TreeSceneView").locator(".lucide.lucide-chevron-right").click();
    await page.getByLabel("TreeSceneView").getByText(/Mesh/).click();

    await page.getByRole("button", { name: "Object Mode" }).click();
    await page.getByRole("menuitem", { name: "Paint Mode" }).click();

    await expect(page.getByRole("radio", { name: "Toggle VertexColor" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Toggle DrawLine" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Toggle DrawOutline" })).toBeVisible();

    await page.getByRole("radio", { name: "Toggle DrawOutline" }).click();
    await expect(page.locator("canvas")).toHaveScreenshot({ mask: [page.getByText("RenderTime")] });
  });

});

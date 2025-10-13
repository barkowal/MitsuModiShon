import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddLightDialog } from "../../src/pages/editor/ui/AddLightDialog";


describe("AddLightDialog", () => {

  const renderLightDialog = async () => {
    render(<AddLightDialog />);
    const user = userEvent.setup();

    const openButton = screen.queryAllByLabelText("addLight-dialog-button");
    if (openButton.length === 1)
      await user.click(openButton[0]);

    const selectBox = screen.getByRole("combobox");

    return { user: user, selectBox: selectBox};
  };

  it("should open light dialog", async () => {
    const { selectBox } = await renderLightDialog();
    expect(selectBox).toBeDefined();
  });

  it("should contain select options with: ambient and point light", async () => {

    const { selectBox } = await renderLightDialog();
    expect(selectBox).toBeDefined();

    fireEvent.pointerDown(
      selectBox,
      new PointerEvent("pointerdown", {
        ctrlKey: false,
        button: 0,
      })
    );

    const content = screen.getAllByLabelText("light-options");
    expect(content).toHaveLength(2);

    // If some value is selected, there can be more than one instance
    const option1 = screen.getAllByText("AmbientLight");
    expect(option1).toBeDefined();

    const option2 = screen.getAllByText("PointLight");
    expect(option2).toBeDefined();

  });

  it("should contain light color and intensity", async () => {

    await renderLightDialog();

    const colorOption = screen.getByLabelText("light-color-option");
    expect(colorOption).toBeDefined();

    const intensityOption = screen.getByLabelText("light-intensity-option");
    expect(intensityOption).toBeDefined();

  });

  it("should close dialog by clicking on close button", async () => {

    const { user } = await renderLightDialog();

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);

    const selectBox = screen.queryByRole("combobox");
    expect(selectBox).toBeNull();
  });

});

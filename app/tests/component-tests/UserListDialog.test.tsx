import { UserListDialog } from "../../src/pages/listPage/listComponents/UserListDialog";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const MockShortObjectData = {
  id: 1,
  name: "test-object",
  createdAt: Date.now(),
  imgPath: "path",
  username: "testUser",
  isPublic: true,
  isAnimated: false,
};

describe("UserListDialog", () => {

  const renderUserListDialog = () => {
    render(<UserListDialog
      data={MockShortObjectData}
      showDialog={true}
      setShowDialog={() => { }}
      dialogDescriptionTexts={["text1", "text2"]}
      downloadUrl=""
      deleteUrl=""
      patchUrl="" />);
  };

  it("Should render download image, download data, change and delete buttons", () => {
    renderUserListDialog();

    const downloadDataLink = screen.getByText("DownloadData");
    expect(downloadDataLink).toBeDefined();

    const downloadImageLink = screen.getByRole("link", { name: "DownloadImage" });
    expect(downloadImageLink).toBeDefined();

    const changeButton = screen.getByRole("button", { name: "CHANGE" });
    expect(changeButton).toBeDefined();

    const deleteButton = screen.getByRole("button", { name: "DELETE" });
    expect(deleteButton).toBeDefined();

  });

  it("Should show visibility checkbox and name field when clicked on change", async () => {
    renderUserListDialog();

    const changeButton = screen.getByRole("button", { name: "CHANGE" });
    const user = userEvent.setup({ skipHover: true });
    await user.click(changeButton);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDefined();

    const nameTextBox = screen.getByRole("textbox");
    expect(nameTextBox).toBeDefined();

  });

});

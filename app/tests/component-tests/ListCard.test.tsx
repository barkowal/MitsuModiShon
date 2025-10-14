import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListCard } from "../../src/pages/listPage/listComponents/ListCard";
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

describe("ListCard", () => {

  const renderCard = () => {
    render(<ListCard
      key={1}
      data={MockShortObjectData}
      cardDescriptionTexts={[
        "StaticObject",
        `PublishedBy: ${MockShortObjectData.username}`,
        `CreatedAt: ${MockShortObjectData.createdAt.toString()}`,
      ]}
      dialogDescriptionTexts={["dialogDesc1", "dialogDesc2"]}
      downloadUrl="" isUsers={false} />);
  };

  it("Should contain title, object type, username and creation date", () => {
    renderCard();
    const titleField = screen.getByText(MockShortObjectData.name);
    expect(titleField).toBeDefined();

    const typeField = screen.getByText(/StaticObject/);
    expect(typeField).toBeDefined();

    const usernameField = screen.getByText(MockShortObjectData.username, { exact: false });
    expect(usernameField).toBeDefined();

    const dateField = screen.getByText(MockShortObjectData.createdAt.toString(), { exact: false });
    expect(dateField).toBeDefined();

  });

  it("Should hide dialog when rendered", () => {
    renderCard();
    const downloadLink = screen.queryByRole("link", { name: "DownloadImage" });
    expect(downloadLink).toBeNull();

  });

  it("Should open dialog when clicked", async () => {
    renderCard();

    const titleField = screen.getByText(MockShortObjectData.name);
    const user = userEvent.setup({ skipHover: true });
    await user.click(titleField);

    const downloadLink = screen.getByRole("link", { name: "DownloadImage" });
    expect(downloadLink).toBeDefined();
  });

  it("Should close dialog when clicked on close button", async () => {
    renderCard();

    const titleField = screen.getByText(MockShortObjectData.name);
    const user = userEvent.setup({ skipHover: true });

    await user.click(titleField);

    const downloadLink = screen.getByRole("link", { name: "DownloadImage" });
    expect(downloadLink).toBeDefined();

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);

    const downloadLink2 = screen.queryByRole("link", { name: "DownloadImage" });
    expect(downloadLink2).toBeNull();
  });


});

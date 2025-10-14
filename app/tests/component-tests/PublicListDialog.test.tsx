import { PublicListDialog } from "../../src/pages/listPage/listComponents/PublicListDialog";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

const MockShortObjectData = {
  id: 1,
  name: "test-object",
  createdAt: Date.now(),
  imgPath: "path",
  username: "testUser",
  isPublic: true,
  isAnimated: false,
};

describe("PublicListDialog", () => {

  const renderPublicListDialog = () => {
    render(<PublicListDialog
      data={MockShortObjectData}
      showDialog={true}
      setShowDialog={() => { }}
      dialogDescriptionTexts={["text1", "text2"]}
      downloadUrl=""
      />);
  };

  it("Should render download image and download data", () => {
    renderPublicListDialog();

    const downloadDataLink = screen.getByText("DownloadData");
    expect(downloadDataLink).toBeDefined();

    const downloadImageLink = screen.getByRole("link", { name: "DownloadImage" });
    expect(downloadImageLink).toBeDefined();

  });

});

import { useEffect } from "react";
import { editorEventBus } from "./editor/utils/EditorEvents";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();

  //TODO delete later
  useEffect(() => {
    editorEventBus.showAllListeners();
  });

  return (
    <>
      <div className="flex justify-center items-center text-4xl h-full w-full text-center">
        <div>
          <h1> MITSUMODISHON</h1>
          <p className="text-xl"> {t("HomePageWelcome")}</p>
        </div>
      </div >
    </>
  );
}

export default HomePage;

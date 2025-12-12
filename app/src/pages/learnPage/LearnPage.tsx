import { Trans, useTranslation } from "react-i18next";

export default function LearnPage() {
  const { t } = useTranslation("learn");

  return (<>
    <div className="flex">
      <div className="flex-1 p-6">

        <div id="Section-About" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" id="Learn-Overview">
            {t("AboutTitle")}
          </h1>

          <p className="mb-4">
            {t("AboutText")}
          </p>

          <p className="mb-4">
            {t("AboutLearnPage")}
          </p>

        </div>

        <div id="Section-Overview" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" id="Learn-Overview">
            {t("OverviewTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[80%] h-auto" aria-label="MitsuModiShon_Overview" alt="App overview" src="src/assets/app_screenshots/MitsuModiShon_Overview.png" />
          </div>

          <p className="mb-4">
            {t("OverviewImgText")}
          </p>

          <p className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewTopBarText"
              components={{ul:<ul className="list-disc pl-4" />, li:<li className="ml-4" />}}
              />
          </p>

          <p className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewOutlinerText"
              components={{ul:<ul className="list-disc pl-4" />, li:<li className="ml-4" />}}
              />
          </p>

          <p className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewSidePanelText"
              components={{ul:<ul className="list-disc pl-4" />, li:<li className="ml-4" />}}
              />
          </p>

          <p className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewToolBarText"
              components={{ul:<ul className="list-disc pl-4" />, li:<li className="ml-4" />}}
              />
          </p>

        </div>


      </div>

      <div className="sticky top-16 h-screen w-64 p-4">
        <h2 className="text-xl mb-4">On this page</h2>
        <ul>
          <li className="mb-2">
            <a href="#Learn-Overview" className=" hover:underline">About</a>
          </li>
          <li className="mb-2">
            <a href="#Learn-Overview" className=" hover:underline">Overview</a>
          </li>
          <li className="mb-2">
            <a href="#section3" className=" hover:underline">Animation features</a>
          </li>
          <li className="mb-2">
            <a href="#section2" className=" hover:underline">Shortcuts</a>
          </li>
          <li className="mb-2">
            <a href="#section4" className=" hover:underline">Adding objects</a>
          </li>
          <li className="mb-2">
            <a href="#section4" className=" hover:underline">Adding lights</a>
          </li>
          <li className="mb-2">
            <a href="#section4" className=" hover:underline">Layers</a>
          </li>
          <li className="mb-2">
            <a href="#section4" className=" hover:underline">Materials</a>
          </li>
          <li className="mb-2">
            <a href="#section4" className=" hover:underline">Editor modes</a>
            <ul>
              <li className="ml-4">
                <a href="#section4" className=" hover:underline">Object mode</a>
              </li>
              <li className="ml-4">
                <a href="#section4" className=" hover:underline">Edit mode</a>
              </li>
              <li className="ml-4">
                <a href="#section4" className=" hover:underline">Paint mode</a>
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <a href="#section5" className=" hover:underline">Rendering</a>
          </li>
          <li className="mb-2">
            <a href="#section5" className=" hover:underline">Saving</a>
          </li>
          <li className="mb-2">
            <a href="#section5" className=" hover:underline">Cloud features</a>
            <ul>
              <li className="ml-4">
                <a href="#section4" className=" hover:underline">Saving to the cloud</a>
              </li>
              <li className="ml-4">
                <a href="#section4" className=" hover:underline">Sharing</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

  </>);
}

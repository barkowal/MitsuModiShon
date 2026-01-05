import { Trans, useTranslation } from "react-i18next";

export default function LearnPage() {
  const { t } = useTranslation("learn");

  return (<>
    <div className="flex">
      <div className="flex-1 p-6">

        <div id="Section-About" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
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

          <h1 className="text-3xl mb-4" >
            {t("OverviewTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[80%] h-auto" aria-label="MitsuModiShon_Overview" alt="App overview" src="/Screenshots/MitsuModiShon_Overview.png" />
          </div>

          <p className="mb-4">
            {t("OverviewImgText")}
          </p>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewTopBarText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewOutlinerText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewSidePanelText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="OverviewToolBarText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-AnimationView" className="mb-4 border-b">

          <h1 className="text-3xl mb-4">
            {t("AnimationViewTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[80%] h-auto" aria-label="MitsuModiShon_AnimationView" alt="AnimationView" src="/Screenshots/MitsuModiShon_AnimationView.png" />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="AnimationViewText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-Shortcuts" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("ShortcutsTitle")}
          </h1>

          <div className="grid-cols-2 grid justify-between items-center gap-4 mb-4 w-3/4">
            <Trans
              t={t}
              i18nKey="ShortcutsText"
              components={{ box: <div className="border-r" />, shortcut: <span className="font-bold border p-2 bg-primary-foreground mr-2" />, feature: <span /> }}
            />
          </div>

        </div>

        <div id="Section-AddObject" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("AddObjectTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_AddObject" alt="Adding objects img" src="/Screenshots/MitsuModiShon_AddObject.png" />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="AddObjectText"
              components={{ ol: <ol className="list-decimal pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-AddLight" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("AddLightTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_AddLight" alt="Adding lights img" src="/Screenshots/MitsuModiShon_AddLight.png" />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="AddLightText"
              components={{ ol: <ol className="list-decimal pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-Layers" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("LayersTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_Layers" alt="Layers img" src="/Screenshots/MitsuModiShon_Layers.png" />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="LayersText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-Materials" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("MaterialsTitle")}
          </h1>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="MaterialsText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-EditorModes" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("EditorModesTitle")}
          </h1>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="EditorModesText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-ObjectMode" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("ObjectModeTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_ObjectMode" alt="Object mode img" src="/Screenshots/MitsuModiShon_ObjectMode.png" />
          </div>

          <p className="mb-4">
            {t("ObjectModeText")}
          </p>

        </div>

        <div id="Section-EditMode" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("EditModeTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_EditMode" alt="Edit mode img" src="/Screenshots/MitsuModiShon_EditMode.png" />
          </div>

          <p className="mb-4">
            {t("EditModeText")}
          </p>

        </div>

        <div id="Section-PaintMode" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("PaintModeTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[40%] h-auto" aria-label="MitsuModiShon_PaintMode" alt="Paint mode img" src="/Screenshots/MitsuModiShon_PaintMode.png" />
          </div>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="PaintModeText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-Camera" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("CameraTitle")}
          </h1>

          <div className="justify-center flex w-full mb-4">
            <img className="w-[80%] h-auto" aria-label="MitsuModiShon_Camera" alt="Editor image showing a camera" src="/Screenshots/MitsuModiShon_RenderCamera.png" />
          </div>

          <p className="mb-4">
            {t("CameraText")}
          </p>

        </div>

        <div id="Section-EditorOptions" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("EditorOptionsTitle")}
          </h1>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="EditorOptionsText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

        <div id="Section-CloudFeatures" className="mb-4 border-b">

          <h1 className="text-3xl mb-4" >
            {t("CloudFeaturesTitle")}
          </h1>

          <div className="mb-4">
            <Trans
              t={t}
              i18nKey="CloudFeaturesText"
              components={{ ul: <ul className="list-disc pl-4" />, li: <li className="ml-4" /> }}
            />
          </div>

        </div>

      </div>


      <div className="sticky top-16 h-screen w-64 p-4">
        <h2 className="text-xl mb-4">{t("OnThisPage")}</h2>
        <ul>
          <li className="mb-2">
            <a href="#Section-About" className=" hover:underline">{t("AboutLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-Overview" className=" hover:underline">{t("OverviewLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-AnimationView" className=" hover:underline">{t("AnimationViewLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-Shortcuts" className=" hover:underline">{t("ShortcutsLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-AddObject" className=" hover:underline">{t("AddObjectLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-AddLight" className=" hover:underline">{t("AddLightLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-Layers" className=" hover:underline">{t("LayersLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-Materials" className=" hover:underline">{t("MaterialsLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-EditorModes" className=" hover:underline">{t("EditorModesLink")}</a>
            <ul>
              <li className="ml-4">
                <a href="#Section-ObjectMode" className=" hover:underline">{t("ObjectModeLink")}</a>
              </li>
              <li className="ml-4">
                <a href="#Section-EditMode" className=" hover:underline">{t("EditModeLink")}</a>
              </li>
              <li className="ml-4">
                <a href="#Section-PaintMode" className=" hover:underline">{t("PaintModeLink")}</a>
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <a href="#Section-Camera" className=" hover:underline">{t("CameraLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-EditorOptions" className=" hover:underline">{t("EditorOptionsLink")}</a>
          </li>
          <li className="mb-2">
            <a href="#Section-CloudFeatures" className=" hover:underline">{t("CloudFeaturesLink")}</a>
          </li>
        </ul>
      </div>
    </div>

  </>);
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLanguage from "./locales/en/index.json";
import plLanguage from "./locales/pl/index.json";

import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation:
            enLanguage,
    },
    pl: {
        translation:
            plLanguage,
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        debug: true,

        interpolation: {
            escapeValue: false,
        }
    });


export default i18n;

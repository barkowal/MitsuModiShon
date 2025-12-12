import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enLanguage from "./locales/en/index.json";
import learnEnLanguage from "./locales/en/learn.json";

import plLanguage from "./locales/pl/index.json";
import learnPlLanguage from "./locales/pl/learn.json";

import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation:enLanguage,
        learn: learnEnLanguage,
    },
    pl: {
        translation:plLanguage,
        learn: learnPlLanguage,
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        debug: true,

        defaultNS: "translation",

        interpolation: {
            escapeValue: false,
        }
    });


export default i18n;

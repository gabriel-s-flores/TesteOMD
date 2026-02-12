import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "pt-BR", labelKey: "common.language.portuguese" },
  { code: "en-US", labelKey: "common.language.english" },
] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-switcher" className="text-sm text-gray-700">
        {t("common.language.label")}
      </label>
      <select
        id="language-switcher"
        aria-label={t("common.language.label")}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
        value={currentLanguage}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {t(language.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}

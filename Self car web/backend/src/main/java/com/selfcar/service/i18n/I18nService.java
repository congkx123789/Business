package com.selfcar.service.i18n;

import com.selfcar.model.i18n.SupportedCurrency;
import com.selfcar.model.i18n.SupportedLanguage;
import com.selfcar.model.i18n.Translation;
import com.selfcar.repository.i18n.SupportedCurrencyRepository;
import com.selfcar.repository.i18n.SupportedLanguageRepository;
import com.selfcar.repository.i18n.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class I18nService {

    private final SupportedLanguageRepository languageRepository;
    private final SupportedCurrencyRepository currencyRepository;
    private final TranslationRepository translationRepository;

    // Language Management
    public List<SupportedLanguage> getActiveLanguages() {
        return languageRepository.findByIsActiveTrue();
    }

    public SupportedLanguage getDefaultLanguage() {
        return languageRepository.findByIsDefaultTrue()
                .orElse(languageRepository.findByLanguageCode("vi")
                        .orElseThrow(() -> new RuntimeException("No default language found")));
    }

    public SupportedLanguage getLanguageByCode(String code) {
        return languageRepository.findByLanguageCode(code)
                .orElse(getDefaultLanguage());
    }

    // Currency Management
    public List<SupportedCurrency> getActiveCurrencies() {
        return currencyRepository.findByIsActiveTrue();
    }

    public SupportedCurrency getDefaultCurrency() {
        return currencyRepository.findByIsDefaultTrue()
                .orElse(currencyRepository.findByCurrencyCode("VND")
                        .orElseThrow(() -> new RuntimeException("No default currency found")));
    }

    public SupportedCurrency getCurrencyByCode(String code) {
        return currencyRepository.findByCurrencyCode(code)
                .orElse(getDefaultCurrency());
    }

    // Currency Conversion
    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        SupportedCurrency from = getCurrencyByCode(fromCurrency);
        SupportedCurrency to = getCurrencyByCode(toCurrency);

        // Convert to base currency (USD) first
        BigDecimal inBaseCurrency = amount.divide(from.getExchangeRate(), 8, java.math.RoundingMode.HALF_UP);
        // Convert from base currency to target
        BigDecimal converted = inBaseCurrency.multiply(to.getExchangeRate());
        return converted.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    // Translation Management
    public String translate(String key, String languageCode) {
        return translationRepository.findByTranslationKeyAndLanguageCode(key, languageCode)
                .map(Translation::getTranslationValue)
                .orElse(key); // Return key if translation not found
    }

    public Map<String, String> getTranslationsByCategory(String category, String languageCode) {
        List<Translation> translations = translationRepository.findByCategory(category);
        Map<String, String> result = new HashMap<>();
        for (Translation translation : translations) {
            if (translation.getLanguageCode().equals(languageCode)) {
                result.put(translation.getTranslationKey(), translation.getTranslationValue());
            }
        }
        return result;
    }

    public Map<String, String> getAllTranslations(String languageCode) {
        List<Translation> translations = translationRepository.findByLanguageCode(languageCode);
        Map<String, String> result = new HashMap<>();
        for (Translation translation : translations) {
            result.put(translation.getTranslationKey(), translation.getTranslationValue());
        }
        return result;
    }
}


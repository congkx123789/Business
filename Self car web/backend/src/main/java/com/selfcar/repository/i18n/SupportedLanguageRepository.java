package com.selfcar.repository.i18n;

import com.selfcar.model.i18n.SupportedLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportedLanguageRepository extends JpaRepository<SupportedLanguage, Long> {
    Optional<SupportedLanguage> findByLanguageCode(String languageCode);
    List<SupportedLanguage> findByIsActiveTrue();
    Optional<SupportedLanguage> findByIsDefaultTrue();
}


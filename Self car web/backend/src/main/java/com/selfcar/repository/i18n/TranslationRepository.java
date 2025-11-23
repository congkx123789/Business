package com.selfcar.repository.i18n;

import com.selfcar.model.i18n.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findByLanguageCode(String languageCode);
    Optional<Translation> findByTranslationKeyAndLanguageCode(String key, String languageCode);
    List<Translation> findByCategory(String category);
}


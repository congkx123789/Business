package com.selfcar.repository.i18n;

import com.selfcar.model.i18n.SupportedCurrency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportedCurrencyRepository extends JpaRepository<SupportedCurrency, Long> {
    Optional<SupportedCurrency> findByCurrencyCode(String currencyCode);
    List<SupportedCurrency> findByIsActiveTrue();
    Optional<SupportedCurrency> findByIsDefaultTrue();
}


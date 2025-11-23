package com.selfcar.repository.ecosystem;

import com.selfcar.model.ecosystem.FinanceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinanceProductRepository extends JpaRepository<FinanceProduct, Long> {
    List<FinanceProduct> findByPartnerIdAndAvailableTrue(Long partnerId);
    List<FinanceProduct> findByProductTypeAndAvailableTrue(FinanceProduct.ProductType productType);
}


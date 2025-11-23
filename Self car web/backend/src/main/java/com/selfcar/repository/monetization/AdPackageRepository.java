package com.selfcar.repository.monetization;

import com.selfcar.model.monetization.AdPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdPackageRepository extends JpaRepository<AdPackage, Long> {
    List<AdPackage> findByStatus(AdPackage.PackageStatus status);
    List<AdPackage> findByAdType(AdPackage.AdType adType);
}


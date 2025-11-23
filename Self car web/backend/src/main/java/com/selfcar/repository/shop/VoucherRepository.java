package com.selfcar.repository.shop;

import com.selfcar.model.shop.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    @Query("SELECT v FROM Voucher v WHERE v.code = :code AND v.active = true " +
           "AND v.startDate <= :now AND v.endDate >= :now")
    Optional<Voucher> findValidVoucherByCode(@Param("code") String code, @Param("now") LocalDateTime now);

    @Query("SELECT v FROM Voucher v WHERE v.active = true " +
           "AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit)")
    List<Voucher> findActiveVouchers(@Param("now") LocalDateTime now);

    List<Voucher> findByShopId(Long shopId);

    @Query("SELECT v FROM Voucher v WHERE (v.shop IS NULL OR v.shop.id = :shopId) " +
           "AND v.active = true AND v.startDate <= :now AND v.endDate >= :now")
    List<Voucher> findAvailableVouchersForShop(@Param("shopId") Long shopId, @Param("now") LocalDateTime now);
}

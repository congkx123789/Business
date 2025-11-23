package com.selfcar.service.shop;

import com.selfcar.model.shop.Shop;
import com.selfcar.model.shop.Voucher;
import com.selfcar.repository.shop.ShopRepository;
import com.selfcar.repository.shop.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final ShopRepository shopRepository;

    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    public Voucher getVoucherById(Long id) {
        Objects.requireNonNull(id, "Voucher ID cannot be null");
        return voucherRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Voucher not found with ID: {}", id);
                    return new RuntimeException("Voucher not found with id: " + id);
                });
    }

    public Voucher getVoucherByCode(String code) {
        Objects.requireNonNull(code, "Voucher code cannot be null");
        return voucherRepository.findByCode(code)
                .orElseThrow(() -> {
                    log.warn("Voucher not found with code: {}", code);
                    return new RuntimeException("Voucher not found with code: " + code);
                });
    }

    public Voucher validateVoucher(String code) {
        Objects.requireNonNull(code, "Voucher code cannot be null");
        return voucherRepository.findValidVoucherByCode(code, LocalDateTime.now())
                .orElseThrow(() -> {
                    log.warn("Invalid or expired voucher code: {}", code);
                    return new RuntimeException("Invalid or expired voucher: " + code);
                });
    }

    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findActiveVouchers(LocalDateTime.now());
    }

    public List<Voucher> getAvailableVouchersForShop(Long shopId) {
        return voucherRepository.findAvailableVouchersForShop(shopId, LocalDateTime.now());
    }

    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        Objects.requireNonNull(voucher, "Voucher cannot be null");
        Objects.requireNonNull(voucher.getCode(), "Voucher code is required");

        // Check if code already exists
        if (voucherRepository.findByCode(voucher.getCode()).isPresent()) {
            log.warn("Voucher code already exists: {}", voucher.getCode());
            throw new RuntimeException("Voucher code already exists: " + voucher.getCode());
        }

        if (voucher.getShop() != null && voucher.getShop().getId() != null) {
            Long shopId = Objects.requireNonNull(voucher.getShop().getId(), "Shop ID cannot be null");
            Shop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> {
                        log.warn("Shop not found with ID: {}", shopId);
                        return new RuntimeException("Shop not found");
                    });
            voucher.setShop(shop);
        }

        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Voucher created successfully with ID: {} and code: {}", savedVoucher.getId(), savedVoucher.getCode());
        return savedVoucher;
    }

    @Transactional
    public Voucher updateVoucher(Long id, Voucher voucherDetails) {
        Voucher voucher = getVoucherById(id);

        if (voucherDetails.getName() != null) {
            voucher.setName(voucherDetails.getName());
        }
        if (voucherDetails.getDescription() != null) {
            voucher.setDescription(voucherDetails.getDescription());
        }
        if (voucherDetails.getDiscountValue() != null) {
            voucher.setDiscountValue(voucherDetails.getDiscountValue());
        }
        if (voucherDetails.getMinPurchaseAmount() != null) {
            voucher.setMinPurchaseAmount(voucherDetails.getMinPurchaseAmount());
        }
        if (voucherDetails.getMaxDiscountAmount() != null) {
            voucher.setMaxDiscountAmount(voucherDetails.getMaxDiscountAmount());
        }
        if (voucherDetails.getStartDate() != null) {
            voucher.setStartDate(voucherDetails.getStartDate());
        }
        if (voucherDetails.getEndDate() != null) {
            voucher.setEndDate(voucherDetails.getEndDate());
        }
        if (voucherDetails.getUsageLimit() != null) {
            voucher.setUsageLimit(voucherDetails.getUsageLimit());
        }
        if (voucherDetails.getUserUsageLimit() != null) {
            voucher.setUserUsageLimit(voucherDetails.getUserUsageLimit());
        }
        if (voucherDetails.getActive() != null) {
            voucher.setActive(voucherDetails.getActive());
        }

        Voucher savedVoucher = Objects.requireNonNull(voucher, "Voucher cannot be null");
        return voucherRepository.save(savedVoucher);
    }

    @Transactional
    public BigDecimal applyVoucher(String code, BigDecimal purchaseAmount) {
        Voucher voucher = validateVoucher(code);

        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher is not valid");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsageCount() >= voucher.getUsageLimit()) {
            log.warn("Voucher usage limit reached for code: {}", code);
            throw new RuntimeException("Voucher usage limit reached");
        }

        BigDecimal discount = voucher.calculateDiscount(purchaseAmount);
        log.debug("Applying voucher code: {} to purchase amount: {}, discount: {}", code, purchaseAmount, discount);
        
        // Increment usage count
        voucher.setUsageCount(voucher.getUsageCount() + 1);
        voucherRepository.save(voucher);

        return discount;
    }

    @Transactional
    public void deleteVoucher(Long id) {
        Objects.requireNonNull(id, "Voucher ID cannot be null");
        voucherRepository.deleteById(id);
        log.info("Voucher deleted successfully with ID: {}", id);
    }
}

package com.selfcar.service.ecosystem;

import com.selfcar.model.ecosystem.FinanceApplication;
import com.selfcar.model.ecosystem.FinancePartner;
import com.selfcar.model.ecosystem.FinanceProduct;
import com.selfcar.model.car.Car;
import com.selfcar.model.auth.User;
import com.selfcar.repository.ecosystem.FinanceApplicationRepository;
import com.selfcar.repository.ecosystem.FinancePartnerRepository;
import com.selfcar.repository.ecosystem.FinanceProductRepository;
import com.selfcar.repository.car.CarRepository;
import com.selfcar.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinancePartnerRepository partnerRepository;
    private final FinanceProductRepository productRepository;
    private final FinanceApplicationRepository applicationRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    // Partner Management
    public List<FinancePartner> getAllPartners() {
        return partnerRepository.findAll();
    }

    public List<FinancePartner> getActivePartners(FinancePartner.PartnerType type) {
        return partnerRepository.findByPartnerTypeAndStatus(type, FinancePartner.PartnerStatus.ACTIVE);
    }

    public FinancePartner getPartnerById(Long id) {
        return partnerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Finance partner not found"));
    }

    // Product Management
    public List<FinanceProduct> getProductsByPartner(Long partnerId) {
        return productRepository.findByPartnerIdAndAvailableTrue(partnerId);
    }

    public List<FinanceProduct> getProductsByType(FinanceProduct.ProductType productType) {
        return productRepository.findByProductTypeAndAvailableTrue(productType);
    }

    public FinanceProduct getProductById(Long id) {
        return productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Finance product not found"));
    }

    // Application Management
    public List<FinanceApplication> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public FinanceApplication getApplicationById(Long id) {
        return applicationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Finance application not found"));
    }

    @Transactional
    public FinanceApplication createApplication(Long userId, Long carId, Long productId, BigDecimal requestedAmount) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Car car = carRepository.findById(Objects.requireNonNull(carId))
                .orElseThrow(() -> new RuntimeException("Car not found"));
        FinanceProduct product = getProductById(productId);
        FinancePartner partner = product.getPartner();

        FinanceApplication application = new FinanceApplication();
        application.setApplicationNumber("FIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        application.setUser(user);
        application.setUserId(userId);
        application.setCar(car);
        application.setCarId(carId);
        application.setProduct(product);
        application.setProductId(productId);
        application.setPartner(partner);
        application.setPartnerId(partner.getId());
        application.setRequestedAmount(requestedAmount);
        application.setStatus(FinanceApplication.ApplicationStatus.PENDING);

        return applicationRepository.save(application);
    }

    @Transactional
    public FinanceApplication approveApplication(Long applicationId, BigDecimal approvalAmount, BigDecimal interestRate, Integer tenureMonths) {
        FinanceApplication application = getApplicationById(Objects.requireNonNull(applicationId));
        application.setStatus(FinanceApplication.ApplicationStatus.APPROVED);
        application.setApprovalAmount(approvalAmount);
        application.setInterestRate(interestRate);
        application.setTenureMonths(tenureMonths);

        // Calculate monthly payment (simple interest calculation)
        BigDecimal monthlyRate = interestRate.divide(BigDecimal.valueOf(100), MathContext.DECIMAL32)
                .divide(BigDecimal.valueOf(12), MathContext.DECIMAL32);
        BigDecimal monthlyPayment = approvalAmount.multiply(monthlyRate)
                .divide(BigDecimal.ONE.subtract(BigDecimal.ONE.divide(BigDecimal.ONE.add(monthlyRate).pow(tenureMonths), MathContext.DECIMAL32)), MathContext.DECIMAL32);
        application.setMonthlyPayment(monthlyPayment);
        application.setReviewedAt(java.time.LocalDateTime.now());

        return applicationRepository.save(application);
    }

    @Transactional
    public FinanceApplication rejectApplication(Long applicationId, String rejectionReason) {
        FinanceApplication application = getApplicationById(Objects.requireNonNull(applicationId));
        application.setStatus(FinanceApplication.ApplicationStatus.REJECTED);
        application.setRejectionReason(rejectionReason);
        application.setReviewedAt(java.time.LocalDateTime.now());
        return applicationRepository.save(application);
    }
}


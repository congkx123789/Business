package com.selfcar.repository.order;

import com.selfcar.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Page<Order> findByBuyerIdAndStatus(Long buyerId, Order.OrderStatus status, Pageable pageable);

    Page<Order> findBySellerIdAndStatus(Long sellerId, Order.OrderStatus status, Pageable pageable);

    List<Order> findByStatus(Order.OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.seller.id = :sellerId AND o.status = :status AND o.createdAt >= :startDate")
    List<Order> findBySellerAndStatusSince(@Param("sellerId") Long sellerId, 
                                           @Param("status") Order.OrderStatus status,
                                           @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.seller.id = :sellerId AND o.status = :status")
    Long countBySellerAndStatus(@Param("sellerId") Long sellerId, @Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.seller.id = :sellerId AND o.status = :status AND o.createdAt >= :startDate")
    java.math.BigDecimal getTotalRevenueBySellerAndStatusSince(@Param("sellerId") Long sellerId,
                                                               @Param("status") Order.OrderStatus status,
                                                               @Param("startDate") LocalDateTime startDate);
}

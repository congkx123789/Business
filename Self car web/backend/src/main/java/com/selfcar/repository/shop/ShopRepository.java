package com.selfcar.repository.shop;

import com.selfcar.model.shop.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
    List<Shop> findByOwnerId(Long ownerId);
    Optional<Shop> findByName(String name);
    List<Shop> findByStatus(Shop.ShopStatus status);
    List<Shop> findByActiveTrue();
    List<Shop> findByOwnerIdAndActiveTrue(Long ownerId);
}

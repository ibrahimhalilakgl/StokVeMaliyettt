package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.PurchaseType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseTypeRepository extends JpaRepository<PurchaseType, Long> {
    PurchaseType findByName(String name);
}

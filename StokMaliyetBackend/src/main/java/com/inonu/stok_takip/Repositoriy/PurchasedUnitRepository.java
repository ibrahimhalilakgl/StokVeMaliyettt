package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.PurchaseType;
import com.inonu.stok_takip.entitiy.PurchasedUnit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchasedUnitRepository extends JpaRepository<PurchasedUnit, Long> {
    PurchasedUnit findByName(String name);
}

package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.DirectProcurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectProcurementRepository extends JpaRepository<DirectProcurement, Long> {

    List<DirectProcurement> findByRemainingQuantityGreaterThan(Double quantity);
    List<DirectProcurement> findDirectProcurementByActiveTrue();
}

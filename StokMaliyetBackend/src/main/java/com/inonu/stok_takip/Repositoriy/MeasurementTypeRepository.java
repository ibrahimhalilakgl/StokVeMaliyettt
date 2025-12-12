package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.MeasurementType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeasurementTypeRepository extends JpaRepository<MeasurementType, Long> {
}

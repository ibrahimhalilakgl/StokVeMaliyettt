package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.MaterialDemand;
import com.inonu.stok_takip.entitiy.Tender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MaterialDemandRepository extends JpaRepository<MaterialDemand, Long> {

    @Query("SELECT t FROM Tender t WHERE t.product.id = :productId  ORDER BY t.createDate ASC")
    Tender findByProductIdOrderedByEntryDate(@Param("productId") Long productId);
}

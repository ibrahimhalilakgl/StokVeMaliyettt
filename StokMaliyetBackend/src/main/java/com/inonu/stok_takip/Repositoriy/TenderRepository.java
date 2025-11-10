package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.Tender;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenderRepository extends JpaRepository<Tender, Long> {

    List<Tender> findTenderByActiveTrue();

}

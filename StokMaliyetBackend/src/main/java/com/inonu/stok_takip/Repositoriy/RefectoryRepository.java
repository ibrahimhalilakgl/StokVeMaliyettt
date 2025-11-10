package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.Category;
import com.inonu.stok_takip.entitiy.Refectory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefectoryRepository extends JpaRepository<Refectory,Long> {
    Refectory findByName(String name);
}

package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.Enum.YemekTipi;
import com.inonu.stok_takip.entitiy.YemekRecetesi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface YemekRecetesiRepository extends JpaRepository<YemekRecetesi, Long> {
    YemekRecetesi findByAdi(String adi);
    List<YemekRecetesi> findByTipi(YemekTipi tipi);
}


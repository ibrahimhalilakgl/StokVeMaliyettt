package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.GunlukMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GunlukMenuRepository extends JpaRepository<GunlukMenu, Long> {
    Optional<GunlukMenu> findByTarih(LocalDate tarih);
    
    @Query("SELECT gm FROM GunlukMenu gm WHERE YEAR(gm.tarih) = :year")
    List<GunlukMenu> findByYear(@Param("year") int year);
    
    @Query("SELECT gm FROM GunlukMenu gm WHERE gm.tarih BETWEEN :startDate AND :endDate")
    List<GunlukMenu> findByTarihBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}


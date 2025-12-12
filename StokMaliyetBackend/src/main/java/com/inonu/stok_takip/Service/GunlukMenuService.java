package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.GunlukMenuCreateRequest;
import com.inonu.stok_takip.dto.Response.GunlukMenuResponse;
import com.inonu.stok_takip.dto.Response.MenuRaporResponse;
import com.inonu.stok_takip.entitiy.GunlukMenu;

import java.time.LocalDate;
import java.util.List;

public interface GunlukMenuService {
    List<GunlukMenuResponse> getAllGunlukMenuler();
    GunlukMenuResponse getGunlukMenuByTarih(LocalDate tarih);
    GunlukMenuResponse createGunlukMenu(GunlukMenuCreateRequest request);
    GunlukMenuResponse updateGunlukMenu(Long id, GunlukMenuCreateRequest request);
    GunlukMenuResponse deleteGunlukMenu(Long id);
    MenuRaporResponse getYillikRapor(int yil);
    GunlukMenu getGunlukMenuEntityByTarih(LocalDate tarih);
}


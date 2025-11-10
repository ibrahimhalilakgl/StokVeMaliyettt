package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;
import java.util.List;

public class GunlukMenuResponse {
    private Long id;
    private LocalDate tarih;
    private YemekRecetesiResponse anaYemek;
    private List<YemekRecetesiResponse> yardimciYemekler;

    public GunlukMenuResponse() {
    }

    public GunlukMenuResponse(Long id, LocalDate tarih, YemekRecetesiResponse anaYemek, List<YemekRecetesiResponse> yardimciYemekler) {
        this.id = id;
        this.tarih = tarih;
        this.anaYemek = anaYemek;
        this.yardimciYemekler = yardimciYemekler;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getTarih() {
        return tarih;
    }

    public void setTarih(LocalDate tarih) {
        this.tarih = tarih;
    }

    public YemekRecetesiResponse getAnaYemek() {
        return anaYemek;
    }

    public void setAnaYemek(YemekRecetesiResponse anaYemek) {
        this.anaYemek = anaYemek;
    }

    public List<YemekRecetesiResponse> getYardimciYemekler() {
        return yardimciYemekler;
    }

    public void setYardimciYemekler(List<YemekRecetesiResponse> yardimciYemekler) {
        this.yardimciYemekler = yardimciYemekler;
    }
}


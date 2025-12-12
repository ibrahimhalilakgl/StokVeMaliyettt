package com.inonu.stok_takip.dto.Response;

import com.inonu.stok_takip.Enum.YemekTipi;

public class YemekRecetesiResponse {
    private Long id;
    private String adi;
    private String aciklama;
    private String receteDetaylari;
    private YemekTipi tipi;

    public YemekRecetesiResponse() {
    }

    public YemekRecetesiResponse(Long id, String adi, String aciklama, String receteDetaylari, YemekTipi tipi) {
        this.id = id;
        this.adi = adi;
        this.aciklama = aciklama;
        this.receteDetaylari = receteDetaylari;
        this.tipi = tipi;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdi() {
        return adi;
    }

    public void setAdi(String adi) {
        this.adi = adi;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }

    public String getReceteDetaylari() {
        return receteDetaylari;
    }

    public void setReceteDetaylari(String receteDetaylari) {
        this.receteDetaylari = receteDetaylari;
    }

    public YemekTipi getTipi() {
        return tipi;
    }

    public void setTipi(YemekTipi tipi) {
        this.tipi = tipi;
    }
}


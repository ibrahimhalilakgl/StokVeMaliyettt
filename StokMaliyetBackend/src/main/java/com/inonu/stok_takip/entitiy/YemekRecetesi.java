package com.inonu.stok_takip.entitiy;

import com.inonu.stok_takip.Enum.YemekTipi;
import jakarta.persistence.*;

@Entity
@Table(name = "YEMEK_RECETELERI")
public class YemekRecetesi extends BaseEntity {

    @Column(name = "ADI", nullable = false)
    private String adi;

    @Column(name = "ACIKLAMA", length = 2000)
    private String aciklama;

    @Column(name = "RECETE_DETAYLARI", length = 5000)
    private String receteDetaylari; // Malzemeler, Miktarlar vb. JSON veya text formatında

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPI", nullable = false)
    private YemekTipi tipi;

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


package com.inonu.stok_takip.entitiy;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "GUNLUK_MENULER")
public class GunlukMenu extends BaseEntity {

    @Column(name = "TARIH", nullable = false, unique = true)
    private LocalDate tarih;

    @ManyToOne
    @JoinColumn(name = "ANA_YEMEK_ID", nullable = false)
    private YemekRecetesi anaYemek;

    @ManyToMany
    @JoinTable(
        name = "GUNLUK_MENU_YARDIMCI_YEMEKLER",
        joinColumns = @JoinColumn(name = "GUNLUK_MENU_ID"),
        inverseJoinColumns = @JoinColumn(name = "YARDIMCI_YEMEK_ID")
    )
    private List<YemekRecetesi> yardimciYemekler = new ArrayList<>();

    public LocalDate getTarih() {
        return tarih;
    }

    public void setTarih(LocalDate tarih) {
        this.tarih = tarih;
    }

    public YemekRecetesi getAnaYemek() {
        return anaYemek;
    }

    public void setAnaYemek(YemekRecetesi anaYemek) {
        this.anaYemek = anaYemek;
    }

    public List<YemekRecetesi> getYardimciYemekler() {
        return yardimciYemekler;
    }

    public void setYardimciYemekler(List<YemekRecetesi> yardimciYemekler) {
        this.yardimciYemekler = yardimciYemekler;
    }
}


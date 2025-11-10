package com.inonu.stok_takip.dto.Response;

import java.util.List;

public class MenuRaporResponse {
    private int yil;
    private List<YemekKullanimSayisi> enCokKullanilanAnaYemekler;
    private List<YemekKullanimSayisi> enCokKullanilanYardimciYemekler;
    private int toplamMenuSayisi;
    private int farkliAnaYemekSayisi;
    private int farkliYardimciYemekSayisi;

    public MenuRaporResponse() {
    }

    public MenuRaporResponse(int yil, List<YemekKullanimSayisi> enCokKullanilanAnaYemekler, 
                            List<YemekKullanimSayisi> enCokKullanilanYardimciYemekler,
                            int toplamMenuSayisi, int farkliAnaYemekSayisi, int farkliYardimciYemekSayisi) {
        this.yil = yil;
        this.enCokKullanilanAnaYemekler = enCokKullanilanAnaYemekler;
        this.enCokKullanilanYardimciYemekler = enCokKullanilanYardimciYemekler;
        this.toplamMenuSayisi = toplamMenuSayisi;
        this.farkliAnaYemekSayisi = farkliAnaYemekSayisi;
        this.farkliYardimciYemekSayisi = farkliYardimciYemekSayisi;
    }

    public int getYil() {
        return yil;
    }

    public void setYil(int yil) {
        this.yil = yil;
    }

    public List<YemekKullanimSayisi> getEnCokKullanilanAnaYemekler() {
        return enCokKullanilanAnaYemekler;
    }

    public void setEnCokKullanilanAnaYemekler(List<YemekKullanimSayisi> enCokKullanilanAnaYemekler) {
        this.enCokKullanilanAnaYemekler = enCokKullanilanAnaYemekler;
    }

    public List<YemekKullanimSayisi> getEnCokKullanilanYardimciYemekler() {
        return enCokKullanilanYardimciYemekler;
    }

    public void setEnCokKullanilanYardimciYemekler(List<YemekKullanimSayisi> enCokKullanilanYardimciYemekler) {
        this.enCokKullanilanYardimciYemekler = enCokKullanilanYardimciYemekler;
    }

    public int getToplamMenuSayisi() {
        return toplamMenuSayisi;
    }

    public void setToplamMenuSayisi(int toplamMenuSayisi) {
        this.toplamMenuSayisi = toplamMenuSayisi;
    }

    public int getFarkliAnaYemekSayisi() {
        return farkliAnaYemekSayisi;
    }

    public void setFarkliAnaYemekSayisi(int farkliAnaYemekSayisi) {
        this.farkliAnaYemekSayisi = farkliAnaYemekSayisi;
    }

    public int getFarkliYardimciYemekSayisi() {
        return farkliYardimciYemekSayisi;
    }

    public void setFarkliYardimciYemekSayisi(int farkliYardimciYemekSayisi) {
        this.farkliYardimciYemekSayisi = farkliYardimciYemekSayisi;
    }

    public static class YemekKullanimSayisi {
        private Long yemekId;
        private String yemekAdi;
        private Long kullanimSayisi;

        public YemekKullanimSayisi() {
        }

        public YemekKullanimSayisi(Long yemekId, String yemekAdi, Long kullanimSayisi) {
            this.yemekId = yemekId;
            this.yemekAdi = yemekAdi;
            this.kullanimSayisi = kullanimSayisi;
        }

        public Long getYemekId() {
            return yemekId;
        }

        public void setYemekId(Long yemekId) {
            this.yemekId = yemekId;
        }

        public String getYemekAdi() {
            return yemekAdi;
        }

        public void setYemekAdi(String yemekAdi) {
            this.yemekAdi = yemekAdi;
        }

        public Long getKullanimSayisi() {
            return kullanimSayisi;
        }

        public void setKullanimSayisi(Long kullanimSayisi) {
            this.kullanimSayisi = kullanimSayisi;
        }
    }
}


package com.inonu.stok_takip.entitiy;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inonu.stok_takip.Enum.EntrySourceType;
import com.inonu.stok_takip.Enum.TenderType;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class MaterialEntry extends BaseEntity {


    private Double quantity;// giriş miktarı // adet
    private Double remainingQuantity; // stokta kalan miktar
    private Double unitPrice; // ürünün birim fiyatı
    private Double totalPrice; // alınan ürünün toplam tutarı = adet* birim fiyatı
    private LocalDate entryDate; // giriş tarihi // fatura tarihi
    private LocalDate expiryDate; // ürün son kullanma tarihi
    private String companyName; // firma adı
    private Double totalPriceIncludingVat; // kdv dahil toplam tutar
    private Double unitPriceIncludingVat;
    private String description; // stoğa giriş yapılan ürün için açıklama

    @Enumerated(EnumType.STRING)
    private EntrySourceType entrySourceType;


    @ManyToOne
    @JoinColumn(name = "product_id",nullable = false)
    @JsonIgnore
    private Product product; // product name

    @ManyToOne
    @JoinColumn(name = "budget_id",nullable = false)
    private Budget budget;  // bütçe adı

    @ManyToOne
    @JoinColumn(name = "purchaseUnit_id")
    private PurchasedUnit purchasedUnit; //alım yapılan birim  sks/ yemekhane vb.


    @ManyToOne
    @JoinColumn(name = "purchaseType_id")
    private PurchaseType purchaseType; // alım türü  mal/ hizmet /bakım


    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type")
    private TenderType tenderType;


    @ManyToOne
    @JoinColumn(name = "tender_id",nullable = true)
    private Tender tender;

    @ManyToOne
    @JoinColumn(name = "direct_procurement_id",nullable = true)
    private DirectProcurement directProcurement;



    // Yuvarlama işlemi
    private Double roundToTwoDecimalPlaces(Double value) {
        return Math.round(value * 100.0) / 100.0;
    }


    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Double remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Double getTotalPriceIncludingVat() {
        return totalPriceIncludingVat;
    }

    public void setTotalPriceIncludingVat(Double totalPriceIncludingVat) {
        this.totalPriceIncludingVat = totalPriceIncludingVat;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EntrySourceType getEntrySourceType() {
        return entrySourceType;
    }

    public void setEntrySourceType(EntrySourceType entrySourceType) {
        this.entrySourceType = entrySourceType;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public PurchasedUnit getPurchasedUnit() {
        return purchasedUnit;
    }

    public void setPurchasedUnit(PurchasedUnit purchasedUnit) {
        this.purchasedUnit = purchasedUnit;
    }

    public PurchaseType getPurchaseType() {
        return purchaseType;
    }

    public void setPurchaseType(PurchaseType purchaseType) {
        this.purchaseType = purchaseType;
    }

    public Tender getTender() {
        return tender;
    }

    public void setTender(Tender tender) {
        this.tender = tender;
    }

    public Double getUnitPriceIncludingVat() {
        return unitPriceIncludingVat;
    }

    public void setUnitPriceIncludingVat(Double unitPriceIncludingVat) {
        this.unitPriceIncludingVat = unitPriceIncludingVat;
    }

    public DirectProcurement getDirectProcurement() {
        return directProcurement;
    }

    public void setDirectProcurement(DirectProcurement directProcurement) {
        this.directProcurement = directProcurement;
    }


    public TenderType getTenderType() {
        return tenderType;
    }

    public void setTenderType(TenderType tenderType) {
        this.tenderType = tenderType;
    }
}

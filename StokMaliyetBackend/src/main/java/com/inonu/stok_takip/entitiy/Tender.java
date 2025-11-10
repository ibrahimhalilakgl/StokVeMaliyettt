package com.inonu.stok_takip.entitiy;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inonu.stok_takip.Enum.TenderType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
public class Tender extends BaseEntity { // ihalelerin eklendiği tablo

    private Double tenderQuantity; // İhale tutarı
    private Double remainingQuantityInTender; // ihaleden kalan miktar
    private LocalDate startDate; // İhale başlangıç tarihi
    private LocalDate endDate; // İhale bitiş tarihi
    private Double unitPrice; //ihale ile alınan ürünün birim fiyatı
    private String companyName; // ihalenin yapıldığı firma
    private Double totalAmount; // ihale bedeli
    private boolean increased = false; // yüzde 20 arttırım yapılmış mı yapılmamış mı diye kontrol ediyoruz
    private Double increaseAmount; // yapılan arttırma miktarı (yüzde olarak, örn: 20, 15, 10)
    private boolean active = true; // ihlae süresi dolan ihaleler silinirse pasife çekecek şekilde güncller  silinme olmaz çünkü ihaleden alına ürün depoda kalma durumu var

    @ManyToOne
    @JoinColumn(name = "product_id",nullable = false)
    @JsonIgnore
    private Product product; // product name

    @ManyToOne
    @JoinColumn(name = "purchaseUnit_id")
    private PurchasedUnit purchasedUnit; //alım yapılan birim  sks/ yemekhane vb.


    @ManyToOne
    @JoinColumn(name = "purchaseType_id")
    private PurchaseType purchaseType; // alım türü  mal/ hizmet /bakım

    @OneToMany(mappedBy = "tender")
    private List<MaterialEntry> materialEntries;

    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type")
    private TenderType tenderType;


    public Double getTenderQuantity() {
        return tenderQuantity;
    }

    public void setTenderQuantity(Double tenderQuantity) {
        this.tenderQuantity = tenderQuantity;
    }

    public Double getRemainingQuantityInTender() {
        return remainingQuantityInTender;
    }

    public void setRemainingQuantityInTender(Double remainingQuantityInTender) {
        this.remainingQuantityInTender = remainingQuantityInTender;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getCompanyName() {
        return companyName;
    }

    public boolean isIncreased() {
        return increased;
    }

    public void setIncreased(boolean increased) {
        this.increased = increased;
    }

    public Double getIncreaseAmount() {
        return increaseAmount;
    }

    public void setIncreaseAmount(Double increaseAmount) {
        this.increaseAmount = increaseAmount;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public List<MaterialEntry> getMaterialEntries() {
        return materialEntries;
    }

    public void setMaterialEntries(List<MaterialEntry> materialEntries) {
        this.materialEntries = materialEntries;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public TenderType getTenderType() {
        return tenderType;
    }

    public void setTenderType(TenderType tenderType) {
        this.tenderType = tenderType;
    }
}
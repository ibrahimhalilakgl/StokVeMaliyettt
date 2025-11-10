package com.inonu.stok_takip.entitiy;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inonu.stok_takip.Enum.TenderType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
public class DirectProcurement extends BaseEntity{ // dpğrudan Temin tablosu

    private Double Quantity; // doğrudan temin  miktarı
    private Double remainingQuantity; // doğrudan temin den kalan miktar
    private LocalDate startDate; // doğrudan temin başlangıç tarihi
    private LocalDate endDate; // doğrudan temin bitiş tarihi
    private Double unitPrice; //doğrudan temin ile alınan ürünün birim fiyatı
    private String companyName; // doğrudan teminin yapıldığı firma
    private Double totalAmount; // doğrudan temin bedeli
    private boolean active = true; // doğrudan temin süresi dolan ihaleler silinirse pasife çekecek şekilde güncller  silinme olmaz çünkü ihaleden alına ürün depoda kalma durumu var
    private boolean increased = false;

    public boolean isIncreased() {
        return increased;
    }

    public void setIncreased(boolean increased) {
        this.increased = increased;
    }

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

    @OneToMany(mappedBy = "directProcurement")
    private List<MaterialEntry> materialEntries;

    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type")
    private TenderType tenderType;


    public Double getQuantity() {
        return Quantity;
    }

    public void setQuantity(Double quantity) {
        Quantity = quantity;
    }

    public Double getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Double remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
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

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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


    public List<MaterialEntry> getMaterialEntries() {
        return materialEntries;
    }

    public void setMaterialEntries(List<MaterialEntry> materialEntries) {
        this.materialEntries = materialEntries;
    }

    public TenderType getTenderType() {
        return tenderType;
    }

    public void setTenderType(TenderType tenderType) {
        this.tenderType = tenderType;
    }
}

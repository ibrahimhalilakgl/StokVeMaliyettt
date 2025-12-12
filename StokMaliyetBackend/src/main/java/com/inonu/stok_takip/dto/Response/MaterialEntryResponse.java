package com.inonu.stok_takip.dto.Response;

import com.inonu.stok_takip.Enum.EntrySourceType;
import com.inonu.stok_takip.Enum.TenderType;

import java.time.LocalDate;

public class MaterialEntryResponse {
    private Double quantity;
    private Double unitPrice;
    private LocalDate entryDate; 
    private LocalDate expiryDate;
    private String companyName;
    private String description;
    private Double totalPrice;
    private EntrySourceType entrySourceType;
    private Double totalPriceIncludingVat;
    private ProductDetailResponse productResponse;
    private String purchaseTypeName;
    private String purchasedUnitName;
    private String tenderType;


    public MaterialEntryResponse() {
    }

    public MaterialEntryResponse(Double quantity, Double unitPrice,
                                 LocalDate entryDate, LocalDate expiryDate,
                                 String companyName, String description,
                                 Double totalPrice, Double totalPriceIncludingVat,
                                 ProductDetailResponse productResponse, String purchaseTypeName,
                                 String purchasedUnitName, EntrySourceType entrySourceType,
                                 String tenderType) {
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.entryDate = entryDate;
        this.expiryDate = expiryDate;
        this.companyName = companyName;
        this.description = description;
        this.totalPrice = totalPrice;
        this.totalPriceIncludingVat = totalPriceIncludingVat;
        this.productResponse = productResponse;
        this.purchaseTypeName = purchaseTypeName;
        this.purchasedUnitName = purchasedUnitName;
        this.entrySourceType = entrySourceType;
        this.tenderType = tenderType;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProductDetailResponse getProductResponse() {
        return productResponse;
    }

    public void setProductResponse(ProductDetailResponse productResponse) {
        this.productResponse = productResponse;
    }

    public String getPurchasedUnitName() {
        return purchasedUnitName;
    }

    public void setPurchasedUnitName(String purchasedUnitName) {
        this.purchasedUnitName = purchasedUnitName;
    }


    public String getPurchaseTypeName() {
        return purchaseTypeName;
    }

    public void setPurchaseTypeName(String purchaseTypeName) {
        this.purchaseTypeName = purchaseTypeName;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getTotalPriceIncludingVat() {
        return totalPriceIncludingVat;
    }

    public void setTotalPriceIncludingVat(Double totalPriceIncludingVat) {
        this.totalPriceIncludingVat = totalPriceIncludingVat;
    }

    public EntrySourceType getEntrySourceType() {
        return entrySourceType;
    }

    public void setEntrySourceType(EntrySourceType entrySourceType) {
        this.entrySourceType = entrySourceType;
    }

    public String getTenderType() {
        return tenderType;
    }

    public void setTenderType(String tenderType) {
        this.tenderType = tenderType;
    }
}

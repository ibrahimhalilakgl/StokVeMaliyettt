package com.inonu.stok_takip.entitiy;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inonu.stok_takip.Enum.DemandStatus;
import com.inonu.stok_takip.Enum.TenderType;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class MaterialDemand extends BaseEntity{

    private Double quantity; // talep edilen malzeme miktarı
    private Double approvedQuantity; // onaylama sırasında belirlenen miktar (opsiyonel)
    private String userName;

    private String companyName; // talep edilen firmanın adı
    private LocalDate requestDate; // talep tarihi



    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false) // talep edilen ürün
    private Product product;

    @ManyToOne
    @JoinColumn(name = "tender_id", nullable = true)
    private Tender tender; // Hangi ihaleden talep yapılıyor

    @ManyToOne
    @JoinColumn(name = "directProcurement_id", nullable = true)
    private DirectProcurement directProcurement; // Hangi Doğrudan teminden talep yapılıyor


    @Enumerated(EnumType.STRING)
    @Column(name = "tender_type")
    private TenderType tenderType;


    @Enumerated(EnumType.STRING)
    private DemandStatus status = DemandStatus.PENDING; // Varsayılan olarak talep bekliyor (pending) olacaktır.

    private String rejectionReason;


    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getApprovedQuantity() {
        return approvedQuantity;
    }

    public void setApprovedQuantity(Double approvedQuantity) {
        this.approvedQuantity = approvedQuantity;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public DemandStatus getStatus() {
        return status;
    }

    public void setStatus(DemandStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Tender getTender() {
        return tender;
    }

    public void setTender(Tender tender) {
        this.tender = tender;
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

package com.inonu.stok_takip.dto.Response;

import com.inonu.stok_takip.Enum.DemandStatus;

import java.time.LocalDate;

public class MaterialDemandResponse {
    private Long id;
    private String productName;
    private Double quantity;
    private Double approvedQuantity; // onaylama sırasında belirlenen miktar
    private String userName;
    private String companyName;
    private LocalDate requestDate;
    private String rejectionReason;
    private Long productId;
    private DemandStatus demandStatus;

    public MaterialDemandResponse() {
    }

    public MaterialDemandResponse(Long id, Double quantity, String companyName,
                                  String rejectionReason,LocalDate requestDate,
                                  Long productId, DemandStatus demandStatus,
                                  String userName, String productName) {
        this.id = id;
        this.quantity = quantity;
        this.companyName = companyName;
        this.rejectionReason = rejectionReason;
        this.requestDate = requestDate;
        this.productId = productId;
        this.demandStatus = demandStatus;
        this.userName = userName;
        this.productName = productName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public DemandStatus getDemandStatus() {
        return demandStatus;
    }

    public void setDemandStatus(DemandStatus demandStatus) {
        this.demandStatus = demandStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}

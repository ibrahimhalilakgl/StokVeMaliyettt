package com.inonu.stok_takip.dto.Response;

import com.inonu.stok_takip.Enum.ReportType;

import java.time.LocalDate;

public class ReportResponse {
    private Long id;
    private ReportType reportType;
    private LocalDate reportCreateDate;
    private int ticketQuantity;
    private Double totalTicketPrice;
    private int totalPersonQuantity; 
    private Double totalMaterialPrice;
    private Double averagePersonCost; 
    private Double averageTicketCost;
    private int leftoverMealCount;

    public ReportResponse() {
    }

    public ReportResponse(Long id, ReportType reportType, LocalDate reportCreateDate,
                          int ticketQuantity, Double totalTicketPrice, int totalPersonQuantity,
                          Double totalMaterialPrice, Double averagePersonCost, Double averageTicketCost,
                            int leftoverMealCount) {
        this.id = id;
        this.reportType = reportType;
        this.reportCreateDate = reportCreateDate;
        this.ticketQuantity = ticketQuantity;
        this.totalTicketPrice = totalTicketPrice;
        this.totalPersonQuantity = totalPersonQuantity;
        this.totalMaterialPrice = totalMaterialPrice;
        this.averagePersonCost = averagePersonCost;
        this.averageTicketCost = averageTicketCost;
        this.leftoverMealCount = leftoverMealCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public LocalDate getReportCreateDate() {
        return reportCreateDate;
    }

    public void setReportCreateDate(LocalDate reportCreateDate) {
        this.reportCreateDate = reportCreateDate;
    }

    public int getTicketQuantity() {
        return ticketQuantity;
    }

    public void setTicketQuantity(int ticketQuantity) {
        this.ticketQuantity = ticketQuantity;
    }

    public Double getTotalTicketPrice() {
        return totalTicketPrice;
    }

    public void setTotalTicketPrice(Double totalTicketPrice) {
        this.totalTicketPrice = totalTicketPrice;
    }

    public int getTotalPersonQuantity() {
        return totalPersonQuantity;
    }

    public void setTotalPersonQuantity(int totalPersonQuantity) {
        this.totalPersonQuantity = totalPersonQuantity;
    }

    public Double getTotalMaterialPrice() {
        return totalMaterialPrice;
    }

    public void setTotalMaterialPrice(Double totalMaterialPrice) {
        this.totalMaterialPrice = totalMaterialPrice;
    }

    public Double getAveragePersonCost() {
        return averagePersonCost;
    }

    public void setAveragePersonCost(Double averagePersonCost) {
        this.averagePersonCost = averagePersonCost;
    }

    public Double getAverageTicketCost() {
        return averageTicketCost;
    }

    public void setAverageTicketCost(Double averageTicketCost) {
        this.averageTicketCost = averageTicketCost;
    }

    public int getLeftoverMealCount() {
        return leftoverMealCount;
    }

    public void setLeftoverMealCount(int leftoverMealCount) {
        this.leftoverMealCount = leftoverMealCount;
    }
}

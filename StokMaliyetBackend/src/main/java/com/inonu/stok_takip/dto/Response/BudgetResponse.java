package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;

public class BudgetResponse {
    private Long id;
    private String budgetName;
    private Double budgetAmount;
    private LocalDate startDate;
    private LocalDate endDate;

    public BudgetResponse(Long id, String budgetName, Double budgetAmount, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.budgetName = budgetName;
        this.budgetAmount = budgetAmount;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public BudgetResponse() {
    }

    public Long getId() { return id; }
    public String getBudgetName() { return budgetName; }
    public Double getBudgetAmount() { return budgetAmount; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
    }

    public void setBudgetAmount(Double budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}

package com.inonu.stok_takip.entitiy;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.time.LocalDate;
import java.util.List;

@Entity
public class Budget extends BaseEntity{

    private String budgetName;  // bütçe adı ( 2025 yemek bütçesi vb.) sorulacak
    private Double budgetAmount; // bütçenin tutarı
    private LocalDate startDate; // bütçenin başlama tarihi
    private LocalDate endDate; // bütçenin bitiş tarihi

    @OneToMany(mappedBy = "budget")
    private List<MaterialEntry> materialEntryList;

    public String getBudgetName() {
        return budgetName;
    }

    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
    }

    public Double getBudgetAmount() {
        return budgetAmount;
    }

    public void setBudgetAmount(Double budgetAmount) {
        this.budgetAmount = budgetAmount;
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


    public List<MaterialEntry> getMaterialEntryList() {
        return materialEntryList;
    }

    public void setMaterialEntryList(List<MaterialEntry> materialEntryList) {
        this.materialEntryList = materialEntryList;
    }
}

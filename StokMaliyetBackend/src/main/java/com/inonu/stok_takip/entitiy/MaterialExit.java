package com.inonu.stok_takip.entitiy;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDate;

@Entity
public class MaterialExit extends BaseEntity{


    // Malzeme çıkışları 2 farklı şekilde olacak bir yemek malzemeleri için toplam çıkış
    // 2 temizlik gibi yemekte kullanılmayana ama maliyeti hesaplanan malzemelerin çıkışı

    private Double unitPrice;
    private Double quantity;
    private Double totalPrice;
    private LocalDate exitDate;// ürünün depodan çıkış tarihi
    private String recipient; // ürünü alan birim
    private int totalPerson; // mevcud sayısı
    private String description;

    @ManyToOne
    @JoinColumn(name = "product_id",nullable = false)
    private Product product;

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDate getExitDate() {
        return exitDate;
    }

    public void setExitDate(LocalDate exitDate) {
        this.exitDate = exitDate;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getTotalPerson() {
        return totalPerson;
    }

    public void setTotalPerson(int totalPerson) {
        this.totalPerson = totalPerson;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

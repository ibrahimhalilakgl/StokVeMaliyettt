package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;

public class TicketSalesDetailResponse {
    private Long id;
    private int quantity; 
    private Double totalPrice;
    private LocalDate ticketDate; 
    private String ticketTypeName;

    public TicketSalesDetailResponse() {
    }

    public TicketSalesDetailResponse(Long id, Double totalPrice,int quantity,LocalDate ticketDate, String ticketTypeName) {
        this.id = id;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.ticketDate = ticketDate;
        this.ticketTypeName = ticketTypeName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDate getTicketDate() {
        return ticketDate;
    }

    public void setTicketDate(LocalDate ticketDate) {
        this.ticketDate = ticketDate;
    }

    public String getTicketTypeName() {
        return ticketTypeName;
    }

    public void setTicketTypeName(String ticketTypeName) {
        this.ticketTypeName = ticketTypeName;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
}

package com.inonu.stok_takip.dto.Response;

public class TicketTypeResponse {
    private Long id;
    private String name;
    private Double unitPrice;

    public TicketTypeResponse() {
    }

    public TicketTypeResponse(Long id, String name, Double unitPrice) {
        this.id = id;
        this.name = name;
        this.unitPrice = unitPrice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
}

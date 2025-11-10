package com.inonu.stok_takip.dto.Response;

public class PurchasedUnitResponse {
    private Long id;
    private String name;

    public PurchasedUnitResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public PurchasedUnitResponse() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}

package com.inonu.stok_takip.dto.Response;

public class PurchaseTypeResponse {
    private Long id;
    private String name;

    public PurchaseTypeResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public PurchaseTypeResponse() {
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

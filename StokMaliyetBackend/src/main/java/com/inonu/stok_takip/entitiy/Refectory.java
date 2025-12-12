package com.inonu.stok_takip.entitiy;

import jakarta.persistence.Entity;

@Entity
public class Refectory extends BaseEntity{

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

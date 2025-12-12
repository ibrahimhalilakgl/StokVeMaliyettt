package com.inonu.stok_takip.entitiy;


import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class MeasurementType extends BaseEntity {
    private String name;

    @OneToMany(mappedBy = "measurementType")
    private List<Product> products;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

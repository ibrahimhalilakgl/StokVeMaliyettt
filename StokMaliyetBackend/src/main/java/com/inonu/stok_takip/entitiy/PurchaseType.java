package com.inonu.stok_takip.entitiy;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.List;

@Entity
public class PurchaseType extends BaseEntity {  //alım tipi mal hizmet bakım onarım vb

    private String name;

    @OneToMany(mappedBy = "purchaseType")
    private List<MaterialEntry> materialEntryList;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<MaterialEntry> getMaterialEntryList() {
        return materialEntryList;
    }

    public void setMaterialEntryList(List<MaterialEntry> materialEntryList) {
        this.materialEntryList = materialEntryList;
    }
}

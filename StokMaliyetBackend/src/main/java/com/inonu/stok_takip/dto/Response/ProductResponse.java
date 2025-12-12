package com.inonu.stok_takip.dto.Response;

public class ProductResponse {
    private Long id;
    private String name;
    private Double vatAmount;
    private Double criticalLevel;
    private String measurementTypeName;
    private String categoryName;

    public ProductResponse(){}

    public ProductResponse(Long id, String name, Double vatAmount,
                           Double criticalLevel,
                           String measurementTypeName, String categoryName){
        this.id=id;
        this.name=name;
        this.vatAmount=vatAmount;
        this.criticalLevel=criticalLevel;
        this.measurementTypeName = measurementTypeName;
        this.categoryName=categoryName;
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

    public String getMeasurementTypeName() {
        return measurementTypeName;
    }

    public void setMeasurementTypeName(String measurementTypeName) {
        this.measurementTypeName = measurementTypeName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Double getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(Double vatAmount) {
        this.vatAmount = vatAmount;
    }

    public Double getCriticalLevel() {
        return criticalLevel;
    }

    public void setCriticalLevel(Double criticalLevel) {
        this.criticalLevel = criticalLevel;
    }


}

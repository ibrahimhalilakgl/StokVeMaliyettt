package com.inonu.stok_takip.dto.Response;

public record MaterialEntryProductResponse(
        String productName,
        String productCategoryName,   // <- category.name
        String measurementUnitName,    // <- measurementType.name
        Double averageUnitPrice,
        Double totalStockQuantity,
        MaterialEntryProductDetailResponse detailResponse
) {
}

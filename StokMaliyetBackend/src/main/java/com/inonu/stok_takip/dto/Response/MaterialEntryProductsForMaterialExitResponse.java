package com.inonu.stok_takip.dto.Response;

public record MaterialEntryProductsForMaterialExitResponse(
        Long productId,
        String productName,
        String productCategoryName,   // <- category.name
        String measurementTypeName,    // <- measurementType.name
        Double totalRemainingStockQuantity
) {
}

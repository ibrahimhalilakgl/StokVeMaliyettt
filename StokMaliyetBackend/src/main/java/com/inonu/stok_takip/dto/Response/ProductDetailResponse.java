package com.inonu.stok_takip.dto.Response;

public record ProductDetailResponse(
         String name,
         Double vatAmount,
         Double criticalLevel,
         String measurementType,
         String category
) {
}

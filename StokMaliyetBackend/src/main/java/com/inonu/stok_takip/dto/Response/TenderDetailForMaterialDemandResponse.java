package com.inonu.stok_takip.dto.Response;

public record TenderDetailForMaterialDemandResponse(
        Long productId,
        String productName,
        String companyName
) {
}

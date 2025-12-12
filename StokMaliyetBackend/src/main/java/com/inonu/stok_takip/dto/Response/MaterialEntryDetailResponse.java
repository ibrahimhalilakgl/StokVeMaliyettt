package com.inonu.stok_takip.dto.Response;

public record MaterialEntryDetailResponse(
        ProductDetailResponse productResponse,
        Double totalCarryOver,
        Double totalTender,
        Double totalDirectProcurement,
        Double totalExit,
        Double remainingQuantity
) {
}

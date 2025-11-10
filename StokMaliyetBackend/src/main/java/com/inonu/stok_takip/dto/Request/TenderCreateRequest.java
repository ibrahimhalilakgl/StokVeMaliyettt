package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record TenderCreateRequest(
        Long productId,
        Double tenderQuantity,
        LocalDate startDate,
        LocalDate endDate,
        Double unitPrice,
        String companyName,
        Long purchasedUnitId,
        Long purchaseTypeId

) {
}

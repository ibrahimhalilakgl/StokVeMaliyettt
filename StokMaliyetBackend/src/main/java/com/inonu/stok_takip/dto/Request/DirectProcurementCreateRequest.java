package com.inonu.stok_takip.dto.Request;

import com.inonu.stok_takip.Enum.TenderType;

import java.time.LocalDate;

public record DirectProcurementCreateRequest(
        Long productId,
        Double quantity,
        LocalDate startDate,
        LocalDate endDate,
        Double unitPrice,
        String companyName,
        Long purchaseUnitId,
        Long purchaseTypeId,
        LocalDate entryDate,
        LocalDate expiryDate
) {
}

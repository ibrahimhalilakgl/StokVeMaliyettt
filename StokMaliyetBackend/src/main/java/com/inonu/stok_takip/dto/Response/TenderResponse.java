package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;

public record TenderResponse (
        Long id,
        Double tenderQuantity,
        Double remainingQuantityInTender,
        LocalDate startDate,
        LocalDate endDate,
        Boolean increased,
        Double increaseAmount, // yapılan arttırma miktarı (yüzde olarak)
        Boolean active,
        Double unitPrice,
        Double totalAmount,
        String companyName,
        Long productId,
        String productName,
        String measurementTypeName,
        String purchasedUnitName,
        String purchaseTypeName,
        String tenderType){
}

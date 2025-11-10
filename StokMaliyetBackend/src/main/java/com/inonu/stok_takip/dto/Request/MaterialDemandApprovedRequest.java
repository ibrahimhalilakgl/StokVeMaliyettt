package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record MaterialDemandApprovedRequest (
        Long materialDemandId,
        Long budgetId,
        String description,
        LocalDate expiryDate,
        LocalDate entryDate,
        Double quantity  // Onaylama sırasında değiştirilebilen miktar (opsiyonel)

){
}

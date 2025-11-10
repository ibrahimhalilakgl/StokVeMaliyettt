package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;

public record MaterialEntryProductDetailResponse(
        Double criticalLevel,
        LocalDate lastEntryDate,
        Double vatAmount,
        int totalRecordCount,
        Double totalPrice
) {

}

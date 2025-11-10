package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record DateRequest(
    LocalDate startDate,
    LocalDate endDate
) {
    
}

package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record MaterialDemandUpdateRequest(
        Long id,
        Double quantity,
        String userName
) {
}

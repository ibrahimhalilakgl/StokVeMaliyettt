package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record MaterialDemandCreateRequest(
    Double quantity,
    String userName,
    LocalDate requestDate,
    Long productId,
    Long tenderId,
    Long directProcurementId
) {}

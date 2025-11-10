package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;
import java.util.Map;

public record MaterialExitCreateRequest(
    Map<Long,Double> productQuantities,
    String recipient,
    int totalPerson,
    LocalDate exitDate,
    String description
) {
    
}

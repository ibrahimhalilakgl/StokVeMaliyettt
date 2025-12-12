package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;

public record BudgetCreateRequest(
    String budgetName,
    LocalDate startDate,
    LocalDate endDate
) {}

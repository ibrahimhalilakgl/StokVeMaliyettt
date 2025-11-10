package com.inonu.stok_takip.dto.Request;

import com.inonu.stok_takip.Enum.EntrySourceType;
import com.inonu.stok_takip.Enum.TenderType;

import java.time.LocalDate;

public record MaterialEntryCreateRequest(
    Double quantity,
    Double unitPrice,
    LocalDate entryDate,
    LocalDate expiryDate,
    String companyName,
    String description,
    Long productId,
    Long budgetId,
    EntrySourceType entrySourceType,
    Long purchaseUnitId,
    Long purchaseTypeId,
    Long tenderId,
    Long directProcurementId,
    TenderType tenderType
) {}

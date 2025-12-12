package com.inonu.stok_takip.dto.Response;

import java.util.List;

public record GroupMaterialEntryResponse(
        String tenderTypeName,
        double totalAmount,
        List<MaterialEntryProductResponse> productResponses
) {
}

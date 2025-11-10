package com.inonu.stok_takip.dto.Response;

import java.util.List;

public record TenderDetailResponse(
        String formName,
        Double totalAmount,
        List<TenderProductDetailResponse> products
) {
}

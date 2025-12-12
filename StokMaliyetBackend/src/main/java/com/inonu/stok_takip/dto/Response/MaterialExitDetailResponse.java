package com.inonu.stok_takip.dto.Response;

import java.time.LocalDate;

public record MaterialExitDetailResponse(
        ProductDetailResponse productDetailResponse,
        Double quantity,
        Double unitPrice,
        Double totalPrice,
        LocalDate exitDate

) {
}

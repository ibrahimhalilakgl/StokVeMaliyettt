package com.inonu.stok_takip.dto.Request;

public record ProductUpdateRequest(Long id,String name, Double vatAmount, Double criticalLevel) {
}

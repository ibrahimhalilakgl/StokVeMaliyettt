package com.inonu.stok_takip.dto.Request;

import java.time.LocalDate;
import java.util.List;

public record GunlukMenuCreateRequest(
    LocalDate tarih,
    Long anaYemekId,
    List<Long> yardimciYemekIdleri
) {}


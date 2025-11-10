package com.inonu.stok_takip.dto.Request;

import com.inonu.stok_takip.Enum.YemekTipi;

public record YemekRecetesiCreateRequest(
    String adi,
    String aciklama,
    String receteDetaylari,
    YemekTipi tipi
) {}


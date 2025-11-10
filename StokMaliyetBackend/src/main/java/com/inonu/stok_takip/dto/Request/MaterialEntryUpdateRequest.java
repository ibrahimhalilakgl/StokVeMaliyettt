package com.inonu.stok_takip.dto.Request;

public record MaterialEntryUpdateRequest(
    Long id,
    Double quantity

    //Gerekli olup olmadığı belli deği belirlenince ona gore işlem yapılacak
) {}

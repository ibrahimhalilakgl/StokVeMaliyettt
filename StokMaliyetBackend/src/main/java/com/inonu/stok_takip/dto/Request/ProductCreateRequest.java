package com.inonu.stok_takip.dto.Request;

import org.springframework.web.multipart.MultipartFile;

public record ProductCreateRequest(
    String name,
    Double vatAmount,
    Double criticalLevel,
    Long measurementTypeId,
    Long categoryId
    //MultipartFile image
    ) {}
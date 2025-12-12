package com.inonu.stok_takip.Controller;

import org.springframework.web.bind.annotation.*;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/depo")
@PreAuthorize("hasAnyRole('DEPO','ADMIN')")
public class DepoController {

    @GetMapping("/panel")
    public String depoPanel() {
        return "📦 Depo paneline eriştiniz.";
    }
}

package com.inonu.stok_takip.Controller;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/yemekhane")
@PreAuthorize("hasAnyRole('YEMEKHANE','ADMIN')")
public class YemekhaneController {

    @GetMapping("/panel")
    public String yemekhanePanel() {
        return "🍽️ Yemekhane paneline eriştiniz.";
    }
}

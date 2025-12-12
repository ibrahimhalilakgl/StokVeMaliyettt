package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.DashboardService;
import com.inonu.stok_takip.dto.Response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<Map<String, Object>>> getAdminStats() {
        Map<String, Object> stats = dashboardService.getAdminStats();
        return new ResponseEntity<>(RestResponse.of(stats), HttpStatus.OK);
    }

    @GetMapping("/yemekhane/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'YEMEKHANE')")
    public ResponseEntity<RestResponse<Map<String, Object>>> getYemekhaneStats() {
        Map<String, Object> stats = dashboardService.getYemekhaneStats();
        return new ResponseEntity<>(RestResponse.of(stats), HttpStatus.OK);
    }

    @GetMapping("/depo/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPO')")
    public ResponseEntity<RestResponse<Map<String, Object>>> getDepoStats() {
        Map<String, Object> stats = dashboardService.getDepoStats();
        return new ResponseEntity<>(RestResponse.of(stats), HttpStatus.OK);
    }

    @GetMapping("/satinalma/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SATINALMA')")
    public ResponseEntity<RestResponse<Map<String, Object>>> getSatinalmaStats() {
        Map<String, Object> stats = dashboardService.getSatinalmaStats();
        return new ResponseEntity<>(RestResponse.of(stats), HttpStatus.OK);
    }
}



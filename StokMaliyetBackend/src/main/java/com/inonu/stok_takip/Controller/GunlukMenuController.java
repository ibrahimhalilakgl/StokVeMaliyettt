package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.GunlukMenuService;
import com.inonu.stok_takip.dto.Request.GunlukMenuCreateRequest;
import com.inonu.stok_takip.dto.Response.GunlukMenuResponse;
import com.inonu.stok_takip.dto.Response.MenuRaporResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/gunluk-menu")
@PreAuthorize("hasAnyRole('ADMIN','DEPO','YEMEKHANE')")
public class GunlukMenuController {

    private final GunlukMenuService gunlukMenuService;

    public GunlukMenuController(GunlukMenuService gunlukMenuService) {
        this.gunlukMenuService = gunlukMenuService;
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<GunlukMenuResponse>>> getAllGunlukMenuler() {
        List<GunlukMenuResponse> menuler = gunlukMenuService.getAllGunlukMenuler();
        return new ResponseEntity<>(RestResponse.of(menuler), HttpStatus.OK);
    }

    @GetMapping("/by-tarih")
    public ResponseEntity<RestResponse<GunlukMenuResponse>> getGunlukMenuByTarih(@RequestParam("tarih") LocalDate tarih) {
        GunlukMenuResponse menu = gunlukMenuService.getGunlukMenuByTarih(tarih);
        return new ResponseEntity<>(RestResponse.of(menu), HttpStatus.OK);
    }

    @GetMapping("/bugun")
    public ResponseEntity<RestResponse<GunlukMenuResponse>> getBugununMenusu() {
        LocalDate bugun = LocalDate.now();
        try {
            GunlukMenuResponse menu = gunlukMenuService.getGunlukMenuByTarih(bugun);
            return new ResponseEntity<>(RestResponse.of(menu), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(RestResponse.empty(), HttpStatus.OK);
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<RestResponse<GunlukMenuResponse>> createGunlukMenu(@RequestBody GunlukMenuCreateRequest request) {
        GunlukMenuResponse menu = gunlukMenuService.createGunlukMenu(request);
        return new ResponseEntity<>(RestResponse.of(menu), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<RestResponse<GunlukMenuResponse>> updateGunlukMenu(
            @PathVariable("id") Long id,
            @RequestBody GunlukMenuCreateRequest request) {
        GunlukMenuResponse menu = gunlukMenuService.updateGunlukMenu(id, request);
        return new ResponseEntity<>(RestResponse.of(menu), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<RestResponse<GunlukMenuResponse>> deleteGunlukMenu(@PathVariable("id") Long id) {
        GunlukMenuResponse menu = gunlukMenuService.deleteGunlukMenu(id);
        return new ResponseEntity<>(RestResponse.of(menu), HttpStatus.OK);
    }

    @GetMapping("/rapor/{yil}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<RestResponse<MenuRaporResponse>> getYillikRapor(@PathVariable("yil") int yil) {
        MenuRaporResponse rapor = gunlukMenuService.getYillikRapor(yil);
        return new ResponseEntity<>(RestResponse.of(rapor), HttpStatus.OK);
    }
}


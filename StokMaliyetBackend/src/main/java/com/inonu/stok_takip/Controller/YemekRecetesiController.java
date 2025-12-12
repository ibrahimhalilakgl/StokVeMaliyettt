package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.YemekRecetesiService;
import com.inonu.stok_takip.dto.Request.YemekRecetesiCreateRequest;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.dto.Response.YemekRecetesiResponse;
import com.inonu.stok_takip.Enum.YemekTipi;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/yemek-recetesi")
@PreAuthorize("hasAnyRole('ADMIN')")
public class YemekRecetesiController {

    private final YemekRecetesiService yemekRecetesiService;

    public YemekRecetesiController(YemekRecetesiService yemekRecetesiService) {
        this.yemekRecetesiService = yemekRecetesiService;
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<YemekRecetesiResponse>>> getAllYemekReceteleri() {
        List<YemekRecetesiResponse> receteler = yemekRecetesiService.getAllYemekReceteleri();
        return new ResponseEntity<>(RestResponse.of(receteler), HttpStatus.OK);
    }

    @GetMapping("/by-tipi/{tipi}")
    public ResponseEntity<RestResponse<List<YemekRecetesiResponse>>> getYemekReceteleriByTipi(@PathVariable("tipi") YemekTipi tipi) {
        List<YemekRecetesiResponse> receteler = yemekRecetesiService.getYemekReceteleriByTipi(tipi);
        return new ResponseEntity<>(RestResponse.of(receteler), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<YemekRecetesiResponse>> getYemekRecetesiById(@PathVariable("id") Long id) {
        com.inonu.stok_takip.entitiy.YemekRecetesi recete = yemekRecetesiService.getYemekRecetesiById(id);
        YemekRecetesiResponse response = new YemekRecetesiResponse(
                recete.getId(),
                recete.getAdi(),
                recete.getAciklama(),
                recete.getReceteDetaylari(),
                recete.getTipi()
        );
        return new ResponseEntity<>(RestResponse.of(response), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<RestResponse<YemekRecetesiResponse>> createYemekRecetesi(@RequestBody YemekRecetesiCreateRequest request) {
        YemekRecetesiResponse recete = yemekRecetesiService.createYemekRecetesi(request);
        return new ResponseEntity<>(RestResponse.of(recete), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestResponse<YemekRecetesiResponse>> updateYemekRecetesi(
            @PathVariable("id") Long id,
            @RequestBody YemekRecetesiCreateRequest request) {
        YemekRecetesiResponse recete = yemekRecetesiService.updateYemekRecetesi(id, request);
        return new ResponseEntity<>(RestResponse.of(recete), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<YemekRecetesiResponse>> deleteYemekRecetesi(@PathVariable("id") Long id) {
        YemekRecetesiResponse recete = yemekRecetesiService.deleteYemekRecetesi(id);
        return new ResponseEntity<>(RestResponse.of(recete), HttpStatus.OK);
    }
}


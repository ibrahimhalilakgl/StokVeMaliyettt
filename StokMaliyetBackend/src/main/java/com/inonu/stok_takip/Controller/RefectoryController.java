package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.RefectoryService;
import com.inonu.stok_takip.dto.Request.RefectoryCreateRequest;
import com.inonu.stok_takip.dto.Response.RefectoryResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.Refectory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/v1/refectory")
@PreAuthorize("hasAnyRole('YEMEKHANE','ADMIN')")
public class RefectoryController {

    private final RefectoryService RefectoryService;

    public RefectoryController(RefectoryService RefectoryService) {
        this.RefectoryService = RefectoryService;
    }



    @PostMapping("/create")
    public ResponseEntity<RestResponse<RefectoryResponse>> createRefectory(@RequestBody RefectoryCreateRequest RefectoryCreateRequest) {
        RefectoryResponse RefectoryResponse = RefectoryService.createRefectory(RefectoryCreateRequest);
        return new ResponseEntity<>(RestResponse.of(RefectoryResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<Refectory>> getRefectoryById(@PathVariable("id") Long RefectoryId) {
        Refectory Refectory = RefectoryService.getRefectoryById(RefectoryId);
        return new ResponseEntity<>(RestResponse.of(Refectory),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<RefectoryResponse>>> getAllCategories() {
        List<RefectoryResponse> categories = RefectoryService.getAllRefectories();
        return new ResponseEntity<>(RestResponse.of(categories), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<RestResponse<RefectoryResponse>> updateRefectory(@RequestBody RefectoryCreateRequest RefectoryCreateRequest) {
        RefectoryResponse RefectoryResponse = RefectoryService.updateRefectory(RefectoryCreateRequest);
        return new ResponseEntity<>(RestResponse.of(RefectoryResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<RefectoryResponse>> deleteRefectory(@PathVariable("id") Long RefectoryId) {
        RefectoryResponse RefectoryResponse = RefectoryService.deleteRefectory(RefectoryId);
        return new ResponseEntity<>(RestResponse.of(RefectoryResponse), HttpStatus.OK);
    }

}

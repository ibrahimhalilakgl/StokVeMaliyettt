package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.ProductService;
import com.inonu.stok_takip.dto.Request.ProductCreateRequest;
import com.inonu.stok_takip.dto.Request.ProductUpdateRequest;
import com.inonu.stok_takip.dto.Response.ProductResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.Product;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/v1/product")
@PreAuthorize("hasAnyRole('DEPO','SATINALMA','ADMIN','YEMEKHANE')")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(value = "/create")   //, consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    public ResponseEntity<RestResponse<ProductResponse>> createProduct(
            @RequestBody ProductCreateRequest productCreateRequest) {

        ProductResponse productResponse = productService.createProduct(productCreateRequest);
        return new ResponseEntity<>(RestResponse.of(productResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<Product>> getProductById(@PathVariable("id") Long productId) {
        Product product = productService.getProductById(productId);
        return new ResponseEntity<>(RestResponse.of(product),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<ProductResponse>>> GetAllProducts() {
        List<ProductResponse> productList = productService.GetAllProducts();
        return new ResponseEntity<>(RestResponse.of(productList), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<RestResponse<ProductResponse>> updateProduct(@RequestBody ProductUpdateRequest productUpdateRequest) {
        ProductResponse productResponse = productService.updateProduct(productUpdateRequest);
        return new ResponseEntity<>(RestResponse.of(productResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<ProductResponse>> deleteProduct(@PathVariable("id") Long productId) {
        ProductResponse productResponse = productService.deleteProduct(productId);
        return new ResponseEntity<>(RestResponse.of(productResponse), HttpStatus.OK);
    }

}

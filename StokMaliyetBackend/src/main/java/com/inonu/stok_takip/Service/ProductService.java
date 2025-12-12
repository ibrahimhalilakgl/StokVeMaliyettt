package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.ProductCreateRequest;
import com.inonu.stok_takip.dto.Request.ProductUpdateRequest;
import com.inonu.stok_takip.dto.Response.ProductResponse;
import com.inonu.stok_takip.entitiy.Product;

import java.util.List;

public interface ProductService {

    List<ProductResponse> GetAllProducts();
    ProductResponse createProduct(ProductCreateRequest productCreateRequest);
    ProductResponse updateProduct(ProductUpdateRequest productUpdateRequest);
    Product getProductById(Long productId);
    ProductResponse deleteProduct(Long productId);

}

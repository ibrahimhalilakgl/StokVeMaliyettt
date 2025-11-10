package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.Product.ProductNotFoundException;
import com.inonu.stok_takip.Repositoriy.ProductRepository;
import com.inonu.stok_takip.Service.CategoryService;
import com.inonu.stok_takip.Service.MeasurementTypeService;
import com.inonu.stok_takip.Service.ProductService;
import com.inonu.stok_takip.dto.Request.ProductCreateRequest;
import com.inonu.stok_takip.dto.Request.ProductUpdateRequest;
import com.inonu.stok_takip.dto.Response.ProductResponse;
import com.inonu.stok_takip.entitiy.Category;
import com.inonu.stok_takip.entitiy.MeasurementType;
import com.inonu.stok_takip.entitiy.Product;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final MeasurementTypeService measurementTypeService;

    public ProductServiceImpl(ProductRepository productRepository, CategoryService categoryService, MeasurementTypeService measurementTypeService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.measurementTypeService = measurementTypeService;
    }

    @Override
    public List<ProductResponse> GetAllProducts() {
        List<Product> productList =  productRepository.findAll();
        return mapToResponseList(productList);
    }


    @Override
    public ProductResponse createProduct(ProductCreateRequest productCreateRequest) {

        Category category = categoryService.getCategoryById(productCreateRequest.categoryId());
        MeasurementType measurementType = measurementTypeService.getMeasurementTypeById(productCreateRequest.measurementTypeId());

        Product product = mapToEntity(productCreateRequest);
        // VAT zaten yüzdelik olarak geliyor, 100'e bölmeye gerek yok
        product.setVatAmount(productCreateRequest.vatAmount());
        product.setCategory(category);
        product.setMeasurementType(measurementType);

        Product toSave = productRepository.save(product);
        return mapToResponse(toSave);

    }

    @Override
    public ProductResponse updateProduct(ProductUpdateRequest productUpdateRequest) {
        Product toUpdate  = getProductById(productUpdateRequest.id());
        toUpdate.setName(productUpdateRequest.name());
        toUpdate.setVatAmount(productUpdateRequest.vatAmount());
        toUpdate.setCriticalLevel(productUpdateRequest.criticalLevel());
        Product updatedProduct = productRepository.save(toUpdate);
        return mapToResponse(updatedProduct);
    }

    @Override
    public Product getProductById(Long productId) {
        return productRepository.findById(productId).orElseThrow(()->new ProductNotFoundException("Product not found by id: " + productId));
    }

    @Override
    public ProductResponse deleteProduct(Long productId) {
        Product product = getProductById(productId);
        productRepository.delete(product);
        return mapToResponse(product);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse productResponse = new ProductResponse(
                product.getId(),
                product.getName(),
                product.getVatAmount(),
                product.getCriticalLevel(),
                product.getMeasurementType().getName(),
                product.getCategory().getName()
        );
        return productResponse;
    }
    private List<ProductResponse> mapToResponseList(List<Product> productList) {
        List<ProductResponse> productResponseList = productList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return productResponseList;
    }

    private Product mapToEntity(ProductCreateRequest request){
        Product product = new Product();
        product.setName(request.name());
        product.setCriticalLevel(request.criticalLevel());
        return product;
    }
}

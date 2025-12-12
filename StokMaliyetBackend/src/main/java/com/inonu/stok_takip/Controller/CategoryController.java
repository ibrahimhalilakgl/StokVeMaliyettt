package com.inonu.stok_takip.Controller;

import com.inonu.stok_takip.Service.CategoryService;
import com.inonu.stok_takip.dto.Request.CategoryCreateRequest;
import com.inonu.stok_takip.dto.Response.CategoryResponse;
import com.inonu.stok_takip.dto.Response.RestResponse;
import com.inonu.stok_takip.entitiy.Category;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


import java.util.List;

@RestController
@RequestMapping("/v1/category")
@PreAuthorize("hasAnyRole('SATINALMA','ADMIN','DEPO','YEMEKHANE')")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }



    @PostMapping("/create")
    public ResponseEntity<RestResponse<CategoryResponse>> createCategory(@RequestBody CategoryCreateRequest categoryCreateRequest) {
        CategoryResponse categoryResponse = categoryService.createCategory(categoryCreateRequest);
        return new ResponseEntity<>(RestResponse.of(categoryResponse), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<Category>> getCategoryById(@PathVariable("id") Long categoryId) {
        Category category = categoryService.getCategoryById(categoryId);
        return new ResponseEntity<>(RestResponse.of(category),HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<RestResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.GetAllCategories();
        return new ResponseEntity<>(RestResponse.of(categories), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<RestResponse<CategoryResponse>> updateCategory(@RequestBody CategoryCreateRequest categoryCreateRequest) {
        CategoryResponse categoryResponse = categoryService.updateCategory(categoryCreateRequest);
        return new ResponseEntity<>(RestResponse.of(categoryResponse), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<RestResponse<CategoryResponse>> deleteCategory(@PathVariable("id") Long categoryId) {
        CategoryResponse categoryResponse = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(RestResponse.of(categoryResponse), HttpStatus.OK);
    }

}

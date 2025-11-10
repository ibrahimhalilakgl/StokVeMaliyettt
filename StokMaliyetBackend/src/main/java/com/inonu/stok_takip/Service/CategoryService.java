package com.inonu.stok_takip.Service;

import com.inonu.stok_takip.dto.Request.CategoryCreateRequest;
import com.inonu.stok_takip.dto.Response.CategoryResponse;
import com.inonu.stok_takip.entitiy.Category;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> GetAllCategories();
    CategoryResponse createCategory(CategoryCreateRequest categoryCreateRequest);
    CategoryResponse updateCategory(CategoryCreateRequest categoryCreateRequest);
    Category getCategoryById(Long categoryId);
    CategoryResponse deleteCategory(Long categoryId);


}

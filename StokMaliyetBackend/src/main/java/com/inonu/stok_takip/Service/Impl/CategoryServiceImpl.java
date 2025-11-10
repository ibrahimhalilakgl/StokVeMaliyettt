package com.inonu.stok_takip.Service.Impl;

import com.inonu.stok_takip.Exception.Category.CategoryAlreadyExistsException;
import com.inonu.stok_takip.Exception.Category.CategoryNotFoundException;
import com.inonu.stok_takip.Exception.PurchasedUnit.PurchasedUnitAlreadyExistsException;
import com.inonu.stok_takip.Repositoriy.CategoryRepository;
import com.inonu.stok_takip.Service.CategoryService;
import com.inonu.stok_takip.dto.Request.CategoryCreateRequest;
import com.inonu.stok_takip.dto.Response.CategoryResponse;
import com.inonu.stok_takip.entitiy.Category;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryResponse> GetAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return mapToResponseList(categories);
    }

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest categoryCreateRequest) {

        Category existing = getCategoryByName(categoryCreateRequest.name());
        if (existing != null) {
            throw new CategoryAlreadyExistsException("Bu isimde bir Kategori zaten mevcut: " + categoryCreateRequest.name());
        }

        Category category = new Category();
        category.setName(categoryCreateRequest.name());
        Category toSave = categoryRepository.save(category);

        return mapToResponse(toSave);
    }

    private Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    @Override
    public CategoryResponse updateCategory(CategoryCreateRequest categoryCreateRequest) {
        return null;
    }

    @Override
    public Category getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId).orElseThrow(()-> new CategoryNotFoundException("Category Not Found by id: " + categoryId));
    }

    @Override
    public CategoryResponse deleteCategory(Long CategoryId) {
        Category category = getCategoryById(CategoryId);
        categoryRepository.delete(category);
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse categoryResponse = new CategoryResponse(
                category.getId(),
                category.getName()
        );
        return categoryResponse;
    }

    private List<CategoryResponse> mapToResponseList(List<Category> categoryList) {
        List<CategoryResponse> categoryResponseList = categoryList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return  categoryResponseList;
    }
}

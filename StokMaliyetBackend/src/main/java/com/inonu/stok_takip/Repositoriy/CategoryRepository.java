package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name);
}

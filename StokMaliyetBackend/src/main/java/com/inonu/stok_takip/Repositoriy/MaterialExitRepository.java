package com.inonu.stok_takip.Repositoriy;

import com.inonu.stok_takip.entitiy.MaterialExit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MaterialExitRepository extends JpaRepository<MaterialExit, Long> {


    List<MaterialExit> findByExitDateBetween(LocalDate startDate, LocalDate endDate);

    // günlük yapılan yemek sayısı
    @Query("""
        SELECT MAX(t.totalPerson)
        FROM MaterialExit t
        WHERE t.exitDate = :date AND t.totalPerson > 0
    """)
    Integer findTotalPersonsByDay(@Param("date") LocalDate date);



    // Haftalık yapılan yemek sayısı
    @Query(value = """
    SELECT SUM(daily_total) FROM (
        SELECT DISTINCT ON (exit_date) total_person AS daily_total
        FROM material_exit
        WHERE total_person > 0
          AND EXTRACT(WEEK FROM exit_date) = EXTRACT(WEEK FROM CAST(:date AS DATE))
          AND EXTRACT(YEAR FROM exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
        ORDER BY exit_date, id
    ) AS daily_counts
    """, nativeQuery = true)
    Integer findTotalPersonsByWeek(@Param("date") LocalDate date);


    // Aylık yapılan yemek sayısı
    @Query(value = """
    SELECT SUM(daily_total) FROM (
        SELECT DISTINCT ON (exit_date) total_person AS daily_total
        FROM material_exit
        WHERE total_person > 0
          AND EXTRACT(MONTH FROM exit_date) = EXTRACT(MONTH FROM CAST(:date AS DATE))
          AND EXTRACT(YEAR FROM exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
        ORDER BY exit_date, id
    ) AS daily_counts
    """, nativeQuery = true)
    Integer findTotalPersonsByMonth(@Param("date") LocalDate date);


    // yıllık bazdaa yapılan yemek sayısı
    @Query(value = """
        SELECT SUM(daily_total) FROM (
            SELECT DISTINCT ON (exit_date) total_person AS daily_total
            FROM material_exit
            WHERE total_person > 0
              AND EXTRACT(YEAR FROM exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
            ORDER BY exit_date, id
        ) AS daily_counts
        """, nativeQuery = true)
    Integer findTotalPersonsByYear(@Param("date") LocalDate date);


    // 1- Günlük, sadece temizlik harici toplam
    @Query("SELECT SUM(m.totalPrice) FROM MaterialExit m WHERE m.exitDate = :date AND m.product.category.name <> 'Temizlik'")
    Double findNonCleaningTotalByExitDate(@Param("date") LocalDate date);
    // 4- Haftalık toplam (LocalDate parametresiyle - sadece hafta ve yılına bakar)
    @Query(value = """
        SELECT SUM(m.total_price) 
        FROM material_exit m
        WHERE EXTRACT(WEEK FROM m.exit_date) = EXTRACT(WEEK FROM CAST(:date AS DATE))
        AND EXTRACT(YEAR FROM m.exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
    """, nativeQuery = true)
    Double findTotalByWeek(@Param("date") LocalDate date);


    // 2- Aylık toplam (LocalDate parametresiyle - sadece ay ve yılına bakar)
    @Query(value = "SELECT SUM(m.total_price) FROM material_exit m " +
            "WHERE EXTRACT(MONTH FROM m.exit_date) = EXTRACT(MONTH FROM CAST(:date AS DATE)) " +
            "AND EXTRACT(YEAR FROM m.exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))", nativeQuery = true)
    Double findTotalByMonth(@Param("date") LocalDate date);

    // 3- Yıllık toplam (LocalDate parametresiyle - sadece yılına bakar)
    @Query(value = "SELECT SUM(m.total_price) FROM material_exit m WHERE EXTRACT(YEAR FROM m.exit_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))", nativeQuery = true)
    Double findTotalByYear(@Param("date") LocalDate date);

    @Query("SELECT t FROM MaterialExit t WHERE t.exitDate BETWEEN :startDate AND :endDate")
    List<MaterialExit> findByMaterialDateBetween(@Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(t.totalPrice) FROM MaterialExit t " +
            "JOIN t.product p " +
            "WHERE p.category.name = 'Temizlik' " +
            "AND t.exitDate BETWEEN :startDate AND :endDate")
    Double findTotalPriceForCleaningCategoryBetweenDates(@Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);



    //  bundan sonrası tamamen raporlama için yazılmış
   /* @Query("SELECT m FROM MaterialExit m WHERE m.exitDate = :date")
    List<MaterialExit> findByExitDate(@Param("date") LocalDate date);
*/

    /*
    @Query("SELECT SUM(m.totalPrice) FROM MaterialExit m WHERE m.exitDate = :date AND m.product.category.name <> 'Temizlik'")
    Double findNonCleaningTotalByExitDate(@Param("date") LocalDate date);


    @Query("SELECT SUM(m.totalPrice) FROM MaterialExit m WHERE MONTH(m.exitDate) = :month AND YEAR(m.exitDate) = :year")
    Double findTotalByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);


    @Query("SELECT SUM(m.totalPrice) FROM MaterialExit m WHERE YEAR(m.exitDate) = :year")
    Double findTotalByYear(@Param("year") Integer year);


     */
}


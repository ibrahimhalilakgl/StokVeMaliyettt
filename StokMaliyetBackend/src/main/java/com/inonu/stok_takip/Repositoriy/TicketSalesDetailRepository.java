package com.inonu.stok_takip.Repositoriy;


import com.inonu.stok_takip.entitiy.TicketSalesDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TicketSalesDetailRepository extends JpaRepository<TicketSalesDetail, Long> {


    @Query("SELECT t FROM TicketSalesDetail t WHERE t.ticketDate BETWEEN :startDate AND :endDate")
    List<TicketSalesDetail> findBySaleDateBetween(@Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);


    @Query("SELECT SUM(t.quantity) FROM TicketSalesDetail t WHERE t.ticketDate = :ticketDate")
    Integer findTotalTicketSalesByDate(@Param("ticketDate") LocalDate ticketDate);

    @Query(value = """
        SELECT SUM(tsd.quantity) 
        FROM ticket_sales_detail tsd
        WHERE EXTRACT(WEEK FROM tsd.ticket_date) = EXTRACT(WEEK FROM CAST(:date AS DATE))
        AND EXTRACT(YEAR FROM tsd.ticket_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
    """, nativeQuery = true)
    Integer findTotalTicketSalesByWeek(@Param("date") LocalDate date);


    @Query("SELECT SUM(t.quantity) FROM TicketSalesDetail t WHERE EXTRACT(MONTH FROM t.ticketDate) = EXTRACT(MONTH FROM CAST(:date AS DATE)) AND EXTRACT(YEAR FROM t.ticketDate) = EXTRACT(YEAR FROM CAST(:date AS DATE))")
    Integer findTotalTicketSalesByMonth(@Param("date") LocalDate date);

    @Query("SELECT SUM(t.quantity) FROM TicketSalesDetail t WHERE EXTRACT(YEAR FROM t.ticketDate) = EXTRACT(YEAR FROM CAST(:date AS DATE))")
    Integer findTotalTicketSalesByYear(@Param("date") LocalDate date);


    // bundan sonrası bilet tutarları

    @Query("SELECT SUM(t.totalPrice) FROM TicketSalesDetail t WHERE t.ticketDate = :ticketDate")
    Double findTotalTicketSalesAmountByDate(@Param("ticketDate") LocalDate ticketDate);

    @Query(value = """
        SELECT SUM(tsd.total_price) 
        FROM ticket_sales_detail tsd
        WHERE EXTRACT(WEEK FROM tsd.ticket_date) = EXTRACT(WEEK FROM CAST(:date AS DATE))
        AND EXTRACT(YEAR FROM tsd.ticket_date) = EXTRACT(YEAR FROM CAST(:date AS DATE))
    """, nativeQuery = true)
    Double findTotalTicketSalesAmountByWeek(@Param("date") LocalDate date);

    @Query("SELECT SUM(t.totalPrice) FROM TicketSalesDetail t WHERE EXTRACT(MONTH FROM t.ticketDate) = EXTRACT(MONTH FROM CAST(:date AS DATE)) AND EXTRACT(YEAR FROM t.ticketDate) = EXTRACT(YEAR FROM CAST(:date AS DATE))")
    Double findTotalTicketSalesAmountByMonth(@Param("date") LocalDate date);


    @Query("SELECT SUM(t.totalPrice) FROM TicketSalesDetail t WHERE EXTRACT(YEAR FROM t.ticketDate) = EXTRACT(YEAR FROM CAST(:date AS DATE))")
    Double findTotalTicketSalesAmountByYear(@Param("date") LocalDate date);






}

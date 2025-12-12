package com.inonu.stok_takip.dto.Request;

import com.inonu.stok_takip.Enum.ReportType;

import java.time.LocalDate;

public record ReportCreateRequest(
    //String reportType, start ve end tarihine gore belirlenebilir 
             LocalDate reportDate,
             ReportType reportType,
             int ticketQuantity,
            // Double totalTicketPrice,
             int totalPersonQuantity,
             Double totalMaterialPrice,
             Double totalCleanPrice
) {
    
}

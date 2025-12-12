package com.inonu.stok_takip.dto.Response;

public class TicketSalesResponse {
     private Double unitPrice;
     private String ticketTypeName;
     private int totalSalesCount;
     private Double totalPrice;

     public TicketSalesResponse(String ticketTypeName,Double unitPrice, int totalSalesCount, Double totalPrice) {
         this.ticketTypeName = ticketTypeName;
         this.totalSalesCount = totalSalesCount;
         this.totalPrice = totalPrice;
         this.unitPrice = unitPrice;
     }

     public String getTicketTypeName() {
         return ticketTypeName;
     }

     public void setTicketTypeName(String ticketTypeName) {
         this.ticketTypeName = ticketTypeName;
     }

     public int getTotalSalesCount() {
         return totalSalesCount;
     }

     public void setTotalSalesCount(int totalSalesCount) {
         this.totalSalesCount = totalSalesCount;
     }

     public Double getTotalPrice() {
         return totalPrice;
     }

     public void setTotalPrice(Double totalPrice) {
         this.totalPrice = totalPrice;
     }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
}

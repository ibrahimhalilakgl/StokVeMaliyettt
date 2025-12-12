package com.inonu.stok_takip.Exception.TicketType;

public class TicketTypeNotFoundException extends RuntimeException{
    public TicketTypeNotFoundException(String message){
        super(message);
    }
}

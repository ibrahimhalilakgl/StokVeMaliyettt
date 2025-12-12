package com.inonu.stok_takip.Exception.MaterialEntry;

public class StockNotAvailableException extends RuntimeException{

    public StockNotAvailableException(String message){
        super(message);
    }
}

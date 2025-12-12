package com.inonu.stok_takip.Exception.MaterialExit;

public class InsufficientStockException extends RuntimeException{
    public InsufficientStockException(String message){
        super(message);
    }
}

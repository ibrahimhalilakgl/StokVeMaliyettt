package com.inonu.stok_takip.Exception.MaterialEntry;

public class ProductOutOfStockException extends RuntimeException{
    public ProductOutOfStockException(String message){
        super(message);
    }
}

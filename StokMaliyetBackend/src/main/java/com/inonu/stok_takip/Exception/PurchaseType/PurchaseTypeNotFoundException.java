package com.inonu.stok_takip.Exception.PurchaseType;

public class PurchaseTypeNotFoundException extends RuntimeException{
    public PurchaseTypeNotFoundException(String message){
        super(message);
    }
}

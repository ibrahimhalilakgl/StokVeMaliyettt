package com.inonu.stok_takip.Exception.PurchasedUnit;

public class PurchasedUnitNotFoundException extends RuntimeException{
    public PurchasedUnitNotFoundException(String message){
        super(message);
    }
}

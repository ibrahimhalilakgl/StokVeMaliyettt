package com.inonu.stok_takip.Exception.Tender;

public class TenderAlreadyIncreasedException extends RuntimeException{
    public TenderAlreadyIncreasedException(String message){
        super(message);
    }
}

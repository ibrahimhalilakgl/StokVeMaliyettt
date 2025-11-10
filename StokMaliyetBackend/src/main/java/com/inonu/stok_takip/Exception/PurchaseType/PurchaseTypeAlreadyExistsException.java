package com.inonu.stok_takip.Exception.PurchaseType;

public class PurchaseTypeAlreadyExistsException extends RuntimeException {
    public PurchaseTypeAlreadyExistsException(String message) {
        super(message);
    }
}

package com.inonu.stok_takip.Exception.PurchasedUnit;

public class PurchasedUnitAlreadyExistsException extends RuntimeException {
    public PurchasedUnitAlreadyExistsException(String message) {
        super(message);
    }
}

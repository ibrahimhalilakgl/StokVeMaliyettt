package com.inonu.stok_takip.Exception.MaterialDemand;

public class InsufficientProductException extends RuntimeException {
    public InsufficientProductException(String message) {
        super(message);
    }
}

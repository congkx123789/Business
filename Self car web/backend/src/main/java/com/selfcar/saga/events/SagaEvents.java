package com.selfcar.saga.events;

public final class SagaEvents {
    public record Base(String eventId, String correlationId, String orderId, String vin) {}

    public record OrderCreated(String eventId, String correlationId, String orderId, String vin) {}
    public record OrderCompleted(String eventId, String correlationId, String orderId) {}
    public record OrderCancelled(String eventId, String correlationId, String orderId, String reason) {}

    public record InventoryReserveRequested(String eventId, String correlationId, String orderId, String vin) {}
    public record InventoryReserved(String eventId, String correlationId, String orderId, String vin) {}
    public record InventoryReserveFailed(String eventId, String correlationId, String orderId, String vin, String reason) {}
    public record InventoryReleaseRequested(String eventId, String correlationId, String orderId, String vin) {}
    public record InventoryReleased(String eventId, String correlationId, String orderId, String vin) {}

    public record PaymentChargeRequested(String eventId, String correlationId, String orderId) {}
    public record PaymentSucceeded(String eventId, String correlationId, String orderId) {}
    public record PaymentFailed(String eventId, String correlationId, String orderId, String reason) {}
    public record PaymentRefundRequested(String eventId, String correlationId, String orderId) {}
    public record PaymentRefunded(String eventId, String correlationId, String orderId) {}
}



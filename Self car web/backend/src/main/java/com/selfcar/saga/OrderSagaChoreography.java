package com.selfcar.saga;

import com.selfcar.saga.events.SagaEvents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OrderSagaChoreography {
    private static final Logger log = LoggerFactory.getLogger(OrderSagaChoreography.class);

    private final SagaEventPublisher publisher;

    public OrderSagaChoreography(SagaEventPublisher publisher) {
        this.publisher = publisher;
    }

    // NOTE: In production, annotate Kafka listeners and map payloads; here we provide methods to be wired later
    public void onOrderCreated(SagaEvents.OrderCreated event) {
        log.info("saga.order_created orderId={} vin={}", event.orderId(), event.vin());
        publisher.publish("inventory-events",
                new SagaEvents.InventoryReserveRequested(event.eventId(), event.correlationId(), event.orderId(), event.vin()),
                event.orderId());
    }

    public void onInventoryReserved(SagaEvents.InventoryReserved event) {
        log.info("saga.inventory_reserved orderId={} vin={}", event.orderId(), event.vin());
        publisher.publish("payments-events",
                new SagaEvents.PaymentChargeRequested(event.eventId(), event.correlationId(), event.orderId()),
                event.orderId());
    }

    public void onInventoryReserveFailed(SagaEvents.InventoryReserveFailed event) {
        log.warn("saga.inventory_reserve_failed orderId={} reason={}", event.orderId(), event.reason());
        publisher.publish("orders-events",
                new SagaEvents.OrderCancelled(event.eventId(), event.correlationId(), event.orderId(), "inventory_unavailable"),
                event.orderId());
    }

    public void onPaymentSucceeded(SagaEvents.PaymentSucceeded event) {
        log.info("saga.payment_succeeded orderId={}", event.orderId());
        publisher.publish("orders-events",
                new SagaEvents.OrderCompleted(event.eventId(), event.correlationId(), event.orderId()),
                event.orderId());
    }

    public void onPaymentFailed(SagaEvents.PaymentFailed event, String vin) {
        log.warn("saga.payment_failed orderId={} reason={}", event.orderId(), event.reason());
        publisher.publish("inventory-events",
                new SagaEvents.InventoryReleaseRequested(event.eventId(), event.correlationId(), event.orderId(), vin),
                event.orderId());
        publisher.publish("orders-events",
                new SagaEvents.OrderCancelled(event.eventId(), event.correlationId(), event.orderId(), "payment_failed"),
                event.orderId());
    }
}



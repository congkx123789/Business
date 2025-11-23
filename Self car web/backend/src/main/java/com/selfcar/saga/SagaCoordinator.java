package com.selfcar.saga;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.saga.commands.Commands.ChargePaymentCommand;
import com.selfcar.saga.commands.Commands.ConfirmBookingCommand;
import com.selfcar.saga.commands.Commands.ReserveCarCommand;
import com.selfcar.saga.events.Events.BookingConfirmed;
import com.selfcar.saga.events.Events.CarReserved;
import com.selfcar.saga.events.Events.PaymentCharged;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SagaCoordinator {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${kafka.topic.saga.reserve:reserve-car}")
    private String topicReserve;

    @Value("${kafka.topic.saga.charge:charge-payment}")
    private String topicCharge;

    @Value("${kafka.topic.saga.confirm:confirm-booking}")
    private String topicConfirm;

    public String startSaga(Long listingId, Long userId, String transactionId, long amountMinor) {
        String sagaId = UUID.randomUUID().toString();
        send(topicReserve, sagaId, new ReserveCarCommand(sagaId, listingId, userId));
        return sagaId;
    }

    @KafkaListener(topics = "${kafka.topic.saga.events:booking-events}")
    public void onSagaEvent(String payload) {
        try {
            // naive router on payload content; in practice use headers or a type field
            if (payload.contains("CarReserved")) {
                CarReserved evt = objectMapper.readValue(payload, CarReserved.class);
                if (evt.isSuccess()) {
                    send(topicCharge, evt.getSagaId(), new ChargePaymentCommand(evt.getSagaId(), UUID.randomUUID().toString(), 0L));
                } else {
                    log.warn("Saga {}: reservation failed: {}", evt.getSagaId(), evt.getReason());
                }
            } else if (payload.contains("PaymentCharged")) {
                PaymentCharged evt = objectMapper.readValue(payload, PaymentCharged.class);
                if (evt.isSuccess()) {
                    send(topicConfirm, evt.getSagaId(), new ConfirmBookingCommand(evt.getSagaId(), 0L));
                } else {
                    log.warn("Saga {}: charge failed: {}", evt.getSagaId(), evt.getReason());
                }
            } else if (payload.contains("BookingConfirmed")) {
                BookingConfirmed evt = objectMapper.readValue(payload, BookingConfirmed.class);
                log.info("Saga {} finished success={} reason={} ", evt.getSagaId(), evt.isSuccess(), evt.getReason());
            }
        } catch (Exception e) {
            log.error("Saga event handling failed", e);
        }
    }

    private void send(String topic, String key, Object cmd) {
        try {
            kafkaTemplate.send(topic, key, objectMapper.writeValueAsString(cmd));
        } catch (Exception e) {
            log.error("Failed to send saga command {}", cmd.getClass().getSimpleName(), e);
        }
    }
}



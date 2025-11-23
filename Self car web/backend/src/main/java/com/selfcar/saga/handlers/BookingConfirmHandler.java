package com.selfcar.saga.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.selfcar.saga.commands.Commands.ConfirmBookingCommand;
import com.selfcar.saga.events.Events.BookingConfirmed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingConfirmHandler {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${kafka.topic.saga.events:booking-events}")
    private String eventsTopic;

    @KafkaListener(topics = "${kafka.topic.saga.confirm:confirm-booking}")
    public void onConfirm(String payload) {
        try {
            ConfirmBookingCommand cmd = mapper.readValue(payload, ConfirmBookingCommand.class);
            // TODO: persist booking; demo success
            BookingConfirmed evt = new BookingConfirmed(cmd.getSagaId(), cmd.getBookingId(), true, null);
            kafkaTemplate.send(eventsTopic, cmd.getSagaId(), mapper.writeValueAsString(evt));
        } catch (Exception e) {
            log.error("ConfirmBookingCommand failed", e);
        }
    }
}



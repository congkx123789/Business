package com.selfcar.events;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CarChangedEventTest {

	@Test
    @DisplayName("CarChangedEvent carries id and type")
	void event_publishable() {
		CarChangedEvent evt = new CarChangedEvent(5L, CarChangedEvent.ChangeType.DETAILS);
		assertThat(evt.getCarId()).isEqualTo(5L);
		assertThat(evt.getChangeType()).isEqualTo(CarChangedEvent.ChangeType.DETAILS);
	}
}



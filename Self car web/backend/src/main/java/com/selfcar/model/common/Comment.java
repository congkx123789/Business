package com.selfcar.model.common;

import com.selfcar.model.auth.User;
import com.selfcar.model.car.Car;
import com.selfcar.model.booking.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car; // optional target

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking; // optional target

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Comment parent; // for threads

    @Column(nullable = false, length = 2000)
    private String content;

    @Column
    private Integer rating; // optional 1-5

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}



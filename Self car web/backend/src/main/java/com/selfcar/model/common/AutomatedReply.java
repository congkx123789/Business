package com.selfcar.model.common;

import com.selfcar.model.shop.Shop;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "automated_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AutomatedReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop; // Shop-specific automated replies, null means platform-wide

    @NotBlank(message = "Trigger keyword is required")
    @Column(nullable = false, length = 100)
    private String triggerKeyword; // e.g., "price", "availability", "specs"

    @Column(name = "trigger_pattern", length = 200)
    private String triggerPattern; // Regex pattern for more complex matching

    @NotBlank(message = "Reply message is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String replyMessage;

    @Column(name = "reply_type")
    @Enumerated(EnumType.STRING)
    private ReplyType replyType = ReplyType.TEXT;

    @Column(name = "priority")
    private Integer priority = 0; // Higher priority replies are checked first

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "usage_count")
    private Long usageCount = 0L;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ReplyType {
        TEXT,
        TEMPLATE,  // Uses placeholders like {car_name}, {price}
        CARD       // Rich message with buttons/links
    }
}

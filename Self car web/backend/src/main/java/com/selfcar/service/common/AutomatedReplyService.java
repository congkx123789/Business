package com.selfcar.service.common;

import com.selfcar.model.common.AutomatedReply;
import com.selfcar.model.shop.Shop;
import com.selfcar.repository.common.AutomatedReplyRepository;
import com.selfcar.repository.shop.ShopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutomatedReplyService {

    private final AutomatedReplyRepository automatedReplyRepository;
    private final ShopRepository shopRepository;

    public List<AutomatedReply> getAllReplies() {
        return automatedReplyRepository.findAll();
    }

    @NonNull
    public AutomatedReply getReplyById(Long id) {
        Objects.requireNonNull(id, "Reply ID cannot be null");
        AutomatedReply reply = automatedReplyRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Automated reply not found with ID: {}", id);
                    return new RuntimeException("Automated reply not found with id: " + id);
                });
        return Objects.requireNonNull(reply, "Automated reply must not be null");
    }

    public List<AutomatedReply> getRepliesByShop(Long shopId) {
        Objects.requireNonNull(shopId, "Shop ID cannot be null");
        return automatedReplyRepository.findByShopIdAndActiveTrue(shopId);
    }

    public List<AutomatedReply> getActiveRepliesForShop(Long shopId) {
        Objects.requireNonNull(shopId, "Shop ID cannot be null");
        return automatedReplyRepository.findActiveRepliesForShop(shopId);
    }

    @Transactional
    public AutomatedReply createReply(AutomatedReply reply) {
        Objects.requireNonNull(reply, "Reply cannot be null");

        if (reply.getShop() != null && reply.getShop().getId() != null) {
            Long shopId = Objects.requireNonNull(reply.getShop().getId(), "Shop ID cannot be null");
            Shop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> {
                        log.warn("Shop not found with ID: {}", shopId);
                        return new RuntimeException("Shop not found");
                    });
            reply.setShop(shop);
        }

        AutomatedReply saved = automatedReplyRepository.save(reply);
        log.info("Automated reply created successfully with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public AutomatedReply updateReply(Long id, AutomatedReply replyDetails) {
        Objects.requireNonNull(replyDetails, "Reply details cannot be null");
        AutomatedReply reply = getReplyById(id);

        if (replyDetails.getTriggerKeyword() != null) {
            reply.setTriggerKeyword(replyDetails.getTriggerKeyword());
        }
        if (replyDetails.getTriggerPattern() != null) {
            reply.setTriggerPattern(replyDetails.getTriggerPattern());
        }
        if (replyDetails.getReplyMessage() != null) {
            reply.setReplyMessage(replyDetails.getReplyMessage());
        }
        if (replyDetails.getReplyType() != null) {
            reply.setReplyType(replyDetails.getReplyType());
        }
        if (replyDetails.getPriority() != null) {
            reply.setPriority(replyDetails.getPriority());
        }
        if (replyDetails.getActive() != null) {
            reply.setActive(replyDetails.getActive());
        }

        return automatedReplyRepository.save(reply);
    }

    @Transactional
    public void deleteReply(Long id) {
        Objects.requireNonNull(id, "Reply ID cannot be null");
        automatedReplyRepository.deleteById(id);
    }
}

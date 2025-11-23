package com.storysphere.storyreader.model

data class Subscription(
    val id: String,
    val userId: String,
    val planId: String,
    val planName: String,
    val planType: SubscriptionPlanType,
    val status: SubscriptionStatus,
    val startDate: Long,
    val endDate: Long? = null, // null for unlimited
    val autoRenew: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

enum class SubscriptionPlanType {
    ALL_YOU_CAN_READ,  // Netflix-style unlimited reading
    VIP_LOYALTY        // VIP levels with discounts
}

enum class SubscriptionStatus {
    ACTIVE,
    CANCELLED,
    EXPIRED,
    PENDING
}

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val type: SubscriptionPlanType,
    val price: Int, // Monthly price in points
    val features: List<String>,
    val duration: Int? = null // Duration in days, null for unlimited
)


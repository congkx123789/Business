package com.storysphere.storyreader.utils

object FormatUtils {
    fun formatNumber(number: Long): String {
        return when {
            number >= 1_000_000 -> "${number / 1_000_000.0}M"
            number >= 1_000 -> "${number / 1_000.0}K"
            else -> number.toString()
        }
    }
    
    fun formatReadingTime(minutes: Long): String {
        return when {
            minutes >= 60 -> "${minutes / 60}h ${minutes % 60}m"
            else -> "${minutes}m"
        }
    }
    
    fun formatWordCount(words: Long): String {
        return when {
            words >= 1_000_000 -> "${words / 1_000_000.0}M words"
            words >= 1_000 -> "${words / 1_000.0}K words"
            else -> "$words words"
        }
    }
    
    fun formatCurrency(amount: Int, currency: com.storysphere.storyreader.model.Currency): String {
        val currencySymbol = when (currency) {
            com.storysphere.storyreader.model.Currency.POINTS -> "pts"
            com.storysphere.storyreader.model.Currency.COINS -> "coins"
        }
        return "$amount $currencySymbol"
    }
}


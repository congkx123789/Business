package com.storysphere.storyreader.utils

object ValidationUtils {
    fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    fun isValidPassword(password: String): Boolean {
        // At least 8 characters, contains letter and number
        return password.length >= 8 &&
               password.any { it.isLetter() } &&
               password.any { it.isDigit() }
    }
    
    fun isValidUsername(username: String): Boolean {
        // 3-20 characters, alphanumeric and underscore
        return username.length in 3..20 &&
               username.all { it.isLetterOrDigit() || it == '_' }
    }
}


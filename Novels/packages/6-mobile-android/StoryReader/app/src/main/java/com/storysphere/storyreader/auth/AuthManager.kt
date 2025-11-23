package com.storysphere.storyreader.auth

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
    }
    
    private val KEY_USER_ID = "user_id"
    private val KEY_TOKEN = "auth_token"
    private val KEY_EMAIL = "user_email"
    private val KEY_USERNAME = "username"
    
    fun saveUser(userId: String, token: String, email: String, username: String) {
        prefs.edit().apply {
            putString(KEY_USER_ID, userId)
            putString(KEY_TOKEN, token)
            putString(KEY_EMAIL, email)
            putString(KEY_USERNAME, username)
            apply()
        }
    }
    
    fun getUserId(): String? {
        return prefs.getString(KEY_USER_ID, null)
    }
    
    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }
    
    fun getEmail(): String? {
        return prefs.getString(KEY_EMAIL, null)
    }
    
    fun getUsername(): String? {
        return prefs.getString(KEY_USERNAME, null)
    }
    
    fun isLoggedIn(): Boolean {
        return getUserId() != null && getToken() != null
    }
    
    fun logout() {
        prefs.edit().clear().apply()
    }
}


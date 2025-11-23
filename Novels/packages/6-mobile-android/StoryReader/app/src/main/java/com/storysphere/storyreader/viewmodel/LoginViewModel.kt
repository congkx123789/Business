package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.auth.AuthManager
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val graphQLService: GraphQLService,
    private val authManager: AuthManager
) : ViewModel() {
    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()
    
    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _isLoggedIn = MutableStateFlow(authManager.isLoggedIn())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()
    
    fun updateEmail(email: String) {
        _email.value = email
        _error.value = null
    }
    
    fun updatePassword(password: String) {
        _password.value = password
        _error.value = null
    }
    
    fun login() {
        viewModelScope.launch {
            if (_email.value.isBlank() || _password.value.isBlank()) {
                _error.value = "Please enter email and password"
                return@launch
            }
            
            _isLoading.value = true
            _error.value = null
            
            // TODO: Implement actual login via GraphQL
            // For now, simulate login
            try {
                // Simulate API call
                kotlinx.coroutines.delay(1000)
                
                // Mock login - replace with actual GraphQL call
                val mockUserId = "user_${System.currentTimeMillis()}"
                val mockToken = "mock_token_${System.currentTimeMillis()}"
                
                authManager.saveUser(
                    userId = mockUserId,
                    token = mockToken,
                    email = _email.value,
                    username = _email.value.split("@")[0]
                )
                
                _isLoggedIn.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Login failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun logout() {
        authManager.logout()
        _isLoggedIn.value = false
        _email.value = ""
        _password.value = ""
    }
}


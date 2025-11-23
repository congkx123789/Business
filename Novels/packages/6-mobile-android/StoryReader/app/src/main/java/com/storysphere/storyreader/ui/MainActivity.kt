package com.storysphere.storyreader.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.navigation.compose.rememberNavController
import com.storysphere.storyreader.auth.AuthManager
import com.storysphere.storyreader.navigation.NavGraph
import com.storysphere.storyreader.navigation.Screen
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject
    lateinit var authManager: AuthManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StoryReaderTheme {
                val navController = rememberNavController()
                val startDestination = if (authManager.isLoggedIn()) {
                    Screen.Library.route
                } else {
                    Screen.Login.route
                }
                
                NavGraph(
                    navController = navController,
                    startDestination = startDestination
                )
            }
        }
    }
}

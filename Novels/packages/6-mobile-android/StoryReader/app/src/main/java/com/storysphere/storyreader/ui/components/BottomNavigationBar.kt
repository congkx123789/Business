package com.storysphere.storyreader.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.storysphere.storyreader.navigation.Screen

@Composable
fun BottomNavigationBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    unreadNotificationCount: Int = 0,
    modifier: Modifier = Modifier
) {
    NavigationBar(modifier = modifier) {
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Home, contentDescription = "Library") },
            label = { Text("Library") },
            selected = currentRoute == Screen.Library.route,
            onClick = { onNavigate(Screen.Library.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Explore, contentDescription = "Discover") },
            label = { Text("Discover") },
            selected = currentRoute == Screen.Storefront.route,
            onClick = { onNavigate(Screen.Storefront.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.People, contentDescription = "Groups") },
            label = { Text("Groups") },
            selected = currentRoute == Screen.Groups.route,
            onClick = { onNavigate(Screen.Groups.route) }
        )
        NavigationBarItem(
            icon = {
                BadgedBox(badge = {
                    if (unreadNotificationCount > 0) {
                        Badge {
                            Text(
                                text = if (unreadNotificationCount > 99) "99+" else unreadNotificationCount.toString()
                            )
                        }
                    }
                }) {
                    Icon(Icons.Filled.Notifications, contentDescription = "Notifications")
                }
            },
            label = { Text("Notifications") },
            selected = currentRoute == Screen.Notifications.route,
            onClick = { onNavigate(Screen.Notifications.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Person, contentDescription = "Profile") },
            label = { Text("Profile") },
            selected = currentRoute == Screen.ReadingStats.route,
            onClick = { onNavigate(Screen.ReadingStats.route) }
        )
    }
}


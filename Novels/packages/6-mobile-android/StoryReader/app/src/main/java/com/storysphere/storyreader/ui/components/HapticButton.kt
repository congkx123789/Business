package com.storysphere.storyreader.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.Button
import androidx.compose.material3.IconButton
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.storysphere.storyreader.utils.mobile.haptics.HapticManager

/**
 * Haptic-enabled Button that provides haptic feedback on click
 */
@Composable
fun HapticButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    hapticManager: HapticManager? = null,
    hapticType: HapticType = HapticType.ACTION,
    content: @Composable () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    
    Button(
        onClick = {
            hapticManager?.let { manager ->
                when (hapticType) {
                    HapticType.ACTION -> manager.action()
                    HapticType.SELECTION -> manager.selection()
                    HapticType.SUCCESS -> manager.success()
                    HapticType.ERROR -> manager.error()
                }
            }
            onClick()
        },
        modifier = modifier,
        enabled = enabled,
        interactionSource = interactionSource
    ) {
        content()
    }
}

/**
 * Haptic-enabled IconButton
 */
@Composable
fun HapticIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    hapticManager: HapticManager? = null,
    hapticType: HapticType = HapticType.SELECTION,
    content: @Composable () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    
    IconButton(
        onClick = {
            hapticManager?.let { manager ->
                when (hapticType) {
                    HapticType.ACTION -> manager.action()
                    HapticType.SELECTION -> manager.selection()
                    HapticType.SUCCESS -> manager.success()
                    HapticType.ERROR -> manager.error()
                }
            }
            onClick()
        },
        modifier = modifier,
        enabled = enabled,
        interactionSource = interactionSource
    ) {
        content()
    }
}

/**
 * Haptic-enabled TextButton
 */
@Composable
fun HapticTextButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    hapticManager: HapticManager? = null,
    hapticType: HapticType = HapticType.SELECTION,
    content: @Composable () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    
    TextButton(
        onClick = {
            hapticManager?.let { manager ->
                when (hapticType) {
                    HapticType.ACTION -> manager.action()
                    HapticType.SELECTION -> manager.selection()
                    HapticType.SUCCESS -> manager.success()
                    HapticType.ERROR -> manager.error()
                }
            }
            onClick()
        },
        modifier = modifier,
        enabled = enabled,
        interactionSource = interactionSource
    ) {
        content()
    }
}

/**
 * Haptic-enabled clickable modifier
 */
fun Modifier.hapticClickable(
    hapticManager: HapticManager?,
    hapticType: HapticType = HapticType.SELECTION,
    onClick: () -> Unit
): Modifier {
    return this.clickable {
        hapticManager?.let { manager ->
            when (hapticType) {
                HapticType.ACTION -> manager.action()
                HapticType.SELECTION -> manager.selection()
                HapticType.SUCCESS -> manager.success()
                HapticType.ERROR -> manager.error()
            }
        }
        onClick()
    }
}

enum class HapticType {
    ACTION,
    SELECTION,
    SUCCESS,
    ERROR
}


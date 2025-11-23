package com.storysphere.storyreader.utils.mobile.haptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.annotation.RequiresApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HapticManager @Inject constructor(
    private val context: Context
) {
    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    fun vibrate(duration: Long = 50) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(duration)
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun vibratePattern(pattern: LongArray, repeat: Int = -1) {
        val vibrationEffect = VibrationEffect.createWaveform(pattern, repeat)
        vibrator?.vibrate(vibrationEffect)
    }

    fun pageTurn() {
        vibrate(30)
    }

    fun selection() {
        vibrate(20)
    }

    fun action() {
        vibrate(40)
    }

    fun error() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibratePattern(longArrayOf(0, 100, 50, 100), -1)
        } else {
            vibrate(100)
        }
    }

    fun success() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibratePattern(longArrayOf(0, 50, 30, 50), -1)
        } else {
            vibrate(50)
        }
    }

    fun cancel() {
        vibrator?.cancel()
    }
}


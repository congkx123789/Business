# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep data classes
-keep class com.storysphere.storyreader.model.** { *; }

# Keep Room entities
-keep class com.storysphere.storyreader.database.entity.** { *; }

# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }

# Keep Apollo generated classes
-keep class com.storysphere.storyreader.** { *; }

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Retrofit/OkHttp classes
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Keep WebSocket classes
-keep class io.socket.** { *; }

# Keep Room
-keep class androidx.room.** { *; }
-keep @androidx.room.Entity class * { *; }

# Keep Compose
-keep class androidx.compose.** { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}


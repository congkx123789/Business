package com.storysphere.storyreader.storage

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContentEncryptionService @Inject constructor(
    private val context: Context
) {
    private val keyStore: KeyStore by lazy {
        KeyStore.getInstance("AndroidKeyStore").apply {
            load(null)
        }
    }
    
    private val keyAlias = "StoryReaderContentKey"
    
    init {
        ensureKeyExists()
    }
    
    private fun ensureKeyExists() {
        if (!keyStore.containsAlias(keyAlias)) {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
            
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
        }
    }
    
    suspend fun encrypt(plaintext: String): ByteArray {
        return withContext(Dispatchers.IO) {
            try {
                val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
                val cipher = Cipher.getInstance("AES/GCM/NoPadding")
                cipher.init(Cipher.ENCRYPT_MODE, secretKey)
                
                val encryptedBytes = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
                val iv = cipher.iv
                
                // Prepend IV to encrypted data
                ByteArray(iv.size + encryptedBytes.size).apply {
                    System.arraycopy(iv, 0, this, 0, iv.size)
                    System.arraycopy(encryptedBytes, 0, this, iv.size, encryptedBytes.size)
                }
            } catch (e: Exception) {
                Log.e("ContentEncryptionService", "Error encrypting", e)
                throw e
            }
        }
    }
    
    suspend fun decrypt(encryptedData: ByteArray): String {
        return withContext(Dispatchers.IO) {
            try {
                val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
                val cipher = Cipher.getInstance("AES/GCM/NoPadding")
                
                // Extract IV (first 12 bytes for GCM)
                val iv = ByteArray(12)
                System.arraycopy(encryptedData, 0, iv, 0, 12)
                
                val encryptedBytes = ByteArray(encryptedData.size - 12)
                System.arraycopy(encryptedData, 12, encryptedBytes, 0, encryptedBytes.size)
                
                val spec = GCMParameterSpec(128, iv)
                cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
                
                val decryptedBytes = cipher.doFinal(encryptedBytes)
                String(decryptedBytes, Charsets.UTF_8)
            } catch (e: Exception) {
                Log.e("ContentEncryptionService", "Error decrypting", e)
                throw e
            }
        }
    }
}


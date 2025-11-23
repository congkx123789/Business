import Foundation
import Security

// Encryption Key Manager - Manages AES keys in iOS Keychain
class EncryptionKeyManager {
    static let shared = EncryptionKeyManager()
    
    private let keychainService = "com.truyenapp.encryption"
    private let keychainKey = "content-encryption-key"
    
    // Get or generate encryption key
    func getEncryptionKey() throws -> Data {
        // Try to retrieve from Keychain
        if let existingKey = try? retrieveKey() {
            return existingKey
        }
        
        // Generate new key if not found
        let newKey = generateKey()
        try storeKey(newKey)
        return newKey
    }
    
    private func generateKey() -> Data {
        var key = Data(count: 32) // AES-256 requires 32 bytes
        let result = key.withUnsafeMutableBytes { bytes in
            SecRandomCopyBytes(kSecRandomDefault, 32, bytes.baseAddress!)
        }
        guard result == errSecSuccess else {
            fatalError("Failed to generate encryption key")
        }
        return key
    }
    
    private func storeKey(_ key: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainKey,
            kSecValueData as String: key,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        // Delete existing key if any
        SecItemDelete(query as CFDictionary)
        
        // Add new key
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw EncryptionError.keychainError(status)
        }
    }
    
    private func retrieveKey() throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainKey,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let keyData = result as? Data else {
            throw EncryptionError.keyNotFound
        }
        
        return keyData
    }
    
    enum EncryptionError: Error {
        case keychainError(OSStatus)
        case keyNotFound
    }
}


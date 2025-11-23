import Foundation
import CryptoKit

// Content Encryption Service - Encrypts/decrypts chapter content files
class ContentEncryptionService {
    static let shared = ContentEncryptionService()
    
    private let keyManager = EncryptionKeyManager.shared
    
    // Encrypt content before saving to disk
    func encrypt(_ data: Data) throws -> Data {
        let key = try keyManager.getEncryptionKey()
        let symmetricKey = SymmetricKey(data: key)
        
        // Use AES-GCM for authenticated encryption
        let sealedBox = try AES.GCM.seal(data, using: symmetricKey)
        
        // Combine nonce + ciphertext + tag
        var encryptedData = Data()
        encryptedData.append(sealedBox.nonce.withUnsafeBytes { Data($0) })
        encryptedData.append(sealedBox.ciphertext)
        encryptedData.append(sealedBox.tag)
        
        return encryptedData
    }
    
    // Decrypt content when reading from disk
    func decrypt(_ encryptedData: Data) throws -> Data {
        let key = try keyManager.getEncryptionKey()
        let symmetricKey = SymmetricKey(data: key)
        
        // Extract nonce, ciphertext, and tag
        let nonceSize = 12 // AES-GCM nonce size
        let tagSize = 16 // AES-GCM tag size
        
        guard encryptedData.count > nonceSize + tagSize else {
            throw DecryptionError.invalidData
        }
        
        let nonceData = encryptedData.prefix(nonceSize)
        let tagData = encryptedData.suffix(tagSize)
        let ciphertextData = encryptedData.dropFirst(nonceSize).dropLast(tagSize)
        
        let nonce = try AES.GCM.Nonce(data: nonceData)
        let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertextData, tag: tagData)
        
        return try AES.GCM.open(sealedBox, using: symmetricKey)
    }
    
    enum DecryptionError: Error {
        case invalidData
        case decryptionFailed
    }
}


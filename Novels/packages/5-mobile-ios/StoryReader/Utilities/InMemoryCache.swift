import Foundation

/// Lightweight in-memory cache with TTL support.
/// Used to avoid re-fetching discovery/recommendation data that rarely changes.
final class InMemoryCache<Key: Hashable, Value> {
    private struct Entry {
        let value: Value
        let expirationDate: Date
        
        var isExpired: Bool {
            Date() >= expirationDate
        }
    }
    
    private let lock = NSLock()
    private var storage: [Key: Entry] = [:]
    private let expirationInterval: TimeInterval
    
    init(expirationInterval: TimeInterval) {
        self.expirationInterval = expirationInterval
    }
    
    func value(forKey key: Key) -> Value? {
        lock.lock()
        defer { lock.unlock() }
        
        guard let entry = storage[key] else { return nil }
        if entry.isExpired {
            storage.removeValue(forKey: key)
            return nil
        }
        return entry.value
    }
    
    func insert(_ value: Value, forKey key: Key) {
        lock.lock()
        defer { lock.unlock() }
        
        let entry = Entry(
            value: value,
            expirationDate: Date().addingTimeInterval(expirationInterval)
        )
        storage[key] = entry
    }
    
    func removeValue(forKey key: Key) {
        lock.lock()
        defer { lock.unlock() }
        storage.removeValue(forKey: key)
    }
    
    func removeAll() {
        lock.lock()
        defer { lock.unlock() }
        storage.removeAll()
    }
}



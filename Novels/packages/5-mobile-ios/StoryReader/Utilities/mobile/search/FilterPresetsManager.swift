import Foundation

/// Persists FilterQuery presets locally
final class FilterPresetsManager {
    private let key = "filterPresets"
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    struct Preset: Codable, Identifiable {
        let id: String
        let name: String
        let query: FilterQuery
        let createdAt: Date
    }
    
    func save(name: String, query: FilterQuery) {
        var presets = load()
        let preset = Preset(id: UUID().uuidString, name: name, query: query, createdAt: Date())
        presets.insert(preset, at: 0)
        if let data = try? encoder.encode(presets) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
    
    func load() -> [Preset] {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let presets = try? decoder.decode([Preset].self, from: data)
        else {
            return []
        }
        return presets
    }
    
    func delete(preset: Preset) {
        var presets = load()
        presets.removeAll { $0.id == preset.id }
        if let data = try? encoder.encode(presets) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}



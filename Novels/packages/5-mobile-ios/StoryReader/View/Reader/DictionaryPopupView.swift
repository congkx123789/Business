import SwiftUI

// Dictionary Popup View - Shows word definition
struct DictionaryPopupView: View {
    let entry: DictionaryEntry?
    let position: CGPoint
    @Binding var isPresented: Bool
    
    var body: some View {
        if let entry = entry {
            VStack(alignment: .leading, spacing: 12) {
                // Word and pronunciation
                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.word)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    if let pronunciation = entry.pronunciation {
                        Text("[\(pronunciation)]")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if let pinyin = entry.pinyin {
                        Text(pinyin)
                            .font(.subheadline)
                            .foregroundColor(.blue)
                    }
                }
                
                Divider()
                
                // Definitions
                ForEach(Array(entry.definitions.enumerated()), id: \.offset) { index, definition in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(definition.partOfSpeech)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.blue)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(4)
                        }
                        
                        Text(definition.meaning)
                            .font(.body)
                        
                        if let synonyms = definition.synonyms, !synonyms.isEmpty {
                            Text("Synonyms: \(synonyms.joined(separator: ", "))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                // Examples
                if let examples = entry.examples, !examples.isEmpty {
                    Divider()
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Examples")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)
                        
                        ForEach(examples, id: \.self) { example in
                            Text("• \(example)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // Close button
                Button(action: {
                    isPresented = false
                }) {
                    Text("Close")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
            }
            .padding()
            .frame(width: 300)
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 10)
            .position(position)
        }
    }
}


import Foundation
import Combine
import SwiftUI

// Annotation Templates ViewModel - Annotation templates
class AnnotationTemplatesViewModel: ObservableObject {
    @Published var templates: [AnnotationTemplate] = []
    @Published var selectedTemplate: AnnotationTemplate?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = AnnotationTemplatesRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct AnnotationTemplate {
        let id: String
        let name: String
        let format: AnnotationFormat
        let color: String?
        let tags: [String]
        let createdAt: Date
        let updatedAt: Date
    }
    
    struct AnnotationFormat {
        let fontFamily: String?
        let fontSize: Int?
        let textColor: String?
        let backgroundColor: String?
        let borderColor: String?
        let borderWidth: Double?
    }
    
    func loadTemplates(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getTemplates(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] templates in
                    self?.templates = templates
                }
            )
            .store(in: &cancellables)
    }
    
    func createTemplate(userId: String, name: String, format: AnnotationFormat, color: String?, tags: [String]) {
        repository.createTemplate(userId: userId, name: name, format: format, color: color, tags: tags)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload templates
                        self?.loadTemplates(userId: userId)
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func updateTemplate(userId: String, templateId: String, name: String?, format: AnnotationFormat?, color: String?, tags: [String]?) {
        repository.updateTemplate(userId: userId, templateId: templateId, name: name, format: format, color: color, tags: tags)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload templates
                        self?.loadTemplates(userId: userId)
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func deleteTemplate(userId: String, templateId: String) {
        repository.deleteTemplate(userId: userId, templateId: templateId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Remove from local array
                        self?.templates.removeAll { $0.id == templateId }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}



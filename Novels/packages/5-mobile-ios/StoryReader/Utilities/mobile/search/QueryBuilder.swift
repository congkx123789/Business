import Foundation

/// Builds NSPredicate / GraphQL filters from FilterQuery models
struct QueryBuilder {
    func predicate(from filter: FilterQuery) -> NSPredicate? {
        var predicates: [NSPredicate] = []
        if let authorId = filter.authorId {
            predicates.append(NSPredicate(format: "authorId == %@", authorId))
        }
        if let completion = filter.completionStatus {
            switch completion {
            case .completed:
                predicates.append(NSPredicate(format: "isCompleted == YES"))
            case .inProgress:
                predicates.append(NSPredicate(format: "isCompleted == NO && readingProgress > 0"))
            case .notStarted:
                predicates.append(NSPredicate(format: "readingProgress == 0"))
            }
        }
        guard !predicates.isEmpty else { return nil }
        return NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
    }
}



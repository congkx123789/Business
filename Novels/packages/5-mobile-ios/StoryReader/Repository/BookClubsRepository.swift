import Foundation
import Combine

final class BookClubsRepository {
    private let graphQLService = GraphQLService.shared
    
    func getSchedule(groupId: String) -> AnyPublisher<[BookClubScheduleItem], Error> {
        graphQLService.getBookClubSchedule(groupId: groupId)
    }
}


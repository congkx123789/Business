import Foundation

struct BookClubScheduleItem: Identifiable, Decodable {
    let id: String
    let chapterNumber: Int
    let deadline: Date
    let discussionDate: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case chapterNumber
        case deadline
        case discussionDate
    }
}


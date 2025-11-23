import Foundation
import Combine

/// GraphQL Service - strongly typed GraphQL client used by repositories.
/// Mobile apps talk to the gateway (1-gateway) exclusively through this service.
final class GraphQLService {
    static let shared = GraphQLService()
    
    private let baseURL: URL
    private var authToken: String?
    private let session: URLSession
    private let decoder: JSONDecoder
    
    init(
        baseURL: URL = URL(string: "http://localhost:3000/graphql")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
    }
    
    func setAuthToken(_ token: String) {
        authToken = token
    }
    
    // MARK: - Library
    
    func getLibrary() -> AnyPublisher<[LibraryItem], Error> {
        let query = """
        query Library {
          library {
            \(Self.libraryFields)
          }
        }
        """
        
        return execute(query: query, responseType: LibraryResponseEnvelope.self)
            .map(\.library)
            .eraseToAnyPublisher()
    }
    
    func addToLibrary(storyId: String) -> AnyPublisher<LibraryItem, Error> {
        let query = """
        mutation AddToLibrary($storyId: ID!) {
          addToLibrary(storyId: $storyId) {
            \(Self.libraryFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId],
            responseType: AddToLibraryResponseEnvelope.self
        )
            .map(\.addToLibrary)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Stories & Chapters
    
    func getStory(id: String) -> AnyPublisher<Story, Error> {
        let query = """
        query Story($id: ID!) {
          story(id: $id) {
            \(Self.storyFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["id": id],
            responseType: StoryResponseEnvelope.self
        )
            .map(\.story)
            .eraseToAnyPublisher()
    }
    
    func getChapter(storyId: String, chapterId: String) -> AnyPublisher<Chapter, Error> {
        let query = """
        query Chapter($storyId: ID!, $chapterId: ID!) {
          chapter(storyId: $storyId, chapterId: $chapterId) {
            \(Self.chapterFields(includeContent: true))
          }
        }
        """
        
        let variables: [String: Any] = [
            "storyId": storyId,
            "chapterId": chapterId
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: ChapterResponseEnvelope.self
        )
            .map(\.chapter)
            .eraseToAnyPublisher()
    }
    
    func getChapterDownloadURL(chapterId: String) -> AnyPublisher<URL, Error> {
        let query = """
        query ChapterDownloadUrl($chapterId: ID!) {
          chapterDownloadUrl(chapterId: $chapterId) {
            url
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["chapterId": chapterId],
            responseType: ChapterDownloadUrlEnvelope.self
        )
            .map { $0.chapterDownloadUrl.url }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Reading Progress
    
    func updateReadingProgress(_ progress: ReadingProgress) -> AnyPublisher<ReadingProgress, Error> {
        let query = """
        mutation UpdateReadingProgress($input: ReadingProgressInput!) {
          updateReadingProgress(input: $input) {
            \(Self.readingProgressFields)
          }
        }
        """
        
        let variables: [String: Any] = [
            "input": [
                "id": progress.id as Any,
                "storyId": progress.storyId,
                "chapterId": progress.chapterId,
                "position": progress.position,
                "completedAt": progress.completedAt?.iso8601String as Any
            ].compactMapValues { $0 }
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: ReadingProgressEnvelope.self
        )
            .map(\.updateReadingProgress)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Reading Preferences
    
    func getReadingPreferences() -> AnyPublisher<ReadingPreferences, Error> {
        let query = """
        query ReadingPreferences {
          readingPreferences {
            \(Self.readingPreferenceFields)
          }
        }
        """
        
        return execute(
            query: query,
            responseType: ReadingPreferencesEnvelope.self
        )
            .map(\.readingPreferences)
            .eraseToAnyPublisher()
    }
    
    func updateReadingPreferences(_ preferences: ReadingPreferences) -> AnyPublisher<ReadingPreferences, Error> {
        let query = """
        mutation UpdateReadingPreferences($input: ReadingPreferencesInput!) {
          updateReadingPreferences(input: $input) {
            \(Self.readingPreferenceFields)
          }
        }
        """
        
        let variables: [String: Any] = [
            "input": [
                "fontSize": preferences.fontSize,
                "lineHeight": preferences.lineHeight,
                "backgroundColor": preferences.backgroundColor,
                "textColor": preferences.textColor,
                "fontFamily": preferences.fontFamily,
                "readingMode": preferences.readingMode.rawValue,
                "brightness": preferences.brightness,
                "tapToToggleControls": preferences.tapToToggleControls,
                "autoHideControls": preferences.autoHideControls,
                "controlsTimeout": preferences.controlsTimeout
            ]
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: UpdateReadingPreferencesEnvelope.self
        )
            .map(\.updateReadingPreferences)
            .eraseToAnyPublisher()
    }

    // MARK: - Discovery & Recommendations
    
    func getRankings(
        rankingType: String,
        genre: String?,
        timeRange: String?
    ) -> AnyPublisher<[Story], Error> {
        let query = """
        query Rankings($input: RankingsInput!) {
          rankings(input: $input) {
            \(Self.storyFields)
          }
        }
        """
        
        var input: [String: Any] = ["type": rankingType]
        if let genre = genre { input["genre"] = genre }
        if let timeRange = timeRange { input["timeRange"] = timeRange }
        
        return execute(
            query: query,
            variables: ["input": input],
            responseType: RankingsEnvelope.self
        )
            .map(\.rankings)
            .eraseToAnyPublisher()
    }
    
    func getEditorPicks(limit: Int?, genre: String?) -> AnyPublisher<[Story], Error> {
        let query = """
        query EditorPicks($limit: Int, $genre: String) {
          editorPicks(limit: $limit, genre: $genre) {
            \(Self.storyFields)
          }
        }
        """
        
        var variables: [String: Any] = [:]
        if let limit = limit { variables["limit"] = limit }
        if let genre = genre { variables["genre"] = genre }
        
        return execute(
            query: query,
            variables: variables.isEmpty ? nil : variables,
            responseType: EditorPicksEnvelope.self
        )
            .map(\.editorPicks)
            .eraseToAnyPublisher()
    }
    
    func getGenreStories(genre: String?, page: Int?, limit: Int?) -> AnyPublisher<[Story], Error> {
        let query = """
        query GenreStories($genre: String, $page: Int, $limit: Int) {
          genreStories(genre: $genre, page: $page, limit: $limit) {
            \(Self.storyFields)
          }
        }
        """
        
        var variables: [String: Any] = [:]
        if let genre = genre { variables["genre"] = genre }
        if let page = page { variables["page"] = page }
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables.isEmpty ? nil : variables,
            responseType: GenreStoriesEnvelope.self
        )
            .map(\.genreStories)
            .eraseToAnyPublisher()
    }
    
    func getRecommendations(userId: String, limit: Int?) -> AnyPublisher<[Story], Error> {
        let query = """
        query Recommendations($userId: ID!, $limit: Int) {
          recommendations(userId: $userId, limit: $limit) {
            \(Self.storyFields)
          }
        }
        """
        
        var variables: [String: Any] = ["userId": userId]
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables,
            responseType: RecommendationsEnvelope.self
        )
            .map(\.recommendations)
            .eraseToAnyPublisher()
    }
    
    func getSimilarStories(storyId: String, limit: Int?) -> AnyPublisher<[Story], Error> {
        let query = """
        query SimilarStories($storyId: ID!, $limit: Int) {
          similarStories(storyId: $storyId, limit: $limit) {
            \(Self.storyFields)
          }
        }
        """
        
        var variables: [String: Any] = ["storyId": storyId]
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables,
            responseType: SimilarStoriesEnvelope.self
        )
            .map(\.similarStories)
            .eraseToAnyPublisher()
    }
    
    func trackUserBehavior(userId: String, storyId: String, action: String) -> AnyPublisher<Void, Error> {
        let query = """
        mutation TrackUserBehavior($input: UserBehaviorInput!) {
          trackUserBehavior(input: $input)
        }
        """
        
        let variables: [String: Any] = [
            "input": [
                "userId": userId,
                "storyId": storyId,
                "action": action
            ]
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: TrackUserBehaviorEnvelope.self
        )
            .tryMap { response in
                guard response.trackUserBehavior else {
                    throw GraphQLServiceError.invalidResponse
                }
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Chapter Comments (Meso)
    
    func getChapterComments(chapterId: String, sort: ChapterCommentSort) -> AnyPublisher<[ChapterComment], Error> {
        let query = """
        query ChapterComments($chapterId: ID!, $sort: ChapterCommentSort!) {
          chapterComments(chapterId: $chapterId, sort: $sort) {
            \(Self.chapterCommentFields)
            replies {
              \(Self.chapterCommentFields)
            }
          }
        }
        """
        
        let variables: [String: Any] = [
            "chapterId": chapterId,
            "sort": sort.rawValue
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: ChapterCommentsEnvelope.self
        )
        .map(\.chapterComments)
        .eraseToAnyPublisher()
    }
    
    func createChapterComment(input: ChapterCommentInput) -> AnyPublisher<ChapterComment, Error> {
        let query = """
        mutation CreateChapterComment($input: ChapterCommentInput!) {
          createChapterComment(input: $input) {
            \(Self.chapterCommentFields)
            replies {
              \(Self.chapterCommentFields)
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: CreateChapterCommentEnvelope.self
        )
        .map(\.createChapterComment)
        .eraseToAnyPublisher()
    }
    
    func replyToChapterComment(input: ChapterCommentReplyInput) -> AnyPublisher<ChapterComment, Error> {
        let query = """
        mutation ReplyToChapterComment($input: ChapterCommentReplyInput!) {
          replyToChapterComment(input: $input) {
            \(Self.chapterCommentFields)
            replies {
              \(Self.chapterCommentFields)
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: ReplyChapterCommentEnvelope.self
        )
        .map(\.replyToChapterComment)
        .eraseToAnyPublisher()
    }
    
    func voteChapterComment(commentId: String, vote: ChapterCommentVote) -> AnyPublisher<ChapterCommentVoteResult, Error> {
        let query = """
        mutation VoteChapterComment($commentId: ID!, $vote: ChapterCommentVote!) {
          voteChapterComment(commentId: $commentId, vote: $vote) {
            comment_id: commentId
            likes
            dislikes
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["commentId": commentId, "vote": vote.rawValue],
            responseType: VoteChapterCommentEnvelope.self
        )
        .map(\.voteChapterComment)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Reviews
    
    func getReviews(storyId: String, sort: ReviewSort) -> AnyPublisher<[Review], Error> {
        let query = """
        query Reviews($storyId: ID!, $sort: ReviewSort!) {
          reviews(storyId: $storyId, sort: $sort) {
            \(Self.reviewFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId, "sort": sort.rawValue],
            responseType: ReviewsEnvelope.self
        )
        .map(\.reviews)
        .eraseToAnyPublisher()
    }
    
    func createReview(input: ReviewInput) -> AnyPublisher<Review, Error> {
        let query = """
        mutation CreateReview($input: ReviewInput!) {
          createReview(input: $input) {
            \(Self.reviewFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: CreateReviewEnvelope.self
        )
        .map(\.createReview)
        .eraseToAnyPublisher()
    }
    
    func voteReviewHelpful(reviewId: String, helpful: Bool) -> AnyPublisher<ReviewHelpfulVoteResult, Error> {
        let query = """
        mutation VoteReviewHelpful($reviewId: ID!, $helpful: Boolean!) {
          voteReviewHelpful(reviewId: $reviewId, helpful: $helpful) {
            review_id: reviewId
            helpful_count: helpfulCount
            not_helpful_count: notHelpfulCount
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["reviewId": reviewId, "helpful": helpful],
            responseType: VoteReviewHelpfulEnvelope.self
        )
        .map(\.voteReviewHelpful)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Forums
    
    func getForumThreads(storyId: String, category: String?, page: Int?) -> AnyPublisher<[ForumThread], Error> {
        let query = """
        query ForumThreads($storyId: ID!, $category: String, $page: Int) {
          forumThreads(storyId: $storyId, category: $category, page: $page) {
            \(Self.forumThreadFields)
            posts {
              \(Self.forumPostFields)
            }
          }
        }
        """
        
        var variables: [String: Any] = ["storyId": storyId]
        if let category = category { variables["category"] = category }
        if let page = page { variables["page"] = page }
        
        return execute(
            query: query,
            variables: variables,
            responseType: ForumThreadsEnvelope.self
        )
        .map(\.forumThreads)
        .eraseToAnyPublisher()
    }
    
    func createForumThread(input: ForumThreadInput) -> AnyPublisher<ForumThread, Error> {
        let query = """
        mutation CreateForumThread($input: ForumThreadInput!) {
          createForumThread(input: $input) {
            \(Self.forumThreadFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: CreateForumThreadEnvelope.self
        )
        .map(\.createForumThread)
        .eraseToAnyPublisher()
    }
    
    func replyToForumThread(input: ForumPostInput) -> AnyPublisher<ForumPost, Error> {
        let query = """
        mutation ReplyForumThread($input: ForumPostInput!) {
          replyForumThread(input: $input) {
            \(Self.forumPostFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: ReplyForumThreadEnvelope.self
        )
        .map(\.replyForumThread)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Polls
    
    func getPolls(storyId: String) -> AnyPublisher<[Poll], Error> {
        let query = """
        query Polls($storyId: ID!) {
          polls(storyId: $storyId) {
            \(Self.pollFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId],
            responseType: PollsEnvelope.self
        )
        .map(\.polls)
        .eraseToAnyPublisher()
    }
    
    func votePoll(pollId: String, optionId: String) -> AnyPublisher<PollVoteResult, Error> {
        let query = """
        mutation VotePoll($pollId: ID!, $optionId: ID!) {
          votePoll(pollId: $pollId, optionId: $optionId) {
            poll_id: pollId
            option_id: optionId
            total_votes: totalVotes
            options {
              \(Self.pollOptionFields)
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["pollId": pollId, "optionId": optionId],
            responseType: VotePollEnvelope.self
        )
        .map(\.votePoll)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Quizzes
    
    func getQuizzes(storyId: String) -> AnyPublisher<[Quiz], Error> {
        let query = """
        query Quizzes($storyId: ID!) {
          quizzes(storyId: $storyId) {
            \(Self.quizFields)
            questions {
              \(Self.quizQuestionFields)
              options {
                \(Self.quizOptionFields)
              }
            }
            leaderboard {
              id
              user_id: userId
              username
              score
              rank
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId],
            responseType: QuizzesEnvelope.self
        )
        .map(\.quizzes)
        .eraseToAnyPublisher()
    }
    
    func submitQuiz(input: QuizSubmissionInput) -> AnyPublisher<QuizSubmissionResult, Error> {
        let query = """
        mutation SubmitQuiz($input: QuizSubmissionInput!) {
          submitQuiz(input: $input) {
            quiz_id: quizId
            score
            total_questions: totalQuestions
            correct_count: correctCount
            reward_earned: rewardEarned
            leaderboard_rank: leaderboardRank
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["input": input.variables],
            responseType: SubmitQuizEnvelope.self
        )
        .map(\.submitQuiz)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Votes & Fan Rankings
    
    func getVoteBalance() -> AnyPublisher<VoteBalance, Error> {
        let query = """
        query VoteBalance {
          voteBalance {
            available_votes: availableVotes
            bonus_votes: bonusVotes
            last_reset_at: lastResetAt
          }
        }
        """
        
        return execute(query: query, responseType: VoteBalanceEnvelope.self)
            .map(\.voteBalance)
            .eraseToAnyPublisher()
    }
    
    func castMonthlyVote(storyId: String, votes: Int) -> AnyPublisher<VoteBalance, Error> {
        let query = """
        mutation CastMonthlyVote($storyId: ID!, $votes: Int!) {
          castMonthlyVote(storyId: $storyId, votes: $votes) {
            available_votes: availableVotes
            bonus_votes: bonusVotes
            last_reset_at: lastResetAt
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId, "votes": votes],
            responseType: CastVoteEnvelope.self
        )
        .map(\.castMonthlyVote)
        .eraseToAnyPublisher()
    }
    
    func getVoteHistory(limit: Int? = nil) -> AnyPublisher<[VoteHistoryItem], Error> {
        let query = """
        query VoteHistory($limit: Int) {
          voteHistory(limit: $limit) {
            id
            story_id: storyId
            story_title: storyTitle
            votes
            created_at: createdAt
          }
        }
        """
        
        var variables: [String: Any] = [:]
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables.isEmpty ? nil : variables,
            responseType: VoteHistoryEnvelope.self
        )
        .map(\.voteHistory)
        .eraseToAnyPublisher()
    }
    
    func getFanRankings(storyId: String) -> AnyPublisher<FanRankingPage, Error> {
        let query = """
        query FanRankings($storyId: ID!) {
          fanRankings(storyId: $storyId) {
            entries {
              id
              user_id: userId
              username
              avatar_url: avatarUrl
              contribution
              rank
            }
            season
            updated_at: updatedAt
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId],
            responseType: FanRankingEnvelope.self
        )
        .map(\.fanRankings)
        .eraseToAnyPublisher()
    }
    
    func getAuthorSupportStats(authorId: String) -> AnyPublisher<AuthorSupportStats, Error> {
        let query = """
        query AuthorSupportStats($authorId: ID!) {
          authorSupportStats(authorId: $authorId) {
            author_id: authorId
            total_supporters: totalSupporters
            total_tips: totalTips
            total_votes: totalVotes
            growth_rate: growthRate
            supporter_breakdown: supporterBreakdown {
              id
              name
              percentage
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["authorId": authorId],
            responseType: AuthorSupportEnvelope.self
        )
        .map(\.authorSupportStats)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Paragraph Comments (Duanping)
    
    func getParagraphComments(chapterId: String, paragraphIndex: Int?) -> AnyPublisher<[ParagraphComment], Error> {
        let query = """
        query ParagraphComments($chapterId: ID!, $paragraphIndex: Int) {
          paragraphComments(chapterId: $chapterId, paragraphIndex: $paragraphIndex) {
            \(Self.paragraphCommentFields)
          }
        }
        """
        
        var variables: [String: Any] = ["chapterId": chapterId]
        if let paragraphIndex = paragraphIndex {
            variables["paragraphIndex"] = paragraphIndex
        }
        
        return execute(
            query: query,
            variables: variables,
            responseType: ParagraphCommentsEnvelope.self
        )
            .map(\.paragraphComments)
            .eraseToAnyPublisher()
    }
    
    func getParagraphCommentCounts(chapterId: String) -> AnyPublisher<[Int: Int], Error> {
        let query = """
        query ParagraphCommentCounts($chapterId: ID!) {
          paragraphCommentCounts(chapterId: $chapterId) {
            paragraph_index: paragraphIndex
            count
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["chapterId": chapterId],
            responseType: ParagraphCommentCountsEnvelope.self
        )
            .map { response in
                Dictionary(uniqueKeysWithValues: response.paragraphCommentCounts.map { ($0.paragraphIndex, $0.count) })
            }
            .eraseToAnyPublisher()
    }
    
    func createParagraphComment(
        chapterId: String,
        paragraphIndex: Int,
        content: String,
        reactionType: ReactionType?
    ) -> AnyPublisher<ParagraphComment, Error> {
        let query = """
        mutation CreateParagraphComment($input: ParagraphCommentInput!) {
          createParagraphComment(input: $input) {
            \(Self.paragraphCommentFields)
          }
        }
        """
        
        var input: [String: Any] = [
            "chapterId": chapterId,
            "paragraphIndex": paragraphIndex,
            "content": content
        ]
        if let reactionType = reactionType {
            input["reactionType"] = reactionType.rawValue
        }
        
        return execute(
            query: query,
            variables: ["input": input],
            responseType: CreateParagraphCommentEnvelope.self
        )
            .map(\.createParagraphComment)
            .eraseToAnyPublisher()
    }
    
    func likeParagraphComment(commentId: String) -> AnyPublisher<Void, Error> {
        let query = """
        mutation LikeParagraphComment($commentId: ID!) {
          likeParagraphComment(commentId: $commentId)
        }
        """
        
        return execute(
            query: query,
            variables: ["commentId": commentId],
            responseType: LikeParagraphCommentEnvelope.self
        )
            .tryMap { response in
                guard response.likeParagraphComment else {
                    throw GraphQLServiceError.invalidResponse
                }
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Notifications
    
    func getNotifications(userId: String) -> AnyPublisher<[Notification], Error> {
        let query = """
        query Notifications($userId: ID!) {
          notifications(userId: $userId) {
            id
            user_id: userId
            type
            title
            body
            data
            is_read: isRead
            read_at: readAt
            created_at: createdAt
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["userId": userId],
            responseType: NotificationsEnvelope.self
        )
        .map(\.notifications)
        .eraseToAnyPublisher()
    }
    
    func markNotificationAsRead(notificationId: String, userId: String) -> AnyPublisher<Void, Error> {
        let query = """
        mutation MarkNotificationAsRead($notificationId: ID!, $userId: ID!) {
          markNotificationAsRead(notificationId: $notificationId, userId: $userId)
        }
        """
        
        return execute(
            query: query,
            variables: ["notificationId": notificationId, "userId": userId],
            responseType: MarkNotificationAsReadEnvelope.self
        )
        .tryMap { response in
            guard response.markNotificationAsRead else {
                throw GraphQLServiceError.invalidResponse
            }
        }
        .eraseToAnyPublisher()
    }
    
    func markAllNotificationsAsRead(userId: String) -> AnyPublisher<Void, Error> {
        let query = """
        mutation MarkAllNotificationsAsRead($userId: ID!) {
          markAllNotificationsAsRead(userId: $userId)
        }
        """
        
        return execute(
            query: query,
            variables: ["userId": userId],
            responseType: MarkAllNotificationsAsReadEnvelope.self
        )
        .tryMap { response in
            guard response.markAllNotificationsAsRead else {
                throw GraphQLServiceError.invalidResponse
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateNotificationSettings(settings: NotificationSettings) -> AnyPublisher<Void, Error> {
        let query = """
        mutation UpdateNotificationSettings($settings: NotificationSettingsInput!) {
          updateNotificationSettings(settings: $settings)
        }
        """
        
        let input: [String: Any] = [
            "pushEnabled": settings.pushEnabled,
            "emailEnabled": settings.emailEnabled,
            "communityAlerts": settings.communityAlerts,
            "monetizationAlerts": settings.monetizationAlerts
        ]
        
        return execute(
            query: query,
            variables: ["settings": input],
            responseType: UpdateNotificationSettingsEnvelope.self
        )
        .tryMap { response in
            guard response.updateNotificationSettings else {
                throw GraphQLServiceError.invalidResponse
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Wallet & Monetization
    
    func getWalletBalance() -> AnyPublisher<Wallet, Error> {
        let query = """
        query Wallet {
          wallet {
            balance
            currency
            updated_at: updatedAt
          }
        }
        """
        
        return execute(
            query: query,
            responseType: WalletEnvelope.self
        )
            .map(\.wallet)
            .eraseToAnyPublisher()
    }
    
    func topUpWallet(amount: Int, paymentMethod: String) -> AnyPublisher<Transaction, Error> {
        let query = """
        mutation TopUpWallet($amount: Int!, $method: String!) {
          topUpWallet(amount: $amount, paymentMethod: $method) {
            \(Self.transactionFields)
          }
        }
        """
        
        let variables: [String: Any] = [
            "amount": amount,
            "method": paymentMethod
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: TopUpWalletEnvelope.self
        )
            .map(\.topUpWallet)
            .eraseToAnyPublisher()
    }
    
    func purchaseChapter(chapterId: String) -> AnyPublisher<Transaction, Error> {
        let query = """
        mutation PurchaseChapter($chapterId: ID!) {
          purchaseChapter(chapterId: $chapterId) {
            \(Self.transactionFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["chapterId": chapterId],
            responseType: PurchaseChapterEnvelope.self
        )
            .map(\.purchaseChapter)
            .eraseToAnyPublisher()
    }

    // MARK: - Tipping (Fan Economy)
    
    func createTip(storyId: String, amount: Int, message: String?) -> AnyPublisher<Tip, Error> {
        let query = """
        mutation CreateTip($input: TipInput!) {
          createTip(input: $input) {
            \(Self.tipFields)
          }
        }
        """
        
        var input: [String: Any] = [
            "storyId": storyId,
            "amount": amount
        ]
        if let message = message, !message.isEmpty {
            input["message"] = message
        }
        
        return execute(
            query: query,
            variables: ["input": input],
            responseType: CreateTipEnvelope.self
        )
        .map(\.createTip)
        .eraseToAnyPublisher()
    }
    
    func getTippingHistory(storyId: String, limit: Int? = nil) -> AnyPublisher<[Tip], Error> {
        let query = """
        query TippingHistory($storyId: ID!, $limit: Int) {
          tippingHistory(storyId: $storyId, limit: $limit) {
            \(Self.tipFields)
          }
        }
        """
        
        var variables: [String: Any] = ["storyId": storyId]
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables,
            responseType: TippingHistoryEnvelope.self
        )
        .map(\.tippingHistory)
        .eraseToAnyPublisher()
    }
    
    func getTippingStats(storyId: String) -> AnyPublisher<TipStats, Error> {
        let query = """
        query TippingStats($storyId: ID!) {
          tippingStats(storyId: $storyId) {
            total_tips: totalTips
            total_amount: totalAmount
            top_supporters: topSupporters {
              id
              username
              amount
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["storyId": storyId],
            responseType: TippingStatsEnvelope.self
        )
        .map(\.tippingStats)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Book Clubs & Social Challenges
    
    func getBookClubSchedule(groupId: String) -> AnyPublisher<[BookClubScheduleItem], Error> {
        let query = """
        query BookClubSchedule($groupId: ID!) {
          bookClubSchedule(groupId: $groupId) {
            \(Self.bookClubScheduleFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["groupId": groupId],
            responseType: BookClubScheduleEnvelope.self
        )
        .map(\.bookClubSchedule)
        .eraseToAnyPublisher()
    }
    
    func getChallengeProgress(challengeId: String) -> AnyPublisher<ChallengeProgressPayload, Error> {
        let query = """
        query ChallengeProgress($challengeId: ID!) {
          challengeProgress(challengeId: $challengeId) {
            challenge {
              \(Self.readingChallengeFields)
            }
            participants {
              \(Self.challengeParticipantFields)
            }
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["challengeId": challengeId],
            responseType: ChallengeProgressEnvelope.self
        )
        .map(\.challengeProgress)
        .eraseToAnyPublisher()
    }
    
    func getFriendChallengeProgress(challengeId: String) -> AnyPublisher<[ChallengeParticipant], Error> {
        let query = """
        query FriendChallengeProgress($challengeId: ID!) {
          friendChallengeProgress(challengeId: $challengeId) {
            \(Self.challengeParticipantFields)
          }
        }
        """
        
        return execute(
            query: query,
            variables: ["challengeId": challengeId],
            responseType: FriendChallengeProgressEnvelope.self
        )
        .map(\.friendChallengeProgress)
        .eraseToAnyPublisher()
    }
    
    func updateReadingChallengeProgress(
        challengeId: String,
        progress: Int
    ) -> AnyPublisher<Bool, Error> {
        let query = """
        mutation UpdateReadingChallengeProgress($challengeId: ID!, $progress: Int!) {
          updateReadingChallengeProgress(challengeId: $challengeId, progress: $progress)
        }
        """
        
        return execute(
            query: query,
            variables: [
                "challengeId": challengeId,
                "progress": progress
            ],
            responseType: UpdateChallengeProgressEnvelope.self
        )
        .map(\.updateReadingChallengeProgress)
        .eraseToAnyPublisher()
    }
    
    func setReadingGoal(
        goalType: String,
        target: Int,
        timeRange: String,
        startDate: String,
        endDate: String
    ) -> AnyPublisher<ReadingGoal, Error> {
        let query = """
        mutation SetReadingGoal($goalType: String!, $target: Int!, $timeRange: String!, $startDate: String!, $endDate: String!) {
          setReadingGoal(
            goalType: $goalType,
            target: $target,
            timeRange: $timeRange,
            startDate: $startDate,
            endDate: $endDate
          ) {
            goal {
              \(Self.readingGoalFields)
            }
          }
        }
        """
        
        let variables: [String: Any] = [
            "goalType": goalType,
            "target": target,
            "timeRange": timeRange,
            "startDate": startDate,
            "endDate": endDate
        ]
        
        return execute(
            query: query,
            variables: variables,
            responseType: SetReadingGoalEnvelope.self
        )
        .map(\.setReadingGoal.goal)
        .eraseToAnyPublisher()
    }
    
    func getActivityFeed(page: Int? = nil, limit: Int? = nil) -> AnyPublisher<ActivityFeedPage, Error> {
        let query = """
        query ActivityFeed($page: Int, $limit: Int) {
          activityFeed(page: $page, limit: $limit) {
            items {
              \(Self.activityFeedItemFields)
            }
            total
            page
            limit
          }
        }
        """
        
        var variables: [String: Any] = [:]
        if let page = page { variables["page"] = page }
        if let limit = limit { variables["limit"] = limit }
        
        return execute(
            query: query,
            variables: variables.isEmpty ? nil : variables,
            responseType: ActivityFeedEnvelope.self
        )
        .map(\.activityFeed)
        .eraseToAnyPublisher()
    }
    
    func getReadingStatistics() -> AnyPublisher<ReadingStatistics, Error> {
        let query = """
        query ReadingStatistics {
          readingStatistics {
            activityCounts {
              activityType
              count
            }
            activeGoals {
              \(Self.readingGoalFields)
            }
          }
        }
        """
        
        return execute(
            query: query,
            responseType: ReadingStatisticsEnvelope.self
        )
        .map(\.readingStatistics)
        .eraseToAnyPublisher()
    }
    
    // MARK: - Execute helper
    
    private func execute<ResponseData: Decodable>(
        query: String,
        variables: [String: Any]? = nil,
        responseType: ResponseData.Type
    ) -> AnyPublisher<ResponseData, Error> {
        do {
            var request = URLRequest(url: baseURL)
            request.httpMethod = "POST"
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.addValue("application/json", forHTTPHeaderField: "Accept")
            if let token = authToken {
                request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
            
            var body: [String: Any] = ["query": query]
            if let variables = variables {
                body["variables"] = variables
            }
            request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
            
            return session.dataTaskPublisher(for: request)
                .tryMap { [decoder] data, response in
                    guard let httpResponse = response as? HTTPURLResponse,
                          200..<300 ~= httpResponse.statusCode else {
                        throw GraphQLServiceError.networkError
                    }
                    
                    let envelope = try decoder.decode(GraphQLResponse<ResponseData>.self, from: data)
                    
                    if let errors = envelope.errors, !errors.isEmpty {
                        let message = errors.map(\.message).joined(separator: "\n")
                        throw GraphQLServiceError.graphQLErrors(message)
                    }
                    
                    guard let data = envelope.data else {
                        throw GraphQLServiceError.missingData
                    }
                    
                    return data
                }
                .eraseToAnyPublisher()
        } catch {
            return Fail(error: error).eraseToAnyPublisher()
        }
    }
    
    // MARK: - GraphQL helpers
    
    private static let libraryFields = """
    id
    story_id: storyId
    user_id: userId
    added_at: addedAt
    last_read_at: lastReadAt
    reading_progress: readingProgress
    is_completed: isCompleted
    tags
    bookshelf_ids: bookshelfIds
    synced_at: syncedAt
    sync_status: syncStatus
    """
    
    private static let storyFields = """
    id
    title
    author
    description
    cover_image: coverImage
    genre_id: genreId
    genre
    status
    total_chapters: totalChapters
    created_at: createdAt
    updated_at: updatedAt
    """
    
    private static func chapterFields(includeContent: Bool) -> String {
        """
        id
        story_id: storyId
        title
        \(includeContent ? "content" : "")
        index
        word_count: wordCount
        is_locked: isLocked
        price
        created_at: createdAt
        updated_at: updatedAt
        """
    }
    
    private static let readingPreferenceFields = """
    font_size: fontSize
    line_height: lineHeight
    background_color: backgroundColor
    text_color: textColor
    font_family: fontFamily
    reading_mode: readingMode
    brightness
    tap_to_toggle_controls: tapToToggleControls
    auto_hide_controls: autoHideControls
    controls_timeout: controlsTimeout
    synced_at: syncedAt
    """
    
    private static let paragraphCommentFields = """
    id
    chapter_id: chapterId
    paragraph_index: paragraphIndex
    content
    author {
      id
      username
      avatar_url: avatarUrl
    }
    reaction_type: reactionType
    likes
    created_at: createdAt
    is_author: isAuthor
    replies {
      id
      chapter_id: chapterId
      paragraph_index: paragraphIndex
      content
      author {
        id
        username
        avatar_url: avatarUrl
      }
      reaction_type: reactionType
      likes
      created_at: createdAt
      is_author: isAuthor
    }
    """
    
    private static let readingProgressFields = """
    id
    user_id: userId
    story_id: storyId
    chapter_id: chapterId
    position
    completed_at: completedAt
    synced_at: syncedAt
    sync_status: syncStatus
    """
    
    private static let transactionFields = """
    id
    type
    amount
    description
    created_at: createdAt
    """
    
    private static let bookClubScheduleFields = """
    id
    chapterNumber
    deadline
    discussionDate
    """
    
    private static let readingChallengeFields = """
    id
    name
    description
    challengeType
    goal
    goalType
    timeRange
    startDate
    endDate
    progress
    status
    isPublic
    """
    
    private static let challengeParticipantFields = """
    userId
    progress
    joinedAt
    updatedAt
    """
    
    private static let readingGoalFields = """
    id
    goalType
    target
    current
    timeRange
    startDate
    endDate
    status
    """
    
    private static let activityFeedItemFields = """
    id
    activityType
    timestamp
    storyId
    chapterId
    metadata
    """
    
    private static let chapterCommentFields = """
    id
    chapter_id: chapterId
    story_id: storyId
    content
    author {
      id
      username
      avatar_url: avatarUrl
    }
    likes
    dislikes
    is_author: isAuthor
    created_at: createdAt
    updated_at: updatedAt
    """
    
    private static let reviewFields = """
    id
    story_id: storyId
    user_id: userId
    rating
    ratings {
      plot
      characters
      worldBuilding
      pacing
      writingStyle
    }
    title
    content
    helpful_count: helpfulCount
    not_helpful_count: notHelpfulCount
    is_featured: isFeatured
    created_at: createdAt
    updated_at: updatedAt
    author {
      id
      username
      avatar_url: avatarUrl
    }
    """
    
    private static let forumThreadFields = """
    id
    story_id: storyId
    title
    category
    author {
      id
      username
      avatar_url: avatarUrl
    }
    is_pinned: isPinned
    is_locked: isLocked
    replies_count: repliesCount
    last_activity_at: lastActivityAt
    created_at: createdAt
    """
    
    private static let forumPostFields = """
    id
    thread_id: threadId
    content
    author {
      id
      username
      avatar_url: avatarUrl
    }
    created_at: createdAt
    """
    
    private static let pollFields = """
    id
    story_id: storyId
    question
    total_votes: totalVotes
    expires_at: expiresAt
    user_vote_option_id: userVoteOptionId
    options {
      \(Self.pollOptionFields)
    }
    """
    
    private static let pollOptionFields = """
    id
    text
    vote_count: voteCount
    percentage
    """
    
    private static let quizFields = """
    id
    story_id: storyId
    title
    description
    reward
    duration_seconds: durationSeconds
    """
    
    private static let quizQuestionFields = """
    id
    prompt
    explanation
    """
    
    private static let quizOptionFields = """
    id
    text
    """
    
    private static let tipFields = """
    id
    story_id: storyId
    author_id: authorId
    user_id: userId
    username
    amount
    message
    created_at: createdAt
    """
}

// MARK: - Support types

private struct GraphQLResponse<Data: Decodable>: Decodable {
    let data: Data?
    let errors: [GraphQLError]?
}

private struct GraphQLError: Decodable {
    let message: String
}

private struct LibraryResponseEnvelope: Decodable {
    let library: [LibraryItem]
}

private struct AddToLibraryResponseEnvelope: Decodable {
    let addToLibrary: LibraryItem
}

private struct StoryResponseEnvelope: Decodable {
    let story: Story
}

private struct ChapterResponseEnvelope: Decodable {
    let chapter: Chapter
}

private struct ChapterDownloadUrlEnvelope: Decodable {
    struct DownloadURL: Decodable {
        let url: URL
    }
    let chapterDownloadUrl: DownloadURL
}

private struct ReadingProgressEnvelope: Decodable {
    let updateReadingProgress: ReadingProgress
}

private struct ReadingPreferencesEnvelope: Decodable {
    let readingPreferences: ReadingPreferences
}

private struct UpdateReadingPreferencesEnvelope: Decodable {
    let updateReadingPreferences: ReadingPreferences
}

private struct ParagraphCommentsEnvelope: Decodable {
    let paragraphComments: [ParagraphComment]
}

private struct ParagraphCommentCountsEnvelope: Decodable {
    struct CountDTO: Decodable {
        let paragraphIndex: Int
        let count: Int
        
        enum CodingKeys: String, CodingKey {
            case paragraphIndex = "paragraph_index"
            case count
        }
    }
    
    let paragraphCommentCounts: [CountDTO]
}

private struct CreateParagraphCommentEnvelope: Decodable {
    let createParagraphComment: ParagraphComment
}

private struct LikeParagraphCommentEnvelope: Decodable {
    let likeParagraphComment: Bool
}

private struct WalletEnvelope: Decodable {
    let wallet: Wallet
}

private struct TopUpWalletEnvelope: Decodable {
    let topUpWallet: Transaction
}

private struct PurchaseChapterEnvelope: Decodable {
    let purchaseChapter: Transaction
}

private struct RankingsEnvelope: Decodable {
    let rankings: [Story]
}

private struct EditorPicksEnvelope: Decodable {
    let editorPicks: [Story]
}

private struct GenreStoriesEnvelope: Decodable {
    let genreStories: [Story]
}

private struct RecommendationsEnvelope: Decodable {
    let recommendations: [Story]
}

private struct SimilarStoriesEnvelope: Decodable {
    let similarStories: [Story]
}

private struct TrackUserBehaviorEnvelope: Decodable {
    let trackUserBehavior: Bool
}

private struct ChapterCommentsEnvelope: Decodable {
    let chapterComments: [ChapterComment]
}

private struct CreateChapterCommentEnvelope: Decodable {
    let createChapterComment: ChapterComment
}

private struct ReplyChapterCommentEnvelope: Decodable {
    let replyToChapterComment: ChapterComment
}

private struct VoteChapterCommentEnvelope: Decodable {
    let voteChapterComment: ChapterCommentVoteResult
}

private struct ReviewsEnvelope: Decodable {
    let reviews: [Review]
}

private struct CreateReviewEnvelope: Decodable {
    let createReview: Review
}

private struct VoteReviewHelpfulEnvelope: Decodable {
    let voteReviewHelpful: ReviewHelpfulVoteResult
}

private struct ForumThreadsEnvelope: Decodable {
    let forumThreads: [ForumThread]
}

private struct CreateForumThreadEnvelope: Decodable {
    let createForumThread: ForumThread
}

private struct ReplyForumThreadEnvelope: Decodable {
    let replyForumThread: ForumPost
}

private struct PollsEnvelope: Decodable {
    let polls: [Poll]
}

private struct VotePollEnvelope: Decodable {
    let votePoll: PollVoteResult
}

private struct QuizzesEnvelope: Decodable {
    let quizzes: [Quiz]
}

private struct SubmitQuizEnvelope: Decodable {
    let submitQuiz: QuizSubmissionResult
}

private struct CreateTipEnvelope: Decodable {
    let createTip: Tip
}

private struct TippingHistoryEnvelope: Decodable {
    let tippingHistory: [Tip]
}

private struct TippingStatsEnvelope: Decodable {
    let tippingStats: TipStats
}

private struct VoteBalanceEnvelope: Decodable {
    let voteBalance: VoteBalance
}

private struct CastVoteEnvelope: Decodable {
    let castMonthlyVote: VoteBalance
}

private struct VoteHistoryEnvelope: Decodable {
    let voteHistory: [VoteHistoryItem]
}

private struct FanRankingEnvelope: Decodable {
    let fanRankings: FanRankingPage
}

private struct AuthorSupportEnvelope: Decodable {
    let authorSupportStats: AuthorSupportStats
}

private struct BookClubScheduleEnvelope: Decodable {
    let bookClubSchedule: [BookClubScheduleItem]
}

private struct ChallengeProgressEnvelope: Decodable {
    let challengeProgress: ChallengeProgressPayload
}

private struct FriendChallengeProgressEnvelope: Decodable {
    let friendChallengeProgress: [ChallengeParticipant]
}

private struct UpdateChallengeProgressEnvelope: Decodable {
    let updateReadingChallengeProgress: Bool
}

private struct SetReadingGoalEnvelope: Decodable {
    struct GoalWrapper: Decodable {
        let goal: ReadingGoal
    }
    let setReadingGoal: GoalWrapper
}

private struct ActivityFeedEnvelope: Decodable {
    let activityFeed: ActivityFeedPage
}

private struct ReadingStatisticsEnvelope: Decodable {
    let readingStatistics: ReadingStatistics
}

private struct NotificationsEnvelope: Decodable {
    let notifications: [Notification]
}

private struct MarkNotificationAsReadEnvelope: Decodable {
    let markNotificationAsRead: Bool
}

private struct MarkAllNotificationsAsReadEnvelope: Decodable {
    let markAllNotificationsAsRead: Bool
}

private struct UpdateNotificationSettingsEnvelope: Decodable {
    let updateNotificationSettings: Bool
}

private extension Date {
    var iso8601String: String {
        ISO8601DateFormatter().string(from: self)
    }
}

enum GraphQLServiceError: Error {
    case networkError
    case missingData
    case invalidResponse
    case graphQLErrors(String)
}


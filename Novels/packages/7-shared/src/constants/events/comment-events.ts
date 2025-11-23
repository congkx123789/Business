// Comment Events

export const COMMENT_EVENTS = {
  COMMENT_CREATED: "comment.created",
  COMMENT_UPDATED: "comment.updated",
  COMMENT_DELETED: "comment.deleted",
  COMMENT_REPLIED: "comment.replied",
  
  // Paragraph Comments (Duanping)
  PARAGRAPH_COMMENT_CREATED: "comment.paragraph.created",
  PARAGRAPH_COMMENT_LIKED: "comment.paragraph.liked",
  PARAGRAPH_COMMENT_REPLIED: "comment.paragraph.replied",
  PARAGRAPH_COMMENT_COUNT_UPDATED: "comment.paragraph.count.updated",
  
  // Chapter Comments
  CHAPTER_COMMENT_CREATED: "comment.chapter.created",
  CHAPTER_COMMENT_REPLIED: "comment.chapter.replied",
  REVIEW_REPLIED: "review.replied",
  QUIZ_CREATED: "quiz.created",
  QUIZ_SUBMITTED: "quiz.submitted",
  RATING_UPDATED: "rating.updated",
} as const;


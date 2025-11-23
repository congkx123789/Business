"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_STATUS = exports.STORED_PROCEDURES = exports.USER_ROLES = exports.EVENT_BUS_TOPICS = void 0;
exports.EVENT_BUS_TOPICS = {
    USER_CREATED: "user.created",
    USER_UPDATED: "user.updated",
    USER_DELETED: "user.deleted",
    STORY_CREATED: "story.created",
    STORY_UPDATED: "story.updated",
    STORY_DELETED: "story.deleted",
    CHAPTER_CREATED: "chapter.created",
    CHAPTER_UPDATED: "chapter.updated",
    COMMENT_CREATED: "comment.created",
    COMMENT_UPDATED: "comment.updated",
    COMMENT_DELETED: "comment.deleted",
    NOTIFICATION_CREATED: "notification.created",
};
exports.USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
    MODERATOR: "moderator",
};
exports.STORED_PROCEDURES = {
    auth: {
        login: "spUsers_GetByEmail",
        register: "spUsers_Create",
    },
    books: {
        list: "spBooks_List",
        detail: "spBooks_GetDetail",
    },
};
exports.API_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
};
//# sourceMappingURL=index.js.map
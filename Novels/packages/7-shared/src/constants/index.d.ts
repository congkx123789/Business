export declare const EVENT_BUS_TOPICS: {
    readonly USER_CREATED: "user.created";
    readonly USER_UPDATED: "user.updated";
    readonly USER_DELETED: "user.deleted";
    readonly STORY_CREATED: "story.created";
    readonly STORY_UPDATED: "story.updated";
    readonly STORY_DELETED: "story.deleted";
    readonly CHAPTER_CREATED: "chapter.created";
    readonly CHAPTER_UPDATED: "chapter.updated";
    readonly COMMENT_CREATED: "comment.created";
    readonly COMMENT_UPDATED: "comment.updated";
    readonly COMMENT_DELETED: "comment.deleted";
    readonly NOTIFICATION_CREATED: "notification.created";
};
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly MODERATOR: "moderator";
};
export declare const STORED_PROCEDURES: {
    readonly auth: {
        readonly login: "spUsers_GetByEmail";
        readonly register: "spUsers_Create";
    };
    readonly books: {
        readonly list: "spBooks_List";
        readonly detail: "spBooks_GetDetail";
    };
};
export declare const API_STATUS: {
    readonly SUCCESS: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_ERROR: 500;
};

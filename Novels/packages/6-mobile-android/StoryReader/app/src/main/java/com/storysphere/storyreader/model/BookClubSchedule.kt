package com.storysphere.storyreader.model

import java.time.OffsetDateTime

data class BookClubScheduleItem(
    val id: String,
    val chapterNumber: Int,
    val deadline: OffsetDateTime,
    val discussionDate: OffsetDateTime?
)


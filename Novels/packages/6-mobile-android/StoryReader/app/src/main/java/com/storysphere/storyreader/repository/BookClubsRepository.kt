package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.BookClubScheduleItem
import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BookClubsRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun getSchedule(groupId: String): List<BookClubScheduleItem> =
        graphQLService.getBookClubSchedule(groupId).getOrThrow()
}


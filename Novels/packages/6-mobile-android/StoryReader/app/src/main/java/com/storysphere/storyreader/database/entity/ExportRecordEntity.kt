package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "export_records")
data class ExportRecordEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val format: String,
    val scope: String,
    val destination: String,
    val itemCount: Int,
    val fileSizeBytes: Long,
    val exportedAt: Long,
    val filePath: String?
)



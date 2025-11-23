package com.storysphere.storyreader.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.storysphere.storyreader.database.entity.ExportRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ExportRecordDao {
    @Query("SELECT * FROM export_records WHERE userId = :userId ORDER BY exportedAt DESC")
    fun observeHistory(userId: String): Flow<List<ExportRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: ExportRecordEntity)

    @Query(
        """
            DELETE FROM export_records 
            WHERE userId = :userId 
              AND id NOT IN (
                  SELECT id FROM export_records 
                  WHERE userId = :userId 
                  ORDER BY exportedAt DESC 
                  LIMIT :maxRecords
              )
        """
    )
    suspend fun trimHistory(userId: String, maxRecords: Int)
}



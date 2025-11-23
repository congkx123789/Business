package com.storysphere.storyreader.utils.mobile.import

import android.content.Context
import android.net.Uri
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.repository.ExportImportRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ImportManager @Inject constructor(
    private val context: Context,
    private val importValidator: ImportValidator,
    private val importMapper: ImportMapper,
    private val exportImportRepository: ExportImportRepository
) {
    suspend fun importFromUri(
        userId: String,
        uri: Uri,
        format: ExportFormat
    ): Result<ImportResult> = withContext(Dispatchers.IO) {
        try {
            // Read file content
            val content = context.contentResolver.openInputStream(uri)?.use { inputStream ->
                inputStream.bufferedReader().readText()
            } ?: return@withContext Result.failure(IllegalArgumentException("Cannot read file from URI"))

            // Validate content
            val validationResult = importValidator.validate(content, format)
            if (!validationResult.isValid) {
                return@withContext Result.failure(
                    IllegalArgumentException("Invalid import file: ${validationResult.errors.joinToString()}")
                )
            }

            // Parse and map data
            val parsedData = importMapper.parse(content, format)
            val mappedData = importMapper.mapToAppFormat(parsedData, userId)

            // Import to repository
            val importResult = exportImportRepository.importData(userId, uri.toString())
            
            importResult.fold(
                onSuccess = {
                    Result.success(
                        ImportResult(
                            importedStories = mappedData.stories.size,
                            importedLibraryItems = mappedData.libraryItems.size,
                            importedAnnotations = mappedData.annotations.size,
                            importedProgress = mappedData.progressRecords.size
                        )
                    )
                },
                onFailure = { error ->
                    Result.failure(error)
                }
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun importFromJson(jsonContent: String, userId: String): Result<ImportResult> {
        return importMapper.parse(jsonContent, ExportFormat.JSON)
            .let { parsedData ->
                val mappedData = importMapper.mapToAppFormat(parsedData, userId)
                Result.success(
                    ImportResult(
                        importedStories = mappedData.stories.size,
                        importedLibraryItems = mappedData.libraryItems.size,
                        importedAnnotations = mappedData.annotations.size,
                        importedProgress = mappedData.progressRecords.size
                    )
                )
            }
    }
}

data class ImportResult(
    val importedStories: Int,
    val importedLibraryItems: Int,
    val importedAnnotations: Int,
    val importedProgress: Int
)

data class ParsedImportData(
    val stories: List<Story>,
    val libraryItems: List<Library>,
    val annotations: List<Any>, // Annotation model
    val progressRecords: List<Any> // ReadingProgress model
)


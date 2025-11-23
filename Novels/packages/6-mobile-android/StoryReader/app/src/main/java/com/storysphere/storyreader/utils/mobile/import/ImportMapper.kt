package com.storysphere.storyreader.utils.mobile.import

import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.Story
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ImportMapper @Inject constructor() {
    fun parse(content: String, format: ExportFormat): ParsedImportData {
        return when (format) {
            ExportFormat.JSON -> parseJson(content)
            ExportFormat.CSV -> parseCsv(content)
            ExportFormat.MARKDOWN -> parseMarkdown(content)
            else -> ParsedImportData(emptyList(), emptyList(), emptyList(), emptyList())
        }
    }

    fun mapToAppFormat(parsedData: ParsedImportData, userId: String): MappedImportData {
        return MappedImportData(
            stories = parsedData.stories.map { story ->
                // Ensure story has required fields and map to app format
                story.copy(
                    // Add any necessary transformations
                )
            },
            libraryItems = parsedData.libraryItems.map { library ->
                library.copy(
                    userId = userId,
                    // Ensure sync fields are set
                    syncStatus = "pending",
                    lastSyncedAt = null
                )
            },
            annotations = parsedData.annotations,
            progressRecords = parsedData.progressRecords
        )
    }

    private fun parseJson(content: String): ParsedImportData {
        val json = JSONObject(content)
        val data = json.optJSONObject("data") ?: JSONObject()
        
        val stories = parseStoriesFromJson(data.optJSONArray("stories"))
        val libraryItems = parseLibraryFromJson(data.optJSONArray("library"))
        val annotations = parseAnnotationsFromJson(data.optJSONArray("annotations"))
        val progressRecords = parseProgressFromJson(data.optJSONArray("progress"))
        
        return ParsedImportData(stories, libraryItems, annotations, progressRecords)
    }

    private fun parseStoriesFromJson(array: JSONArray?): List<Story> {
        if (array == null) return emptyList()
        
        return (0 until array.length()).mapNotNull { index ->
            try {
                val obj = array.getJSONObject(index)
                Story(
                    id = obj.getString("id"),
                    title = obj.getString("title"),
                    author = obj.optString("author", ""),
                    description = obj.optString("description", ""),
                    coverImage = obj.optString("coverImage"),
                    genreId = obj.optInt("genreId", 0),
                    status = obj.optString("status", "ongoing"),
                    createdAt = obj.optString("createdAt"),
                    updatedAt = obj.optString("updatedAt")
                )
            } catch (e: Exception) {
                null
            }
        }
    }

    private fun parseLibraryFromJson(array: JSONArray?): List<Library> {
        if (array == null) return emptyList()
        
        return (0 until array.length()).mapNotNull { index ->
            try {
                val obj = array.getJSONObject(index)
                Library(
                    id = obj.getString("id"),
                    userId = obj.getString("userId"),
                    storyId = obj.getString("storyId"),
                    addedAt = obj.optString("addedAt"),
                    syncStatus = obj.optString("syncStatus", "pending"),
                    lastSyncedAt = obj.optString("lastSyncedAt")
                )
            } catch (e: Exception) {
                null
            }
        }
    }

    private fun parseAnnotationsFromJson(array: JSONArray?): List<Any> {
        // Return empty list for now - implement when Annotation model is finalized
        return emptyList()
    }

    private fun parseProgressFromJson(array: JSONArray?): List<Any> {
        // Return empty list for now - implement when ReadingProgress model is finalized
        return emptyList()
    }

    private fun parseCsv(content: String): ParsedImportData {
        val lines = content.lines()
        if (lines.isEmpty()) return ParsedImportData(emptyList(), emptyList(), emptyList(), emptyList())
        
        val header = lines.first().split(",").map { it.trim() }
        val stories = mutableListOf<Story>()
        
        lines.drop(1).forEach { line ->
            val values = line.split(",").map { it.trim() }
            if (values.size == header.size) {
                val map = header.zip(values).toMap()
                try {
                    stories.add(
                        Story(
                            id = map["id"] ?: "",
                            title = map["title"] ?: "",
                            author = map["author"] ?: "",
                            description = map["description"] ?: "",
                            coverImage = map["coverImage"],
                            genreId = map["genreId"]?.toIntOrNull() ?: 0,
                            status = map["status"] ?: "ongoing",
                            createdAt = map["createdAt"],
                            updatedAt = map["updatedAt"]
                        )
                    )
                } catch (e: Exception) {
                    // Skip invalid rows
                }
            }
        }
        
        return ParsedImportData(stories, emptyList(), emptyList(), emptyList())
    }

    private fun parseMarkdown(content: String): ParsedImportData {
        // Parse markdown frontmatter and content
        // This is a simplified implementation
        val stories = mutableListOf<Story>()
        
        // Extract frontmatter
        val frontmatterRegex = Regex("^---\n([\\s\\S]*?)\n---")
        val match = frontmatterRegex.find(content)
        
        if (match != null) {
            val frontmatter = match.groupValues[1]
            // Parse YAML-like frontmatter (simplified)
            val title = extractFrontmatterField(frontmatter, "title")
            val author = extractFrontmatterField(frontmatter, "author")
            
            if (title != null) {
                stories.add(
                    Story(
                        id = generateId(),
                        title = title,
                        author = author ?: "",
                        description = "",
                        coverImage = null,
                        genreId = 0,
                        status = "ongoing",
                        createdAt = null,
                        updatedAt = null
                    )
                )
            }
        }
        
        return ParsedImportData(stories, emptyList(), emptyList(), emptyList())
    }

    private fun extractFrontmatterField(frontmatter: String, field: String): String? {
        val regex = Regex("$field:\\s*(.+)")
        return regex.find(frontmatter)?.groupValues?.get(1)?.trim()
    }

    private fun generateId(): String {
        return java.util.UUID.randomUUID().toString()
    }
}

data class MappedImportData(
    val stories: List<Story>,
    val libraryItems: List<Library>,
    val annotations: List<Any>,
    val progressRecords: List<Any>
)


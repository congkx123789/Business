package com.storysphere.storyreader.utils.mobile.import

import com.storysphere.storyreader.model.ExportFormat
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ImportValidator @Inject constructor() {
    fun validate(content: String, format: ExportFormat): ValidationResult {
        return when (format) {
            ExportFormat.JSON -> validateJson(content)
            ExportFormat.CSV -> validateCsv(content)
            ExportFormat.MARKDOWN -> validateMarkdown(content)
            else -> ValidationResult(
                isValid = false,
                errors = listOf("Unsupported format: ${format.name}")
            )
        }
    }

    private fun validateJson(content: String): ValidationResult {
        val errors = mutableListOf<String>()
        
        try {
            val json = JSONObject(content)
            
            // Check required top-level fields
            val requiredFields = listOf("version", "exportedAt")
            requiredFields.forEach { field ->
                if (!json.has(field)) {
                    errors.add("Missing required field: $field")
                }
            }
            
            // Validate version
            if (json.has("version")) {
                val version = json.getString("version")
                if (version.toDoubleOrNull() == null || version.toDouble() < 1.0) {
                    errors.add("Invalid version format")
                }
            }
            
            // Validate data structure if present
            if (json.has("data")) {
                val data = json.getJSONObject("data")
                // Validate data structure
                if (!data.has("stories") && !data.has("library") && !data.has("annotations")) {
                    errors.add("Data object must contain at least one of: stories, library, annotations")
                }
            }
            
        } catch (e: Exception) {
            errors.add("Invalid JSON format: ${e.message}")
        }
        
        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors
        )
    }

    private fun validateCsv(content: String): ValidationResult {
        val errors = mutableListOf<String>()
        
        if (content.isBlank()) {
            errors.add("CSV content is empty")
            return ValidationResult(isValid = false, errors = errors)
        }
        
        val lines = content.lines()
        if (lines.isEmpty()) {
            errors.add("CSV has no lines")
            return ValidationResult(isValid = false, errors = errors)
        }
        
        // Check header row
        val header = lines.first()
        val requiredColumns = listOf("id", "title", "type")
        val headerColumns = header.split(",").map { it.trim() }
        
        requiredColumns.forEach { required ->
            if (!headerColumns.contains(required)) {
                errors.add("Missing required column: $required")
            }
        }
        
        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors
        )
    }

    private fun validateMarkdown(content: String): ValidationResult {
        val errors = mutableListOf<String>()
        
        if (content.isBlank()) {
            errors.add("Markdown content is empty")
        }
        
        // Basic markdown validation - check for frontmatter
        if (!content.startsWith("---")) {
            errors.add("Markdown export should start with frontmatter (---)")
        }
        
        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors
        )
    }
}

data class ValidationResult(
    val isValid: Boolean,
    val errors: List<String> = emptyList()
)


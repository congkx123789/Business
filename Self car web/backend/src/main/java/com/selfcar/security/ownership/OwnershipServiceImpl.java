package com.selfcar.security.ownership;

import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Stub implementation of OwnershipService.
 * TODO: Implement proper ownership checking based on your domain models.
 */
@Service
public class OwnershipServiceImpl implements OwnershipService {
    
    @Override
    public boolean isOwner(String resource, UUID resourceId, String subjectId) 
            throws ResourceNotFoundException {
        // Stub implementation - always returns true for now
        // TODO: Implement actual ownership checking logic
        // Example: Check if subjectId owns the resource with resourceId
        return true;
    }
}

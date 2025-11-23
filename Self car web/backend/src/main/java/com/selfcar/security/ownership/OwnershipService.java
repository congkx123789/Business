package com.selfcar.security.ownership;

import java.util.UUID;

public interface OwnershipService {
    /**
     * Returns true if subjectId is the owner of the resource.
     * Implement using your persistence layer to look up ownership.
     */
    boolean isOwner(String resource, UUID resourceId, String subjectId) throws ResourceNotFoundException;

    class ResourceNotFoundException extends Exception {
        public ResourceNotFoundException(String message) { super(message); }
    }
}


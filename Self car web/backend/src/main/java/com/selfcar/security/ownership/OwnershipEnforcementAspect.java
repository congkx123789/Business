package com.selfcar.security.ownership;

import java.lang.reflect.Parameter;
import java.util.UUID;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
public class OwnershipEnforcementAspect {

    private final OwnershipService ownershipService;

    public OwnershipEnforcementAspect(OwnershipService ownershipService) {
        this.ownershipService = ownershipService;
    }

    @Before("@annotation(ownerOnly)")
    public void checkOwnership(JoinPoint jp, OwnerOnly ownerOnly) throws Throwable {
        String idParamName = ownerOnly.idParam();
        UUID resourceId = resolveUuidParam(jp, idParamName);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
        String subjectId = auth.getName();

        try {
            boolean isOwner = ownershipService.isOwner(ownerOnly.resource(), resourceId, subjectId);
            if (!isOwner) {
                throw new AccessDeniedException("forbidden");
            }
        } catch (OwnershipService.ResourceNotFoundException rnfe) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, rnfe.getMessage());
        }
    }

    private UUID resolveUuidParam(JoinPoint jp, String paramName) {
        MethodSignature sig = (MethodSignature) jp.getSignature();
        Parameter[] params = sig.getMethod().getParameters();
        Object[] args = jp.getArgs();
        for (int i = 0; i < params.length; i++) {
            if (params[i].getName().equals(paramName)) {
                Object val = args[i];
                if (val instanceof UUID uuid) return uuid;
                if (val instanceof String s) return UUID.fromString(s);
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid id param: " + paramName);
    }
}


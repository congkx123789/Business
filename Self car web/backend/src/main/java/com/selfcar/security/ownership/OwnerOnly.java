package com.selfcar.security.ownership;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface OwnerOnly {
    // Logical resource name (e.g., "order", "profile")
    String resource();

    // Name of the method parameter that holds the resource ID
    String idParam() default "id";
}


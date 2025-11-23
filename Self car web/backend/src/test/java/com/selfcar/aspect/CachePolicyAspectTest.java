package com.selfcar.aspect;

import com.selfcar.annotation.CachePolicy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CachePolicyAspectTest {

    @Test
    @DisplayName("applyCachePolicy sets Cache-Control and Vary headers when request context exists")
    void applyCachePolicy_setsHeaders() throws Throwable {
        CachePolicyAspect aspect = new CachePolicyAspect();

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request, response));

        var pjp = mock(org.aspectj.lang.ProceedingJoinPoint.class);
        when(pjp.proceed()).thenReturn("ok");

        CachePolicy cachePolicy = new CachePolicy() {
            public Class<? extends java.lang.annotation.Annotation> annotationType() { return CachePolicy.class; }
            public boolean isPublic() { return true; }
            public int maxAge() { return 60; }
            public int sMaxAge() { return 120; }
            public int staleWhileRevalidate() { return 30; }
            public boolean immutable() { return true; }
            public boolean mustRevalidate() { return true; }
            public int ttl() { return 60; }
            public String cacheName() { return "test"; }
        };

        Object result = aspect.applyCachePolicy(pjp, cachePolicy);
        assertThat(result).isEqualTo("ok");
        String cc = response.getHeader("Cache-Control");
        assertThat(cc).contains("public").contains("max-age=60").contains("s-maxage=120").contains("stale-while-revalidate=30").contains("immutable").contains("must-revalidate");
        assertThat(response.getHeader("Vary")).isEqualTo("Accept, Accept-Encoding");
    }

    @Test
    @DisplayName("applyCachePolicy no-op when no request context")
    void applyCachePolicy_noRequestContext() throws Throwable {
        RequestContextHolder.resetRequestAttributes();
        CachePolicyAspect aspect = new CachePolicyAspect();
        var pjp = mock(org.aspectj.lang.ProceedingJoinPoint.class);
        when(pjp.proceed()).thenReturn("ok");

        CachePolicy cachePolicy = Mockito.mock(CachePolicy.class);
        Object result = aspect.applyCachePolicy(pjp, cachePolicy);
        assertThat(result).isEqualTo("ok");
    }
}



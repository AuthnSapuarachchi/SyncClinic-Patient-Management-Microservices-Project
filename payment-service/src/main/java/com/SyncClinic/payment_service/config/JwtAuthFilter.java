package com.SyncClinic.payment_service.config;

 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
 
import java.io.IOException;
import java.util.List;
 
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
 
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
 
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
 
        String authHeader = request.getHeader("Authorization");
 
        // Skip filter if no token present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
 
        String token = authHeader.substring(7);
 
        if (jwtUtil.isTokenValid(token)) {
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
 
            if (role != null && role.startsWith("ROLE_")) {
                role = role.substring("ROLE_".length());
            }

            // Store user info in security context so controllers can access it
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    role != null && !role.isBlank()
                            ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            : List.of()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
 
        filterChain.doFilter(request, response);
    }
}
 
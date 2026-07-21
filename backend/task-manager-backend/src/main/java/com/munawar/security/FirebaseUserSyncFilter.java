package com.munawar.security;

import com.munawar.entity.User;
import com.munawar.repo.IUserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class FirebaseUserSyncFilter extends OncePerRequestFilter {

    @Autowired
    private IUserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuthToken) {
            Jwt jwt = jwtAuthToken.getToken();
            
            String email = jwt.getClaimAsString("email");
            String name = jwt.getClaimAsString("name");

            if (email != null && !email.isEmpty()) {
                // Check if user exists in our DB, if not, create them
                if (userRepo.findByEmail(email).isEmpty()) {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : email.split("@")[0]);
                    newUser.setPassword(UUID.randomUUID().toString()); // Dummy password for DB constraint
                    userRepo.save(newUser);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

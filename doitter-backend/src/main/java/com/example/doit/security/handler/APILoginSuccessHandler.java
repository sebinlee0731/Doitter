package com.example.doit.security.handler;

import com.example.doit.dto.user.UserDTO;
import com.example.doit.security.jwt.JWTProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        log.info("----------------APILoginSuccessHandler----------------");
        log.info(authentication.toString());

        UserDTO userDTO = (UserDTO)authentication.getPrincipal();

        Map<String, Object> claims = userDTO.getClaims();

        String accessToken = JWTProvider.generateToken(claims, 60); // 60분
        String refreshToken = JWTProvider.generateToken(claims, 60 * 24); // 24시간

        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        String jsonResponse = objectMapper.writeValueAsString(claims);

        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(jsonResponse);
    }
}

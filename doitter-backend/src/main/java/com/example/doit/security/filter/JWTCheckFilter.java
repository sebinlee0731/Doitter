package com.example.doit.security.filter;

import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.dto.user.UserDTO;
import com.example.doit.security.jwt.JWTProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
public class JWTCheckFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {

        log.info("-------JWTCheckFilter---shouldNotFilter----------------");

        // Preflight 필터 안함
        if(request.getMethod().equals("OPTIONS")){
            return true;
        }

        String path = request.getRequestURI();

        // /api/user 필터 안함
        if(path.startsWith("/api/user/")) {
            return true;
        }

        log.info("check uri............... {}", path);

        // 필터 해야함
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        log.info("-------JWTCheckFilter---doFilterInternal----------------");

        String authHeader = request.getHeader("Authorization");

        try{

            String accessToken = authHeader.substring(7);
            log.info("accessToken: {}", accessToken);
            Map<String, Object> claims = JWTProvider.validateToken(accessToken);

            log.info("JWT claims: {}", claims);

            Long userId =  ((Number) claims.get("userId")).longValue();
            String email = (String) claims.get("email");
            String password = (String) claims.get("password");
            String name = (String) claims.get("name");
            String role = (String) claims.get("role");

            UserDTO userDTO = new UserDTO(userId, email, password, name, role);

            log.info("--------------userDTO---------------------");
            log.info(userDTO.toString());
            log.info(userDTO.getAuthorities().toString());

            //실제 시큐리티가 사용하는 토큰 (UserDTO를 시큐리티에 포함시키는 과정)
            UsernamePasswordAuthenticationToken authenticationToken
                    = new UsernamePasswordAuthenticationToken(userDTO, password, userDTO.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);


            filterChain.doFilter(request, response);
        } catch (Exception e){

            log.error("JWT Check Error ................");
            log.error(e.getMessage());

            ApiResponseDTO<Void> apiResponse = ApiResponseDTO.error(
                    HttpStatus.FORBIDDEN.value(),
                    "인증이 필요합니다.");

            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json;charset=UTF-8");

            String jsonResponse = objectMapper.writeValueAsString(apiResponse);
            response.getWriter().write(jsonResponse);
        }
    }
}

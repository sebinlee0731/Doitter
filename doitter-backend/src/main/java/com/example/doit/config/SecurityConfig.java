package com.example.doit.config;

import com.example.doit.security.filter.JWTCheckFilter;
import com.example.doit.security.handler.APIAccessDeniedHandler;
import com.example.doit.security.handler.APIAuthenticationEntryPoint;
import com.example.doit.security.handler.APILoginFailHandler;
import com.example.doit.security.handler.APILoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final APIAccessDeniedHandler apiAccessDeniedHandler;
    private final APIAuthenticationEntryPoint apiAuthenticationEntryPoint;
    private final APILoginSuccessHandler apiLoginSuccessHandler;
    private final APILoginFailHandler apiLoginFailHandler;
    private final JWTCheckFilter jwtCheckFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        log.info("---------------Security Config Start-----------------");

        http.cors(config ->
                config.configurationSource(corsConfigurationSource())
        );

        http.csrf(AbstractHttpConfigurer::disable);

        http.formLogin(config -> {
            config.loginPage("/api/user/login");
            config.successHandler(apiLoginSuccessHandler);
            config.failureHandler(apiLoginFailHandler);
        });

        http.authorizeHttpRequests(config -> {
            // 1. 로그인 경로는 허용
            config.requestMatchers("/api/user/login").permitAll();
            // 2. 그 외 모든 /api/** (또는 /rest/v1/**) 경로는 인증(JWT 검사) 필요
            config.requestMatchers("/api/**", "/rest/v1/**").authenticated();
            config.anyRequest().permitAll();
        });

        http.exceptionHandling(config -> {
            config.accessDeniedHandler(apiAccessDeniedHandler);
            config.authenticationEntryPoint(apiAuthenticationEntryPoint);
        });

        http.sessionManagement(config ->
                config.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.addFilterBefore(jwtCheckFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean //cors 설정, crossOrigin 대신 사용
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

//        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

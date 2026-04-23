package com.example.doit.security.service;

import com.example.doit.domain.user.User;
import com.example.doit.dto.user.UserDTO;
import com.example.doit.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {


    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("-----------------loadUserByUsername----------------");
        //username은 입력받은 email(unique)값임.
        User user = userRepository.findByEmail(username).orElseThrow(
                () -> new UsernameNotFoundException("등록되지 않은 유저 EMAIL: " + username)
        );

        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getRole().name()
        );

        log.info(userDTO.toString());

        return userDTO;
    }
}



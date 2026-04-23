package com.example.doit.repository.stub;

import com.example.doit.domain.user.User;
import com.example.doit.repository.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootTest
@Slf4j
public class UserRepositoryTest {

    // 해당 파일은 임시파일임으로 병합시 무시해주세요.

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Test
    public void testCreate() {

        User.Role role = User.Role.USER;

        for (int i = 1; i <= 1; i++) {
            User user = User.builder()
                    .name("테스트유저" + i)
                    .email("test" + i + "@gmail.com")
                    .password(bCryptPasswordEncoder.encode("1111"))
                    .role(role)
                    .build();

            userRepository.save(user);
        }
    }
}

package com.example.doit.dto.user;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@ToString
public class UserDTO extends User {

    private Long userId;

    private String email;

    private String password;

    private String name;

    private String role;

    public UserDTO(Long userId, String email, String password, String name, String role){

        super(email,password, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

        this.userId = userId;
        this.email = email;
        this.password = password;
        this.role = role;
        this.name = name;
    }

    public Map<String, Object> getClaims() {

        Map<String, Object> map = new HashMap<>();

        map.put("userId",userId);
        map.put("email",email);
        map.put("password", password);
        map.put("name", name);
        map.put("role",role);

        return map;
    }
}

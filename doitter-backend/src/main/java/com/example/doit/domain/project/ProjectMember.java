package com.example.doit.domain.project;

import com.example.doit.domain.user.User;
import com.example.doit.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;


import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@ToString(exclude = {"project", "user"})
@NoArgsConstructor
@AllArgsConstructor
@Table(
        uniqueConstraints=
        @UniqueConstraint(columnNames={"project_id", "user_id"})
)
public class ProjectMember extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role;

    // BaseTimeEntity의 createdAt은 초대시간
    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    public void changeRole(ProjectRole role) {
        this.role = role;
    }
}


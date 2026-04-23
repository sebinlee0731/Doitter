package com.example.doit.domain.task;

import com.example.doit.domain.user.User;
import com.example.doit.domain.common.BaseTimeEntity;
import com.example.doit.domain.project.Project;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@ToString(exclude = {"project", "user"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Task extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskState state = TaskState.TODO;

    @Column(nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public void changeDescription(String description) {
        this.description = description;
    }

    public void changeState(TaskState state) {
        this.state = state;
    }

    public void changeOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public void changePriority(TaskPriority priority) {
        this.priority = priority;
    }

    public void changeUser(User user) {
        this.user = user;
    }
}

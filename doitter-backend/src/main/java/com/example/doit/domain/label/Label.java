package com.example.doit.domain.label;

import com.example.doit.domain.project.Project;
import com.example.doit.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Getter
@ToString(exclude = {"project"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        uniqueConstraints=
        @UniqueConstraint(columnNames={"name", "project_id"})
)
public class Label extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    public void changeName(String name) {
        this.name = name;
    }

    public void changeColor(String color) {
        this.color = color;
    }
}

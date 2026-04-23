package com.example.doit.domain.task;

import com.example.doit.domain.common.BaseTimeEntity;
import com.example.doit.domain.label.Label;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;


@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"task", "label"})
public class TaskLabel extends BaseTimeEntity {

    @EmbeddedId
    private TaskLabelId id;

    @MapsId("taskId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Task task;

    @MapsId("labelId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "label_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Label label;

    @Builder
    public TaskLabel(Task task, Label label) {
        this.task = task;
        this.label = label;
        this.id = new TaskLabelId();
    }
}

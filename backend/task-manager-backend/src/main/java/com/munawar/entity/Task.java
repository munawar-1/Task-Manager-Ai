package com.munawar.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    // 'daily', 'monthly', or 'yearly'
    private String type;

    // specific date, month name, or year
    private String timeframe;

    private String category;

    // 'Low', 'Medium', 'High'
    private String priority;

    //'todo', 'in-process', 'done'
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    // Constructors
    public Task() {}

}


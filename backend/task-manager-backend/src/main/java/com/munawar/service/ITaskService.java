package com.munawar.service;

import com.munawar.entity.Task;

import java.util.List;

public interface ITaskService {
    List<Task> getAllTasks();
    Task getTaskById(Long id);
    Task createNewTask(Task task);
    Task updateTask(Long id , Task task);
    void deleteTask(Long id);
}

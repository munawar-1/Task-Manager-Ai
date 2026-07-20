package com.munawar.service;

import com.munawar.entity.Task;
import com.munawar.repo.ITaskRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class TaskService implements ITaskService{

    @Autowired
    private ITaskRepo repo;

    @Override
    public List<Task> getAllTasks() {

        return repo.findAll();
    }

    @Override
    public Task getTaskById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Task createNewTask(Task task) {
        return repo.save(task);
    }

    @Override
    public Task updateTask(Long id, Task task) {
        //react is sending the update not task object so we are seeing if the feild sent is not null then only set the field
        Task existingTask = repo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (task.getText() != null) existingTask.setText(task.getText());
        if (task.getType() != null) existingTask.setType(task.getType());
        if (task.getTimeframe() != null) existingTask.setTimeframe(task.getTimeframe());
        if (task.getCategory() != null) existingTask.setCategory(task.getCategory());
        if (task.getPriority() != null) existingTask.setPriority(task.getPriority());
        if (task.getStatus() != null) {
            existingTask.setStatus(task.getStatus());
            existingTask.setCompletedAt(task.getCompletedAt());
        }
        
        return repo.save(existingTask);
    }

    @Override
    public void deleteTask(Long id) {
        repo.deleteById(id);
    }
}

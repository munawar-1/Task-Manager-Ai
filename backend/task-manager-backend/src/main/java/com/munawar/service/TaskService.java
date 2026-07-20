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
        // Ensure we update the existing row rather than creating a new one
        task.setId(id);
        return repo.save(task);
    }

    @Override
    public void deleteTask(Long id) {
        repo.deleteById(id);
    }
}

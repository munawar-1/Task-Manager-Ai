package com.munawar.service;

import com.munawar.entity.Task;
import com.munawar.entity.User;
import com.munawar.repo.ITaskRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class TaskService implements ITaskService{

    @Autowired
    private ITaskRepo repo;

    @Autowired
    private com.munawar.repo.IUserRepo userRepo;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            String email = jwt.getClaimAsString("email");
            return userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found in DB"));
        }
        throw new RuntimeException("User not authenticated");
    }

    @Override
    public List<Task> getAllTasks() {
        // Fetch only tasks for the authenticated user
        User user = getAuthenticatedUser();
        return repo.findAll().stream()
                .filter(task -> task.getUser() != null && task.getUser().getId().equals(user.getId()))
                .toList();
    }

    @Override
    public Task getTaskById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Task createNewTask(Task task) {
        task.setUser(getAuthenticatedUser());
        return repo.save(task);
    }

    @Override
    public Task updateTask(Long id, Task task) {
        Task existingTask = repo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Ensure user can only update their own task
        if (existingTask.getUser() == null || !existingTask.getUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (task.getText() != null) existingTask.setText(task.getText());
        if (task.getType() != null) existingTask.setType(task.getType());
        if (task.getTimeframe() != null) existingTask.setTimeframe(task.getTimeframe());
        if (task.getCategory() != null) existingTask.setCategory(task.getCategory());
        if (task.getPriority() != null) existingTask.setPriority(task.getPriority());
        if (task.getStatus() != null) {
            existingTask.setStatus(task.getStatus());
            existingTask.setCompletedAt(task.getCompletedAt());
        }
        if (task.getSubtasks() != null) {
            existingTask.getSubtasks().clear();
            existingTask.getSubtasks().addAll(task.getSubtasks());
        }
        
        return repo.save(existingTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task existingTask = repo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        if (existingTask.getUser() == null || !existingTask.getUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        repo.deleteById(id);
    }
}

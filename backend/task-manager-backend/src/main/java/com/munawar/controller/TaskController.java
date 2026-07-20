package com.munawar.controller;

import com.munawar.entity.Task;
import com.munawar.service.ITaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private ITaskService service;

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id){

        return new ResponseEntity<>(service.getTaskById(id) , HttpStatus.OK);

    }
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(){
      return new ResponseEntity<>(service.getAllTasks() , HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task){
        Task savedTask = service.createNewTask(task);
        return new ResponseEntity<>(savedTask, HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id , @RequestBody Task task){

        return new ResponseEntity<>(service.updateTask(id, task) , HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity deleteTask(@PathVariable Long id){
        service.deleteTask(id);
        return new ResponseEntity(HttpStatus.OK);
    }
}

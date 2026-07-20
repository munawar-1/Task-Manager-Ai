package com.munawar.repo;

import com.munawar.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface ITaskRepo extends JpaRepository<Task , Long> {

}

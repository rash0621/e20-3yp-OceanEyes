package com.example.OceanEyes.Service;


import com.example.OceanEyes.Entity.User;
import com.example.OceanEyes.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    public void saveorUpdate(User users) {

        repo.save(users);
    }

    public Iterable<User> listAll() {
        return this.repo.findAll();
    }

    public void deleteStudent(String id) {
        repo.deleteById(id);
    }

    public User getUserById(String userid) {
        return repo.findById(userid).get();
    }
}

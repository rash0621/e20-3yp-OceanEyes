package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.User;
import com.example.OceanEyes.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*") // to connect with front-end
@RequestMapping("api/v1/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/save")
    private String saveUser(@RequestBody User users) {

        userService.saveorUpdate(users);
        return users.get_id();
    }

    @GetMapping(value = "/getAll")
    private Iterable<User> getAllUsers() {

        return userService.listAll();
    }

    @PutMapping(value = "/edit/{id}")
    private User updateUser(@RequestBody User user, @PathVariable(name = "id")String id) {

        user.set_id(id);
        userService.saveorUpdate(user);
        return user;
    }

    @DeleteMapping("/delete/{id}")
    private void deleteUser(@PathVariable(name = "id")String id) {

        userService.deleteStudent(id);
    }

    @RequestMapping("/search/{id}")
    private User getUser(@PathVariable(name = "id")String userid) {
        return userService.getUserById(userid);
    }

}

package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Config.JwtUtil;
import com.example.OceanEyes.Entity.User;
import com.example.OceanEyes.Service.UserService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping(value = "/register")
    private ResponseEntity<ActionStatusMessage<String>> registerUser(@RequestBody User user) {
        try {
            boolean userSaved = userService.registerUser(user);

            if (userSaved) {
                String deviceId = user.getId();
                String token = jwtUtil.generateToken(deviceId);
                return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "User saved successfully", token));
            } else
                return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "User already exists", null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "User creation failed", null));
        }
    }

    @GetMapping(value = "/getAll")
    private ResponseEntity<ActionStatusMessage<Iterable<User>>> getAllUsers() {
        try {
            Iterable<User> usersList = userService.listAll();
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Users fetched successfully", usersList));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "User fetching failed", null));
        }
    }

    @DeleteMapping("/delete/{id}")
    private ResponseEntity<ActionStatusMessage<String>> deleteUser(@PathVariable(name = "id") String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "User deleted successfully", ""));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "User deletion failed", ""));
        }
    }

    @PostMapping(value = "/login")
    private ResponseEntity<ActionStatusMessage<String>> loginUser(@RequestBody User loginUser) {
        try {
            boolean loginSuccess = userService.loginUser(loginUser);
            if (loginSuccess) {
                System.out.println("Login user: "+ loginUser); // User{_id='null', userEmail='kasundiehewawasam@gmail.com'}
                System.out.println("Get ID in login function: "+ loginUser.getId()); //null
                String token = jwtUtil.generateToken(loginUser.getId()); //nul
                return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Successfully logged in", token));
            }
            return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL", "Invalid Credentials", null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Error in logging", null));
        }
    }

    /** For testing purposes **/
    @RequestMapping("/search/{id}")
    private User getUser(@PathVariable(name = "id") String userId) {
        return userService.getUserById(userId);
    }

    @GetMapping("/me")
    public ResponseEntity<ActionStatusMessage<User>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        System.out.println(token);  //valid token was printed
        System.out.println(jwtUtil.validateToken(token));   // true was printed

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL", "Invalid token", null));
        }
        try {
            String userId = jwtUtil.extractUserId(token); // Implement extractUserId in JwtUtil
            System.out.println(userId);
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "User info fetched", user));
        } catch (Exception e) {
            e.printStackTrace(); // for debuggin
            return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL", "Invalid token", null));
        }
    }
}

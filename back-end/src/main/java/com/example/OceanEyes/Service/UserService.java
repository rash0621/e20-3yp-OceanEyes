package com.example.OceanEyes.Service;


import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Entity.User;
import com.example.OceanEyes.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    /** encode the password later when editing too **/
    public void saveOrUpdate(User user) {
        userRepository.save(user);
    }

    public Iterable<User> listAll() {
        return this.userRepository.findAll();
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public User getUserById(String userid) {
        return userRepository.findById(userid).get();
    }

    public boolean loginUser(User loginUser) {

        Optional<User> user = userRepository.findByUserEmail(loginUser.getUserEmail());
        boolean userExists = user.isPresent();

        if (userExists) {
            User dbUser = user.get();
            return passwordEncoder.matches(loginUser.getUserPassword(), dbUser.getUserPassword());
        } else {
            throw new RuntimeException("User not found");

        }
    }

    public boolean registerUser(User user) {
        boolean userExists = userRepository.findByUserEmail(user.getUserEmail()).isPresent();
        if (userExists) {
            throw new IllegalStateException("Email already exists");
        }
        try {
            String encodePassword = passwordEncoder.encode(user.getUserPassword());
            user.setUserPassword(encodePassword);
            userRepository.save(user);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    public boolean editUser(User user) {
        boolean userExists = userRepository.findByUserEmail(user.getUserEmail()).isPresent();
        if (userExists) {
            try {
                User dbUser = userRepository.findByUserEmail(user.getUserEmail()).get();
                String encodePassword = passwordEncoder.encode(user.getUserPassword());
                dbUser.setUserPassword(encodePassword);
                dbUser.setUserEmail(user.getUserEmail());
                userRepository.save(user);
                return true;
            }catch(Exception e){
                return false;
            }
        }
        else{
            throw new IllegalStateException("User doesn't exist");
        }

    }
}

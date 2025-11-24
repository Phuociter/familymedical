package com.example.famMedical.resolver;

import com.example.famMedical.service.UserService;
import com.example.famMedical.Entity.User;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import java.util.List;

@Controller
public class UserResolver {
    private final UserService userService;

    @Autowired
    public UserResolver(UserService userService) {
        this.userService = userService;
    }

    @QueryMapping
    public List<User> getDoctorList() {
        // System.out.println("Fetching doctor list...");
        // for(User user : userService.takeDoctorList()) {
        //     System.out.println("Doctor: " + user.getHospitalName());
        // }   
        return userService.takeDoctorList();
    }
}

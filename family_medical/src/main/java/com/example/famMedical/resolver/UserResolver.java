package com.example.famMedical.resolver;

import com.example.famMedical.service.UserService;
import com.example.famMedical.Entity.User;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
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

    @MutationMapping
    public String forgotPassword(@Argument String email) {
        return userService.forgotPassword(email);
    }

    @MutationMapping
    public String validateResetCode(@Argument String email, @Argument String code) {
        return userService.validateResetCode(email, code);
    }

    @MutationMapping
    public String resetMyPassword(@Argument String token, @Argument String newPassword) {
        return userService.resetMyPassword(token, newPassword);
    }
}

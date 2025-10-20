package com.example.famMedical.Entity;


import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Family")
@NoArgsConstructor
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer familyID;

    private String familyName;
    private String address;

    @ManyToOne
    @JoinColumn(name = "HeadOfFamilyID")
    private User headOfFamily;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Member> members;
}


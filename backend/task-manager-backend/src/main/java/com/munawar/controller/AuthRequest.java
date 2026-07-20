package com.munawar.controller;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}

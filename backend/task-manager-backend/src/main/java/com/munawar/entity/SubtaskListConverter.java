package com.munawar.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Converter
public class SubtaskListConverter implements AttributeConverter<List<Subtask>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Subtask> subtasks) {
        try {
            if (subtasks == null) {
                return "[]";
            }
            return mapper.writeValueAsString(subtasks);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Override
    public List<Subtask> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return mapper.readValue(dbData, new TypeReference<List<Subtask>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}

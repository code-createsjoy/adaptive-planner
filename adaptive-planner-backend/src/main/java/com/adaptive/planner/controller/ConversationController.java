package com.adaptive.planner.controller;

import com.adaptive.planner.dto.AppendMessageRequest;
import com.adaptive.planner.dto.ChatMessageDto;
import com.adaptive.planner.dto.ConversationDto;
import com.adaptive.planner.dto.CreateConversationRequest;
import com.adaptive.planner.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/ai/conversations", "/api/planner/conversations"})
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationDto>> getConversations() {
        return ResponseEntity.ok(conversationService.getConversations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDto> getConversationById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getConversationById(id));
    }

    @PostMapping
    public ResponseEntity<ConversationDto> createConversation(@RequestBody(required = false) CreateConversationRequest request) {
        ConversationDto created = conversationService.createConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatMessageDto> appendMessage(@PathVariable Long id, @RequestBody AppendMessageRequest request) {
        ChatMessageDto created = conversationService.appendMessage(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}

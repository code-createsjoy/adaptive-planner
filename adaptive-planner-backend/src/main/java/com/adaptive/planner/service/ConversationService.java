package com.adaptive.planner.service;

import com.adaptive.planner.dto.AppendMessageRequest;
import com.adaptive.planner.dto.ChatMessageDto;
import com.adaptive.planner.dto.ConversationDto;
import com.adaptive.planner.dto.CreateConversationRequest;
import com.adaptive.planner.entity.ChatMessageEntity;
import com.adaptive.planner.entity.ConversationEntity;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.ChatMessageRepository;
import com.adaptive.planner.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public ConversationDto createConversation(CreateConversationRequest request) {
        String title = request != null && request.getTitle() != null && !request.getTitle().trim().isEmpty()
                ? request.getTitle().trim()
                : "New Conversation";

        if (request != null && (request.getTitle() == null || request.getTitle().trim().isEmpty())
                && request.getInitialMessage() != null && request.getInitialMessage().getContent() != null) {
            String snippet = request.getInitialMessage().getContent().trim();
            title = snippet.length() > 40 ? snippet.substring(0, 37) + "..." : snippet;
        }

        ConversationEntity entity = ConversationEntity.builder()
                .title(title)
                .messages(new ArrayList<>())
                .build();

        if (request != null && request.getInitialMessage() != null) {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(entity)
                    .role(request.getInitialMessage().getRole() != null ? request.getInitialMessage().getRole() : "user")
                    .content(request.getInitialMessage().getContent())
                    .metadataJson(request.getInitialMessage().getMetadataJson())
                    .build();
            entity.getMessages().add(msg);
        }

        ConversationEntity saved = conversationRepository.save(entity);
        return mapToDto(saved, true);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(c -> {
                    String lastPreview = null;
                    List<ChatMessageEntity> msgs = c.getMessages();
                    if (msgs != null && !msgs.isEmpty()) {
                        ChatMessageEntity lastMsg = msgs.get(msgs.size() - 1);
                        lastPreview = lastMsg.getContent();
                        if (lastPreview != null && lastPreview.length() > 60) {
                            lastPreview = lastPreview.substring(0, 57) + "...";
                        }
                    }
                    return ConversationDto.builder()
                            .id(c.getId())
                            .title(c.getTitle())
                            .createdAt(c.getCreatedAt())
                            .updatedAt(c.getUpdatedAt())
                            .lastMessagePreview(lastPreview)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDto getConversationById(Long id) {
        ConversationEntity entity = conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + id));
        return mapToDto(entity, true);
    }

    @Transactional
    public ChatMessageDto appendMessage(Long conversationId, AppendMessageRequest request) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        ChatMessageEntity msg = ChatMessageEntity.builder()
                .conversation(conversation)
                .role(request.getRole() != null ? request.getRole() : "user")
                .content(request.getContent() != null ? request.getContent() : "")
                .metadataJson(request.getMetadataJson())
                .build();

        ChatMessageEntity savedMsg = chatMessageRepository.save(msg);

        // Update title if it's default and this is first user message
        if (("New Conversation".equalsIgnoreCase(conversation.getTitle()) || "Cuộc trò chuyện mới".equalsIgnoreCase(conversation.getTitle())) && "user".equalsIgnoreCase(msg.getRole())) {
            String snippet = msg.getContent().trim();
            conversation.setTitle(snippet.length() > 40 ? snippet.substring(0, 37) + "..." : snippet);
        }
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return mapChatMessageToDto(savedMsg);
    }

    @Transactional
    public void deleteConversation(Long id) {
        if (!conversationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Conversation not found with id: " + id);
        }
        conversationRepository.deleteById(id);
    }

    private ConversationDto mapToDto(ConversationEntity entity, boolean includeMessages) {
        List<ChatMessageDto> msgDtos = null;
        String lastPreview = null;
        if (includeMessages && entity.getMessages() != null) {
            msgDtos = entity.getMessages().stream()
                    .map(this::mapChatMessageToDto)
                    .collect(Collectors.toList());
            if (!msgDtos.isEmpty()) {
                ChatMessageDto lastMsg = msgDtos.get(msgDtos.size() - 1);
                lastPreview = lastMsg.getContent();
                if (lastPreview != null && lastPreview.length() > 60) {
                    lastPreview = lastPreview.substring(0, 57) + "...";
                }
            }
        }

        return ConversationDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .messages(msgDtos)
                .lastMessagePreview(lastPreview)
                .build();
    }

    private ChatMessageDto mapChatMessageToDto(ChatMessageEntity entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .conversationId(entity.getConversation() != null ? entity.getConversation().getId() : null)
                .role(entity.getRole())
                .content(entity.getContent())
                .metadataJson(entity.getMetadataJson())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

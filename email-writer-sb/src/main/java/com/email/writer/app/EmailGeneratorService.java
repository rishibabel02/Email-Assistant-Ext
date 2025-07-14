package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient webClient) {
        this.webClient = webClient;
    }


    public String generateEmailReply(EmailRequest emailRequest) {
        // 1) Build the prompt
        String prompt = buildPrompt(emailRequest);

        // 2) Craft a request to the LLM
        Map<String, Object> reqBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        // 3) Send request and get the response
        String response = webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(reqBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // 4) Extract response and return
        return extractResponse(response);
    }

    private String extractResponse(String response) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            return "Error: Invalid response format";
        } catch (Exception e) {
            return "Error processing response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate a professional email reply based on the following email:\n Please dont generate any subject and don't mention it.\n Just generate the body of the email.\n and only one email content , don't give options for the user to choose from.\n\n");

        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            promptBuilder.append("Tone: ").append(emailRequest.getTone()).append("\n");
        }

        promptBuilder.append("\nOriginal Email Content:\n").append(emailRequest.getEmailContent());
        return promptBuilder.toString();


    }
}

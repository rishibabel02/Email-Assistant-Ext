package com.email.writer.app;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
        try{
            // 1) Build the prompt
            String prompt = buildPrompt(emailRequest);

            // 2) Craft a request to the LLM
            Map<String, Object> reqBody = Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{
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

            String result = extractResponse(response);

            // 4) Extract response and return
            return result;
        } catch (Exception e) {
        return "Error processing response: " + e.getMessage();
        }
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
                    String text = parts.get(0).path("text").asText();

                    return text.replaceAll("\\n{3,}", "\n\n").trim();
                }
            }
            return "Error: Invalid response format";
        } catch (Exception e) {
            return "Error processing response: " + e.getMessage();
        }
    }


private String buildPrompt(EmailRequest emailRequest) {
    StringBuilder promptBuilder = new StringBuilder();
    promptBuilder.append("You are an AI email assistant tasked with generating a professional and context-aware email reply. Follow these rules:\n");
    promptBuilder.append("- Do NOT include a subject line (e.g., 'Re:' or 'Fwd:').\n");
    promptBuilder.append("- Use double newlines (\\n\\n) to separate paragraphs.\n");
    promptBuilder.append("- Avoid HTML tags (e.g., <p>, <br>).\n");
    promptBuilder.append("- Keep the reply concise, natural, and tailored to the original email’s purpose and tone.\n");
    promptBuilder.append("- Include a polite closing (e.g., 'Best regards, [Your Name]' or similar, without specifying a name unless provided).\n\n");

    promptBuilder.append("Analyze the original email thread below to determine its intent (e.g., invitation, request, follow-up, complaint) and respond accordingly. Consider the following:\n");
    promptBuilder.append("- If the email is an invitation or event-related, note if the date has passed and suggest a future opportunity if appropriate.\n");
    promptBuilder.append("- If it’s a request, provide a clear action or response based on the context.\n");
    promptBuilder.append("- If it’s a complaint or issue, acknowledge it politely and propose a solution or next step.\n");
    promptBuilder.append("- Match the reply tone to the original email unless a specific tone is requested.\n\n");

    String tone = emailRequest.getTone() != null && !emailRequest.getTone().isEmpty() ? emailRequest.getTone() : "professional";
    promptBuilder.append("Use a '").append(tone).append("' tone. If no tone is specified or invalid, default to professional and polite.\n\n");

    promptBuilder.append("Original Email Thread:\n---\n");
    promptBuilder.append(emailRequest.getEmailContent());
    promptBuilder.append("\n---\n\n");

    promptBuilder.append("Additional Notes:\n");
    promptBuilder.append("- Check the email’s date and time (if provided) to adjust the response (e.g., apologize for a missed deadline).\n");
    promptBuilder.append("- If the thread is multi-message, prioritize the latest message but consider the full context.\n");
    promptBuilder.append("- Ensure the reply feels personal and relevant to the sender’s intent.\n");

    return promptBuilder.toString();
}
}



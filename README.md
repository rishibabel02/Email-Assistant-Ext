# AI Email Assistant for Gmail

This project is a productivity tool that integrates an AI assistant directly into the Gmail interface. It allows you to generate context-aware email replies with a single click, powered by a Spring Boot backend and the Google Gemini API.


---

##  Features

* **Seamless Gmail Integration**: Adds an "AI Reply" button directly to the Gmail compose toolbar.
* **Context-Aware Replies**: Reads the entire email thread to generate relevant, non-generic responses.
* **One-Click Generation**: Injects the generated draft directly into the reply box, ready for you to review and send.

---

##  Tech Stack

* **Backend**:
    * Java 17+ & Spring Boot 3
    * Spring WebFlux (`WebClient`)
    * Maven
* **AI Model**:
    * Google Gemini Pro
* **Frontend (Chrome Extension)**:
    * Vanilla JavaScript (ES6+)
    * HTML & CSS
    * Chrome Manifest V3

---

##  Setup and Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

* Java (JDK 17 or later)
* Apache Maven
* Google Chrome
* A **Google Gemini API Key** from [Google AI Studio](https://makersuite.google.com/)

### 1. Backend Setup (Spring Boot)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/rishibabel02/Email-Assistant-Ext.git
    cd "Email Assistant"
    ```

2.  **Configure API Keys**:
    Open the `src/main/resources/application.properties` file and paste the following content, replacing `YOUR_GEMINI_API_KEY_HERE` with your actual key.

    ```properties
    # Server Port
    server.port=8080

    # Gemini API Configuration
    gemini.api.url=[https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent)
    gemini.api.key=YOUR_GEMINI_API_KEY_HERE

    # Logging
    logging.level.com.email.writer.app=INFO
    ```
    > **Note**: For production, use environment variables to protect your API key.

3.  **Run the Backend**:
    From the project's root directory, run the server using Maven:
    ```bash
    mvn spring-boot:run
    ```
    The backend will now be running on `http://localhost:8080`.

### 2. Frontend Setup (Chrome Extension)

1.  **Open Chrome Extensions**: Navigate to `chrome://extensions` in your browser.
2.  **Enable Developer Mode**: Turn on the "Developer mode" toggle in the top-right corner.
3.  **Load the Extension**:
    * Click the **"Load unpacked"** button.
    * Select the folder that contains your extension's `manifest.json` and `content.js` files.

The "Email Assistant" extension will now be active. Refresh your Gmail tab to start using it.

---

## Usage Guide

1.  Open [Gmail](https://mail.google.com/).
2.  Click to reply to an email.
3.  The **"AI Reply"** button will appear in the compose window's toolbar.
4.  Click the button to generate a contextual reply.
5.  The AI-generated text will automatically be placed in the reply box. Review, edit if needed, and send!

---

